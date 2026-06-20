"use client";

import { useMemo, useRef, useState } from "react";
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
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-50 dark:bg-[#111420] border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-lg dark:shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {step === "columns"
                  ? "Configure Projection"
                  : "Create New Graph"}
              </h2>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === "select" ? (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 relative z-10">
                  Select a data source to begin initializing a new graph
                  projection.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => setStep("upload")}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-100/50 dark:hover:bg-black/35 p-4 rounded-xl flex items-center gap-4 group transition-colors duration-200 text-left relative z-10"
                  >
                    <div className="w-12 h-12 bg-primary-container/10 border-primary-container/20 group-hover:border-primary-container/40 dark:bg-[#c0c1ff]/10 dark:border-[#c0c1ff]/20 dark:group-hover:border-[#c0c1ff]/40 flex items-center justify-center text-primary-container dark:text-[#c0c1ff] transition-colors shrink-0">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-container dark:group-hover:text-[#c0c1ff] transition-colors text-sm">
                        Upload new dataset
                      </h3>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                        CSV supported
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setStep("existing")}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-100/50 dark:hover:bg-black/35 p-4 rounded-xl flex items-center gap-4 group transition-colors duration-200 text-left relative z-10"
                  >
                    <div className="w-12 h-12 bg-primary-container/10 rounded-xl border border-primary-container/20 group-hover:border-primary-container/40 flex items-center justify-center text-primary-container transition-colors shrink-0">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-container dark:group-hover:text-[#c0c1ff] transition-colors text-sm">
                        Use existing dataset
                      </h3>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                        Select from uploaded files
                      </p>
                    </div>
                  </button>
                </div>
              </>
            ) : step === "upload" ? (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 relative z-10">
                  Upload a dataset to validate the new pipeline.
                </p>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 relative z-10">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Dataset name
                    </label>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40 focus:bg-white dark:focus:bg-black/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="Customer Relations 2025"
                    />
                  </div>
                  <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 relative z-10">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 h-24 resize-none focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40 focus:bg-white dark:focus:bg-black/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="Short note about this dataset."
                    />
                  </div>
                  <div className="bg-slate-50 dark:bg-black/20 border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-4 relative z-10">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-3">
                      Dataset file
                    </label>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {file ? file.name : "No file selected"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Max 50MB. CSV only.
                        </p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition-colors"
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
                    className={`mt-4 text-xs font-medium relative z-10 ${
                      status === "error"
                        ? "text-red-400"
                        : status === "success"
                          ? "text-emerald-400"
                          : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </>
            ) : step === "existing" ? (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 relative z-10">
                  Choose an existing dataset to generate a graph.
                </p>
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search datasets"
                      className="w-full bg-transparent text-slate-800 dark:text-slate-200 text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {isDatasetsLoading ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      Loading datasets...
                    </p>
                  ) : filteredDatasets.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      No datasets found.
                    </p>
                  ) : (
                    filteredDatasets.map((dataset) => (
                      <button
                        key={dataset.id}
                        onClick={() => handleDatasetSelect(dataset)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 relative z-10 flex items-center justify-between group ${
                          selectedDataset?.id === dataset.id
                            ? "border-primary-container/40 bg-primary-container/10 text-primary-container dark:border-[#c0c1ff]/40 dark:bg-[#c0c1ff]/10 dark:text-[#c0c1ff]"
                            : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-100 dark:hover:bg-black/35"
                        }`}
                      >
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-container dark:group-hover:text-[#c0c1ff] transition-colors text-sm">
                            {dataset.name}
                          </h4>
                          {dataset.description && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {dataset.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-container dark:group-hover:text-[#c0c1ff] transition-colors" />
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 relative z-10">
                  Define the relationships by selecting the columns to be used
                  as nodes.
                </p>
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 relative z-10">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
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
                      className="w-full bg-white dark:bg-black/30 text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40 focus:bg-white dark:focus:bg-black/40 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder={`${selectedDataset?.name} Graph`}
                    />
                  </div>
                  <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 relative z-10">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Source Column (Origin Node)
                    </label>
                    {isHeadersLoading ? (
                      <div className="h-10 bg-slate-100 dark:bg-black/30 animate-pulse rounded-xl border border-slate-200 dark:border-white/10" />
                    ) : (
                      <select
                        value={graphConfig.sourceColumn}
                        onChange={(e) =>
                          setGraphConfig((prev) => ({
                            ...prev,
                            sourceColumn: e.target.value,
                          }))
                        }
                        className="w-full bg-white dark:bg-[#161a2b] text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40"
                      >
                        <option
                          value=""
                          className="bg-white text-slate-800 dark:bg-[#161a2b] dark:text-slate-200"
                        >
                          Select column...
                        </option>
                        {headers.map((h) => (
                          <option
                            key={`src-${h}`}
                            value={h}
                            className="bg-white text-slate-800 dark:bg-[#161a2b] dark:text-slate-200"
                          >
                            {h}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4 relative z-10">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Target Column (Destination Node)
                    </label>
                    {isHeadersLoading ? (
                      <div className="h-10 bg-slate-100 dark:bg-black/30 animate-pulse rounded-xl border border-slate-200 dark:border-white/10" />
                    ) : (
                      <select
                        value={graphConfig.targetColumn}
                        onChange={(e) =>
                          setGraphConfig((prev) => ({
                            ...prev,
                            targetColumn: e.target.value,
                          }))
                        }
                        className="w-full bg-white dark:bg-[#161a2b] text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-container/40 dark:focus:border-[#c0c1ff]/40"
                      >
                        <option
                          value=""
                          className="bg-white text-slate-800 dark:bg-[#161a2b] dark:text-slate-200"
                        >
                          Select column...
                        </option>
                        {headers.map((h) => (
                          <option
                            key={`dst-${h}`}
                            value={h}
                            className="bg-white text-slate-800 dark:bg-[#161a2b] dark:text-slate-200"
                          >
                            {h}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-between items-center relative z-10">
              {step !== "select" ? (
                <button
                  onClick={() =>
                    setStep(step === "columns" ? "existing" : "select")
                  }
                  className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                {step === "upload" && (
                  <button
                    onClick={handleUpload}
                    disabled={status === "uploading"}
                    className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-[#6c6fed] text-white font-semibold text-xs tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-[#6c6fed] text-white font-semibold text-xs tracking-wider uppercase transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
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
