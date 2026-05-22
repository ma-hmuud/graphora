"use client";

import { X, UploadCloud, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGraphModal({ isOpen, onClose }: CreateGraphModalProps) {
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
            className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-8 max-w-md w-full shadow-2xl relative z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Create New Graph
              </h2>
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              Select a data source to begin initializing a new graph projection.
            </p>
            
            <div className="space-y-4">
              <button
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
            
            <div className="mt-8 pt-6 border-t border-outline-variant flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 font-label-mono text-label-mono text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
