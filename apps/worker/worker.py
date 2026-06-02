import asyncio
import csv
import io
import logging
import os

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

def clean_and_parse(csv_content: str) -> tuple[list[dict], list[str]]:
    """
    Returns (clean_rows, warnings).
    Each clean row is guaranteed to have: source, target, weight (float).
    """
    reader = csv.DictReader(io.StringIO(csv_content))
    raw_headers = [h or "" for h in (reader.fieldnames or [])]
    headers = [h.strip().lstrip("\ufeff").lower() for h in raw_headers]
    warnings = []

    source_key = None
    target_key = None

    synonyms = {
        "source": {"source", "src", "from"},
        "target": {"target", "dst", "to"},
    }

    for idx, header in enumerate(headers):
        if header in synonyms["source"] and source_key is None:
            source_key = raw_headers[idx]
        if header in synonyms["target"] and target_key is None:
            target_key = raw_headers[idx]

    if not source_key or not target_key:
        if len(raw_headers) >= 2:
            source_key = raw_headers[0]
            target_key = raw_headers[1]
            warnings.append(
                "Source/target headers not found; using first two columns as source/target",
            )
        else:
            raise ValueError(
                f"CSV must have at least two columns. Got: {reader.fieldnames}"
            )

    has_weight = "weight" in headers
    clean_rows = []
    seen_edges = set()

    for i, row in enumerate(reader, start=2):  # start=2 — row 1 is header
        # normalize keys to lowercase
        row = {
            (k.strip().lstrip("\ufeff").lower() if k else ""): (v.strip() if v else "")
            for k, v in row.items()
            if k
        }

        source = row.get(source_key.strip().lstrip("\ufeff").lower(), "")
        target = row.get(target_key.strip().lstrip("\ufeff").lower(), "")

        # drop rows with empty source or target
        if not source or not target:
            warnings.append(f"Row {i}: empty source or target — skipped")
            continue

        # drop self-loops
        if source == target:
            warnings.append(f"Row {i}: self-loop on '{source}' — skipped")
            continue

        # parse weight — default to 1.0 on bad values
        weight = 1.0
        if has_weight:
            raw_w = row.get("weight", "")
            try:
                weight = float(raw_w)
                if weight <= 0:
                    warnings.append(f"Row {i}: non-positive weight '{raw_w}' — defaulting to 1.0")
                    weight = 1.0
            except (ValueError, TypeError):
                warnings.append(f"Row {i}: invalid weight '{raw_w}' — defaulting to 1.0")

        # drop duplicate edges (keep first occurrence)
        edge_key = (source, target)
        if edge_key in seen_edges:
            warnings.append(f"Row {i}: duplicate edge ({source} → {target}) — skipped")
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
        "isDirected":      G.is_directed(),
        "isWeighted":      is_weighted,
        "componentsCount": nx.number_weakly_connected_components(G),
    }


def compute_node_metrics(G: nx.DiGraph) -> dict[str, dict]:
    log.info("Computing degree centrality...")
    degree = nx.degree_centrality(G)

    log.info("Computing betweenness centrality...")
    betweenness = nx.betweenness_centrality(G, weight="weight")

    log.info("Computing closeness centrality...")
    closeness = nx.closeness_centrality(G)

    log.info("Computing PageRank...")
    pagerank = nx.pagerank(G, weight="weight")

    return {
        node: {
            "degree":      degree.get(node, 0.0),
            "betweenness": betweenness.get(node, 0.0),
            "closeness":   closeness.get(node, 0.0),
            "pagerank":    pagerank.get(node, 0.0),
        }
        for node in G.nodes()
    }


def fetch_csv_from_url(file_url: str) -> str:
    response = requests.get(file_url, timeout=60)
    response.raise_for_status()
    return response.text


def send_results(
    graph_id: str,
    status: str,
    stats: dict | None,
    graph_data: dict | None,
    error_message: str | None = None,
) -> None:
    payload = {
        "graphId": int(graph_id),
        "status": status,
        "metrics": stats,
        "graphData": graph_data,
        "errorMessage": error_message,
    }
    url = f"{SERVER_URL.rstrip('/')}/internal/graphs/complete"
    response = requests.post(url, json=payload, timeout=30)
    response.raise_for_status()


# ── Job handler ────────────────────────────────────────────────────────────────

async def process_job(job, job_token):
    graph_id = job.data.get("graphId")
    file_url = job.data.get("fileUrl")

    log.info("Job %s started — graph %s", job.id, graph_id)

    try:
        # 1. fetch
        log.info("Fetching CSV from URL")
        csv_content = fetch_csv_from_url(file_url)

        # 2. clean
        log.info("Cleaning CSV data...")
        clean_rows, warnings = clean_and_parse(csv_content)
        log.info("Clean rows: %d | Warnings: %d", len(clean_rows), len(warnings))

        if not clean_rows:
            raise ValueError("No valid edges remain after cleaning — check your CSV format.")

        # 3. build graph
        G = build_graph(clean_rows)

        # 4. compute
        stats = compute_graph_stats(G)
        node_metrics = compute_node_metrics(G)

        log.info("Computing communities...")
        communities = list(
            nx.community.louvain_communities(G.to_undirected(), weight="weight", seed=42)
        )
        node_to_community = {}
        for i, comm in enumerate(communities):
            for node in comm:
                node_to_community[node] = i

        stats["communitiesCount"] = len(communities)
        log.info("Stats: %s", stats)

        # 5. layout + graph data
        layout = nx.spring_layout(G, seed=42)
        graph_data = {
            "nodes": [
                {
                    "id": str(node),
                    "x": float(pos[0]),
                    "y": float(pos[1]),
                    "community": node_to_community.get(node, 0),
                    "metrics": {
                        "degree": node_metrics.get(node, {}).get("degree", 0.0),
                        "betweenness": node_metrics.get(node, {}).get("betweenness", 0.0),
                        "closeness": node_metrics.get(node, {}).get("closeness", 0.0),
                        "pagerank": node_metrics.get(node, {}).get("pagerank", 0.0),
                    },
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

        # 6. send results to server
        send_results(graph_id, "READY", stats, graph_data)
        log.info("Job %s done ✓", job.id)

        return {"nodeCount": stats["nodeCount"], "edgeCount": stats["edgeCount"]}

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
    log.info("Graphora worker starting — Redis: %s", REDIS_HOST)
    worker = Worker("graph-analysis", process_job, {"connection": {
        "username": REDIS_USERNAME,
        "password": REDIS_PASSWORD,
        "host": REDIS_HOST,
        "port": int(REDIS_PORT),
    }})
    log.info("Worker ready — listening for jobs...")
    await asyncio.Event().wait()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
