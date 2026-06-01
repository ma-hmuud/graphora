"use client";

import { useMemo, useRef, useState } from "react";
import { X, UploadCloud, Database, ArrowRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createDataset } from "@/lib/datasets";
import { tryCatch } from "@/lib/try-catch";
import { toast } from "sonner";
import { useDatasets } from "@/hooks/datasets/use-datasets";
import { apolloClient } from "@/lib/apollo-client";
import { CREATE_GRAPH_MUTATION } from "@/lib/graphql/mutations";
import type { Dataset } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

interface CreateGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGraphModal({ isOpen, onClose }: CreateGraphModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"select" | "upload" | "existing">("select");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
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
      setSelectedDataset(created);
    }

    queryClient.invalidateQueries({ queryKey: ["datasets"] });
    setStatus("success");
    toast("Dataset uploaded. Select it to create a graph.");
    setStep("existing");
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

  const handleCreateGraph = async () => {
    if (!selectedDataset) {
      toast("Select a dataset.");
      return;
    }
    handleClose();

    const { error } = await tryCatch(
      apolloClient.mutate({
        mutation: CREATE_GRAPH_MUTATION,
        variables: {
          input: {
            name: `${selectedDataset.name} Graph`,
            datasetId: selectedDataset.id,
          },
        },
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
                Create New Graph
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
                        CSV, JSON, GML supported
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
            ) : (
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
                        onClick={() => setSelectedDataset(dataset)}
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
                          <span className="text-on-surface-variant text-xs">
                            {dataset.rowCount ?? "-"} rows
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center">
              {step === "upload" || step === "existing" ? (
                <button
                  onClick={() => setStep("select")}
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
                {step === "existing" && (
                  <button
                    onClick={handleCreateGraph}
                    className="px-5 py-2 rounded-DEFAULT bg-inverse-primary hover:bg-primary-container text-white font-label-mono text-label-mono transition-colors shadow-[0_0_12px_rgba(192,193,255,0.2)] flex items-center gap-2"
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
