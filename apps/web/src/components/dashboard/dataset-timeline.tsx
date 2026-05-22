"use client";

import { cn } from "@graphora/ui/lib/utils";

interface Version {
  id: string;
  time: string;
  name: string;
  author: string;
  isLatest?: boolean;
}

const mockVersions: Version[] = [
  {
    id: "1",
    time: "Today, 10:45 AM",
    name: "Customer_Data_v4.csv",
    author: "Uploaded by System Architect",
    isLatest: true,
  },
  {
    id: "2",
    time: "Yesterday, 14:20 PM",
    name: "Fraud_Indicators_v1.json",
    author: "Automated sync completed",
  },
  {
    id: "3",
    time: "Oct 24, 09:15 AM",
    name: "Supply_Chain_Base.gml",
    author: "Uploaded via API",
  },
  {
    id: "4",
    time: "Oct 20, 16:00 PM",
    name: "Customer_Data_v3.csv",
    author: "Archived version",
  },
];

export function DatasetTimeline() {
  return (
    <div className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6 flex flex-col h-125">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6">
        Dataset Versions
      </h3>
      <div className="grow overflow-y-auto relative pr-2 custom-scrollbar">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-outline-variant/50" />
        
        <div className="space-y-6 relative">
          {mockVersions.map((version) => (
            <div key={version.id} className="flex gap-4 relative">
              {/* Node */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full bg-[#1E293B] border z-10 shrink-0 flex items-center justify-center",
                  version.isLatest 
                    ? "border-2 border-primary shadow-[0_0_8px_rgba(192,193,255,0.4)]" 
                    : "border-outline-variant"
                )}
              >
                {version.isLatest && <div className="w-2 h-2 bg-primary rounded-full" />}
              </div>
              
              <div className="pt-1">
                <p className={cn(
                  "font-label-mono text-label-mono mb-1",
                  version.isLatest ? "text-primary" : "text-on-surface-variant"
                )}>
                  {version.time}
                </p>
                <h4 className={cn(
                  "font-headline-sm text-on-surface text-sm",
                  !version.isLatest && "opacity-80"
                )}>
                  {version.name}
                </h4>
                <p className="font-body-md text-on-surface-variant text-xs mt-1">
                  {version.author}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
