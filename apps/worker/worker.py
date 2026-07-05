import asyncio
import csv
import io
import logging
import os
from typing import Any

import networkx as nx
import requests
from bullmq import Worker
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "info").upper(),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
log = logging.getLogger("graphora.worker")

REDIS_USERNAME = os.environ["REDIS_USERNAME"]
REDIS_PASSWORD = os.environ["REDIS_PASSWORD"]
REDIS_HOST = os.environ["REDIS_HOST"]
REDIS_PORT = os.environ["REDIS_PORT"]
SERVER_URL = os.environ["SERVER_URL"]


# ── Data Cleaning ──────────────────────────────────────────────────────────────

def clean_and_parse(csv_content: str, source_col: str | None = None, target_col: str | None = None) -> tuple[list[dict], list[str]]:
    """
    Returns (clean_rows, warnings).
    """
    # Try to detect delimiter
    delimiter = ","
    if csv_content:
        lines = csv_content.splitlines()
        if lines:
            first_line = lines[0]
            if "\t" in first_line and "," not in first_line:
                delimiter = "\t"
            elif ";" in first_line and "," not in first_line:
                delimiter = ";"
            log.info("Detected delimiter: '%s'", delimiter)

    reader = csv.DictReader(io.StringIO(csv_content), delimiter=delimiter)
    raw_headers = [h or "" for h in (reader.fieldnames or [])]
    headers = [h.strip().lstrip("\ufeff").lower() for h in raw_headers]
    warnings = []

    source_key = None
    target_key = None

    if source_col and target_col:
        log.info("Using user-specified columns: source='%s', target='%s'", source_col, target_col)
        # Find exact matches in raw headers
        for h in raw_headers:
            if h == source_col:
                source_key = h
            if h == target_col:
                target_key = h
    
    # Auto-detection if not specified or not found
    if not source_key or not target_key:
        synonyms = {
            "source": {"source", "src", "from"},
            "target": {"target", "dst", "to"},
        }

        for idx, header in enumerate(headers):
            if header in synonyms["source"] and source_key is None:
                source_key = raw_headers[idx]
            if header in synonyms["target"] and target_key is None:
                target_key = raw_headers[idx]

    log.info("Detected headers: %s", headers)
    log.info("Current keys - source: '%s', target: '%s'", source_key, target_key)

    if not source_key or not target_key:
        # Filter out empty headers for fallback
        non_empty_raw = [h for h in raw_headers if h.strip()]
        if len(non_empty_raw) >= 2:
            source_key = source_key or non_empty_raw[0]
            target_key = target_key or non_empty_raw[1]
            log.info("Fallback: using non-empty columns: '%s' -> '%s'", source_key, target_key)
            warnings.append(
                f"Source/target headers not found; using '{source_key}' and '{target_key}'",
            )
        else:
            raise ValueError(
                f"CSV must have at least two non-empty columns. Got: {raw_headers}"
            )

    has_weight = "weight" in headers
    clean_rows = []
    seen_edges = set()

    for i, row in enumerate(reader, start=2):
        source = row.get(source_key, "").strip()
        target = row.get(target_key, "").strip()

        if not source or not target:
            if i <= 5:
                log.debug("Row %d: empty value for source('%s') or target('%s')", i, source_key, target_key)
            warnings.append(f"Row {i}: empty source or target — skipped")
            continue

        if source == target:
            warnings.append(f"Row {i}: self-loop on '{source}' — skipped")
            continue

        weight = 1.0
        if has_weight:
            try:
                weight = float(row.get("weight", 1.0))
            except Exception:
                pass

        edge_key = (source, target)
        if edge_key in seen_edges:
            continue
        seen_edges.add(edge_key)

        clean_rows.append({"source": source, "target": target, "weight": weight})

    return clean_rows, warnings


def build_graph(clean_rows: list[dict]) -> nx.DiGraph:
    G = nx.DiGraph()
    for row in clean_rows:
        G.add_edge(row["source"], row["target"], weight=row["weight"])
    return G


# ── Metrics Computation ────────────────────────────────────────────────────────

def compute_graph_stats(G: nx.DiGraph) -> dict:
    is_weighted = any(
        d.get("weight", 1.0) != 1.0
        for _, _, d in G.edges(data=True)
    )
    return {
        "nodeCount":       G.number_of_nodes(),
        "edgeCount":       G.number_of_edges(),
        "density":          nx.density(G),
        "diameter":        nx.diameter(G.to_undirected()) if nx.is_connected(G.to_undirected()) else None,
        "averageDegree":   sum(dict(G.degree()).values()) / G.number_of_nodes() if G.number_of_nodes() > 0 else 0,
        "isDirected":      G.is_directed(),
        "isWeighted":      is_weighted,
        "componentsCount": nx.number_weakly_connected_components(G),
        "clusteringCoefficient": nx.average_clustering(G.to_undirected()),
    }


def compute_node_metrics(G: nx.DiGraph) -> dict[str, dict]:
    log.info("Computing metrics...")
    degree = nx.degree_centrality(G)
    betweenness = nx.betweenness_centrality(G, weight="weight")
    closeness = nx.closeness_centrality(G)
    pagerank = nx.pagerank(G, weight="weight")
    
    # Try computing eigenvector centrality. Handlers fallback in case of convergence/directed limitations.
    try:
        # For directed graphs, we use G.to_undirected() to guarantee eigenvector centrality calculation stability if needed, 
        # or try directly. Let's do G.to_undirected() to avoid convergence errors on arbitrary directed structures.
        eigencentrality = nx.eigenvector_centrality(G.to_undirected(), max_iter=1000, weight="weight")
    except Exception as e:
        log.warning("Eigenvector centrality calculation failed, falling back: %s", str(e))
        eigencentrality = degree

    return {
        node: {
            "pagerank":    pagerank.get(node, 0.0),
            "degreeCentrality": degree.get(node, 0.0),
            "betweennessCentrality": betweenness.get(node, 0.0),
            "closenessCentrality": closeness.get(node, 0.0),
            "eigenvectorCentrality": eigencentrality.get(node, 0.0),
        }
        for node in G.nodes()
    }




def fetch_csv_from_url(file_url: str) -> str:
    response = requests.get(file_url, timeout=60)
    response.raise_for_status()
    log.info("CSV snippet: %s", response.text[:100].replace("\n", "\\n"))
    return response.text


def send_results(
    graph_id: int,
    status: str,
    stats: dict | None,
    graph_data: dict | None,
    error_message: str | None = None,
) -> None:
    payload: dict[str, Any] = {
        "graphId": graph_id,
        "status": status,
        "metrics": stats,
        "graphData": graph_data,
        "errorMessage": error_message[:500] if error_message else None,
    }
    url = f"{SERVER_URL.rstrip('/')}/internal/graphs/complete"
    response = requests.post(url, json=payload, timeout=30)
    if not response.ok:
        log.error("Failed to send results: %s — %s", response.status_code, response.text)
        errorPayload: dict[str, Any] = {
        "graphId": graph_id,
        "status": status,
        "metrics": None,
        "graphData": None,
        "errorMessage": error_message[:500] if error_message else None,
    }
        res = requests.post(url, json=errorPayload, timeout=30)
        
    response.raise_for_status()

# ── Job handler ────────────────────────────────────────────────────────────────

async def process_job(job, job_token):
    graph_id = job.data.get("graphId")
    file_url = job.data.get("fileUrl")
    source_col = job.data.get("sourceColumn")
    target_col = job.data.get("targetColumn")

    log.info("Job %s started — graph %s", job.id, graph_id)
    log.info("Source column: %s", source_col)
    log.info("Target column: %s", target_col)

    try:
        csv_content = fetch_csv_from_url(file_url)
        clean_rows, warnings = clean_and_parse(csv_content, source_col, target_col)
        log.info("Clean rows: %d | Warnings: %d", len(clean_rows), len(warnings))

        if not clean_rows:
            raise ValueError("No valid edges remain. Check if selected columns have data.")

        G = build_graph(clean_rows)
        stats = compute_graph_stats(G)
        node_metrics = compute_node_metrics(G)

        communities = list(nx.community.louvain_communities(G.to_undirected(), weight="weight", seed=42))
        node_to_community = {node: i for i, comm in enumerate(communities) for node in comm}
        stats["communitiesCount"] = len(communities)

        layout = nx.spring_layout(G, seed=42)
        graph_data = {
            "nodes": [
                {
                    "id": str(node),
                    "x": float(pos[0]),
                    "y": float(pos[1]),
                    "community": node_to_community.get(node, 0),
                    "metrics": node_metrics.get(node, {}),
                }
                for node, pos in layout.items()
            ],
            "links": [
                {
                    "source": str(u),
                    "target": str(v),
                    "weight": float(d.get("weight", 1.0)),
                }
                for u, v, d in G.edges(data=True)
            ],
        }

        send_results(graph_id, "READY", stats, graph_data)
        log.info("Job %s done ✓", job.id)

    except Exception as e:
        log.error("Job %s failed: %s", job.id, str(e))
        if graph_id:
            try:
                send_results(graph_id, "FAILED", None, None, str(e))
            except Exception as post_error:
                log.error("Failed to report failure: %s", str(post_error))
        raise


# ── Entrypoint ─────────────────────────────────────────────────────────────────

async def main():
    log.info("Worker starting — Redis: %s", REDIS_HOST)
    Worker("graph-analysis", process_job, {"connection": {
        "username": REDIS_USERNAME,
        "password": REDIS_PASSWORD,
        "host": REDIS_HOST,
        "port": int(REDIS_PORT),
    }})
    print("Worker is running...")
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
