"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { Skeleton } from "@/components/skeleton";

type DatasetOverviewProps = {
  fileUrl?: string | null;
  isLoading: boolean;
};

type OverviewMetrics = {
  rowCount: number;
  columnCount: number;
  preview: string[][];
  uniqueCount: number;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function DatasetOverview({ fileUrl, isLoading }: DatasetOverviewProps) {
  const { data, error, isFetching } = usePapaPreview(fileUrl, isLoading);

  if (isLoading || isFetching) {
    return (
      <section className="bg-slate-50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`overview-skeleton-${index}`} className="h-20" />
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24" />
        </div>
      </section>
    );
  }

  if (!fileUrl) {
    return (
      <section className="bg-slate-50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <p className="text-slate-400 italic text-sm text-center py-4">
          Dataset file not available.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-slate-50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <p className="text-red-400 italic text-sm text-center py-4">
          Unable to parse dataset preview.
        </p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Rows
          </span>
          <p className="text-base font-mono font-bold dark:text-slate-200 text-slate-800">
            {data.rowCount}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Columns
          </span>
          <p className="text-base font-mono font-bold dark:text-slate-200 text-slate-800">
            {data.columnCount}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Unique values (sample)
          </span>
          <p className="text-base font-mono font-bold dark:text-slate-200 text-slate-800">
            {numberFormatter.format(data.uniqueCount)}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Preview rows
          </span>
          <p className="text-base font-mono font-bold dark:text-slate-200 text-slate-800">
            {data.preview.length}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-3">
          Preview
        </span>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-4">
          <table className="w-full text-left border-collapse">
            <tbody>
              {data.preview.map((row, rowIndex) => (
                <tr
                  key={`row-${rowIndex}`}
                  className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="py-2.5 pr-4 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-nowrap"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const previewCache = new Map<string, OverviewMetrics>();

function usePapaPreview(
  fileUrl: string | null | undefined,
  isLoading: boolean,
) {
  const [state, setState] = useState<{
    data?: OverviewMetrics;
    error?: Error;
    isFetching: boolean;
  }>({
    data: undefined,
    error: undefined,
    isFetching: false,
  });

  const cacheKey = useMemo(() => fileUrl ?? "", [fileUrl]);

  useEffect(() => {
    if (!fileUrl || isLoading) {
      setState((prev) => ({ ...prev, isFetching: false }));
      return;
    }

    if (cacheKey && previewCache.has(cacheKey)) {
      setState({
        data: previewCache.get(cacheKey),
        error: undefined,
        isFetching: false,
      });
      return;
    }

    let isCancelled = false;
    setState({ data: undefined, error: undefined, isFetching: true });

    Papa.parse(fileUrl, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<string[]>) => {
        if (isCancelled) return;
        const rows = results.data.filter((row: string[]) => row.length > 0);
        const rowCount = rows.length;
        const columnCount = rows[0]?.length ?? 0;
        const uniqueValues = new Set<string>();
        rows.forEach((row: string[]) => {
          row.forEach((cell: string) => {
            if (cell) uniqueValues.add(cell);
          });
        });

        const metrics = {
          rowCount,
          columnCount,
          preview: rows.slice(0, 10),
          uniqueCount: uniqueValues.size,
        };
        previewCache.set(cacheKey, metrics);
        setState({ data: metrics, error: undefined, isFetching: false });
      },
      error: (error: Error) => {
        if (isCancelled) return;
        setState({ data: undefined, error, isFetching: false });
      },
    });

    return () => {
      isCancelled = true;
    };
  }, [cacheKey, fileUrl, isLoading]);

  return state;
}
