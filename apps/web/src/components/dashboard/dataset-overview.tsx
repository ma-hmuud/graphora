"use client";

import { useEffect, useState } from "react";
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
      <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
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
      <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
        <p className="text-on-surface-variant">Dataset file not available.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
        <p className="text-on-surface-variant">
          Unable to parse dataset preview.
        </p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
          <p className="text-on-surface-variant text-xs">Rows</p>
          <p className="text-on-surface font-label-mono text-label-mono">
            {numberFormatter.format(data.rowCount)}
          </p>
        </div>
        <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
          <p className="text-on-surface-variant text-xs">Columns</p>
          <p className="text-on-surface font-label-mono text-label-mono">
            {data.columnCount}
          </p>
        </div>
        <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
          <p className="text-on-surface-variant text-xs">
            Unique values (sample)
          </p>
          <p className="text-on-surface font-label-mono text-label-mono">
            {numberFormatter.format(data.uniqueCount)}
          </p>
        </div>
        <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
          <p className="text-on-surface-variant text-xs">Preview rows</p>
          <p className="text-on-surface font-label-mono text-label-mono">
            {data.preview.length}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-on-surface-variant text-xs mb-3">Preview</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody>
              {data.preview.map((row, rowIndex) => (
                <tr
                  key={`row-${rowIndex}`}
                  className="border-b border-outline-variant/40"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="py-2 pr-4 text-on-surface-variant font-label-mono text-label-mono"
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
    </section>
  );
}

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

  useEffect(() => {
    if (!fileUrl || isLoading) {
      setState((prev) => ({ ...prev, isFetching: false }));
      return;
    }

    let isCancelled = false;
    setState({ data: undefined, error: undefined, isFetching: true });

    Papa.parse(fileUrl, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (isCancelled) return;
        const rows = (results.data as string[][]).filter(
          (row) => row.length > 0,
        );
        const rowCount = rows.length;
        const columnCount = rows[0]?.length ?? 0;
        const uniqueValues = new Set<string>();
        rows.forEach((row) => {
          row.forEach((cell) => {
            if (cell) uniqueValues.add(cell);
          });
        });

        setState({
          data: {
            rowCount,
            columnCount,
            preview: rows.slice(0, 10),
            uniqueCount: uniqueValues.size,
          },
          error: undefined,
          isFetching: false,
        });
      },
      error: (error: any) => {
        if (isCancelled) return;
        setState({ data: undefined, error, isFetching: false });
      },
    });

    return () => {
      isCancelled = true;
    };
  }, [fileUrl, isLoading]);

  return state;
}
