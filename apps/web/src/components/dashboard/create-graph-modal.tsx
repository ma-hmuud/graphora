"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  Database,
  ArrowRight,
  Search,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createDataset } from "@/lib/datasets";
import { tryCatch } from "@/lib/try-catch";
import { toast } from "sonner";
import { useDatasets } from "@/hooks/datasets/use-datasets";
import { apolloClient } from "@/lib/apollo-client";
import { CREATE_GRAPH_MUTATION } from "@/lib/graphql/mutations";
import { DATASET_HEADERS_QUERY } from "@/lib/graphql/queries";
import type { Dataset } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

interface CreateGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGraphModal({ isOpen, onClose }: CreateGraphModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<
    "select" | "upload" | "existing" | "columns"
  >("select");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [graphConfig, setGraphConfig] = useState({
    name: "",
    sourceColumn: "",
    targetColumn: "",
  });
  const [isHeadersLoading, setIsHeadersLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  const resetForm = () => {
    setStep("select");
    setName("");
    setDescription("");
    setFile(null);
    setSearch("");
    setSelectedDataset(null);
    setHeaders([]);
    setGraphConfig({
      name: "",
      sourceColumn: "",
      targetColumn: "",
    });
    setStatus("idle");
    setMessage("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    if (selected && !name) {
      setName(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const queryClient = useQueryClient();

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      setStatus("error");
      setMessage("Add a dataset name and file.");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading dataset to Graphora...");

    const { data, error } = await tryCatch(
      createDataset({
        name: name.trim(),
        description: description.trim() || undefined,
        file,
      }),
    );

    if (error) {
      setStatus("error");
      setMessage(error.message || "Upload failed.");
      return;
    }

    const created = data?.createDataset;
    if (created) {
      handleDatasetSelect(created);
    }

    queryClient.invalidateQueries({ queryKey: ["datasets"] });
    setStatus("success");
    toast("Dataset uploaded.");
  };

  const { data: datasets, isLoading: isDatasetsLoading } = useDatasets();

  const filteredDatasets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return datasets ?? [];
    return (datasets ?? []).filter((dataset) =>
      [dataset.name, dataset.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [datasets, search]);

  const handleDatasetSelect = async (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setIsHeadersLoading(true);
    setStep("columns");

    const result = await tryCatch(
      apolloClient.query({
        query: DATASET_HEADERS_QUERY,
        variables: { id: dataset.id },
        fetchPolicy: "network-only",
      }),
    );

    setIsHeadersLoading(false);
    if (result.error) {
      console.error(
        "[CreateGraphModal] Failed to fetch dataset headers:",
        result.error,
      );
      toast(`Failed to load dataset headers: ${result.error.message}`);
      return;
    }

    // result.data is the ApolloQueryResult, result.data.data is the GraphQL data
    const fetchedHeaders = result.data?.data?.datasetHeaders || [];
    console.log("[CreateGraphModal] Fetched headers:", fetchedHeaders);
    setHeaders(fetchedHeaders);

    // Auto-select common names
    const sourceKeys = ["source", "src", "from", "origin"];
    const targetKeys = ["target", "dst", "to", "destination"];

    const foundSource = fetchedHeaders.find((h: string) =>
      sourceKeys.includes(h.toLowerCase()),
    );
    const foundTarget = fetchedHeaders.find((h: string) =>
      targetKeys.includes(h.toLowerCase()),
    );

    if (foundSource)
      setGraphConfig((prev) => ({ ...prev, sourceColumn: foundSource }));
    else if (fetchedHeaders.length > 0)
      setGraphConfig((prev) => ({ ...prev, sourceColumn: fetchedHeaders[0] }));

    if (foundTarget)
      setGraphConfig((prev) => ({ ...prev, targetColumn: foundTarget }));
    else if (fetchedHeaders.length > 1)
      setGraphConfig((prev) => ({ ...prev, targetColumn: fetchedHeaders[1] }));
  };

  const handleCreateGraph = async () => {
    if (!selectedDataset) {
      toast("Select a dataset.");
      return;
    }
    if (!graphConfig.sourceColumn || !graphConfig.targetColumn) {
      toast("Select source and target columns.");
      return;
    }

    const variables = {
      input: {
        name: graphConfig.name.trim() || `${selectedDataset.name} Graph`,
        datasetId: selectedDataset.id,
        sourceColumn: graphConfig.sourceColumn,
        targetColumn: graphConfig.targetColumn,
      },
    };

    console.log("[CreateGraphModal] Creating graph with variables:", variables);
    handleClose();

    const { error } = await tryCatch(
      apolloClient.mutate({
        mutation: CREATE_GRAPH_MUTATION,
        variables,
      }),
    );

    queryClient.invalidateQueries({ queryKey: ["graphs"] });

    if (error) {
      toast(error.message || "Failed to create graph.");
      return;
    }

    toast("Graph processing started.");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#101521] border border-outline-variant rounded-DEFAULT p-8 max-w-lg w-full shadow-2xl relative z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {step === "columns"
                  ? "Configure Projection"
                  : "Create New Graph"}
              </h2>
              <button
                onClick={handleClose}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {step === "select" ? (
              <>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                  Select a data source to begin initializing a new graph
                  projection.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => setStep("upload")}
                    className="w-full bg-[#0F1117] border border-outline-variant hover:border-primary p-4 rounded-DEFAULT flex items-center gap-4 group transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-surface-container rounded border border-outline-variant group-hover:border-primary/50 flex items-center justify-center text-primary">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                        Upload new dataset
                      </h3>
                      <p className="font-label-mono text-label-mono text-on-surface-variant mt-1">
                        CSV supported
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setStep("existing")}
                    className="w-full bg-[#0F1117] border border-outline-variant hover:border-primary p-4 rounded-DEFAULT flex items-center gap-4 group transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-surface-container rounded border border-outline-variant group-hover:border-primary/50 flex items-center justify-center text-primary">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                        Use existing dataset
                      </h3>
                      <p className="font-label-mono text-label-mono text-on-surface-variant mt-1">
                        Select from uploaded files
                      </p>
                    </div>
                  </button>
                </div>
              </>
            ) : step === "upload" ? (
              <>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Upload a dataset to validate the new pipeline.
                </p>
                <div className="space-y-4">
                  <div className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                      Dataset name
                    </label>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full bg-transparent text-on-surface text-sm border border-outline-variant rounded-DEFAULT px-3 py-2 focus:outline-none focus:border-primary"
                      placeholder="Customer Relations 2025"
                    />
                  </div>
                  <div className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="w-full bg-transparent text-on-surface text-sm border border-outline-variant rounded-DEFAULT px-3 py-2 h-24 resize-none focus:outline-none focus:border-primary"
                      placeholder="Short note about this dataset."
                    />
                  </div>
                  <div className="bg-[#0B0F19] border border-dashed border-outline-variant rounded-DEFAULT p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-3">
                      Dataset file
                    </label>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-on-surface">
                          {file ? file.name : "No file selected"}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Max 50MB. CSV/JSON/GML.
                        </p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-outline-variant rounded-DEFAULT text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface hover:border-primary transition"
                        type="button"
                      >
                        {file ? "Replace" : "Choose"}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                {message && (
                  <div
                    className={`mt-4 text-sm ${
                      status === "error"
                        ? "text-red-300"
                        : status === "success"
                          ? "text-green-300"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </>
            ) : step === "existing" ? (
              <>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Choose an existing dataset to generate a graph.
                </p>
                <div className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-on-surface-variant" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search datasets"
                      className="w-full bg-transparent text-on-surface text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {isDatasetsLoading ? (
                    <p className="text-on-surface-variant">
                      Loading datasets...
                    </p>
                  ) : filteredDatasets.length === 0 ? (
                    <p className="text-on-surface-variant">
                      No datasets found.
                    </p>
                  ) : (
                    filteredDatasets.map((dataset) => (
                      <button
                        key={dataset.id}
                        onClick={() => handleDatasetSelect(dataset)}
                        className={`w-full text-left p-4 rounded-DEFAULT border transition-colors ${
                          selectedDataset?.id === dataset.id
                            ? "border-primary bg-primary/10"
                            : "border-outline-variant bg-[#0F1117] hover:border-primary"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-headline-sm text-headline-sm text-on-surface">
                              {dataset.name}
                            </h4>
                          </div>
                          <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Define the relationships by selecting the columns to be used
                  as nodes.
                </p>
                <div className="space-y-6">
                  <div className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-3">
                      Graph Name
                    </label>
                    <input
                      value={graphConfig.name}
                      onChange={(e) =>
                        setGraphConfig((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-on-surface text-sm border border-outline-variant rounded-DEFAULT px-3 py-2 focus:outline-none focus:border-primary"
                      placeholder={`${selectedDataset?.name} Graph`}
                    />
                  </div>
                  <div className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-3">
                      Source Column (Origin Node)
                    </label>
                    {isHeadersLoading ? (
                      <div className="h-10 bg-surface-container animate-pulse rounded" />
                    ) : (
                      <select
                        value={graphConfig.sourceColumn}
                        onChange={(e) =>
                          setGraphConfig((prev) => ({
                            ...prev,
                            sourceColumn: e.target.value,
                          }))
                        }
                        className="w-full bg-[#1E293B] text-on-surface text-sm border border-outline-variant rounded-DEFAULT px-3 py-2 focus:outline-none focus:border-primary"
                      >
                        <option value="">Select column...</option>
                        {headers.map((h) => (
                          <option key={`src-${h}`} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="bg-[#0B0F19] border border-outline-variant rounded-DEFAULT p-4">
                    <label className="block text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-3">
                      Target Column (Destination Node)
                    </label>
                    {isHeadersLoading ? (
                      <div className="h-10 bg-surface-container animate-pulse rounded" />
                    ) : (
                      <select
                        value={graphConfig.targetColumn}
                        onChange={(e) =>
                          setGraphConfig((prev) => ({
                            ...prev,
                            targetColumn: e.target.value,
                          }))
                        }
                        className="w-full bg-[#1E293B] text-on-surface text-sm border border-outline-variant rounded-DEFAULT px-3 py-2 focus:outline-none focus:border-primary"
                      >
                        <option value="">Select column...</option>
                        {headers.map((h) => (
                          <option key={`dst-${h}`} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center">
              {step !== "select" ? (
                <button
                  onClick={() =>
                    setStep(step === "columns" ? "existing" : "select")
                  }
                  className="px-4 py-2 font-label-mono text-label-mono text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 font-label-mono text-label-mono text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                {step === "upload" && (
                  <button
                    onClick={handleUpload}
                    disabled={status === "uploading"}
                    className="px-5 py-2 rounded-DEFAULT bg-inverse-primary hover:bg-primary-container text-white font-label-mono text-label-mono transition-colors shadow-[0_0_12px_rgba(192,193,255,0.2)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "uploading" ? "Uploading..." : "Upload"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {step === "columns" && (
                  <button
                    onClick={handleCreateGraph}
                    disabled={
                      !graphConfig.sourceColumn || !graphConfig.targetColumn
                    }
                    className="px-5 py-2 rounded-DEFAULT bg-inverse-primary hover:bg-primary-container text-white font-label-mono text-label-mono transition-colors shadow-[0_0_12px_rgba(192,193,255,0.2)] flex items-center gap-2 disabled:opacity-50"
                  >
                    Create Graph
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
