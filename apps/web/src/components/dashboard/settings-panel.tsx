"use client";

import { Copy, KeyRound, ShieldCheck } from "lucide-react";

const apiKeys = [
  {
    id: "prod",
    label: "Production",
    key: "gr_prod_49f2...a91d",
    updated: "Rotated 8 days ago",
  },
  {
    id: "staging",
    label: "Staging",
    key: "gr_stg_02a1...c7ef",
    updated: "Rotated 24 days ago",
  },
];

export function SettingsPanel() {
  return (
    <section className="bg-[#1E293B] border border-outline-variant rounded-DEFAULT p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Settings
          </h3>
          <p className="text-on-surface-variant font-body-md text-body-md">
            API keys and subscription controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              <h4 className="font-headline-sm text-headline-sm text-on-surface">
                API Keys
              </h4>
            </div>
            <button className="text-primary font-label-mono text-label-mono">
              Rotate
            </button>
          </div>
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between bg-surface-container-highest/50 border border-outline-variant/40 rounded-DEFAULT px-3 py-2"
              >
                <div>
                  <p className="text-on-surface font-label-mono text-label-mono">
                    {apiKey.label}
                  </p>
                  <p className="text-on-surface-variant text-xs font-label-mono">
                    {apiKey.key}
                  </p>
                </div>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
            <p className="text-on-surface-variant text-xs">
              {apiKeys[0].updated}
            </p>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant/60 rounded-DEFAULT p-4 flex flex-col justify-between">
          <div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">
              Subscription
            </h4>
            <p className="text-on-surface-variant text-sm mb-4">
              Pro plan active. 12 seats · 4 active workspaces.
            </p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-full rounded-full bg-outline-variant/40 overflow-hidden">
                <div className="h-full w-2/3 bg-primary" />
              </div>
              <span className="text-on-surface-variant text-xs font-label-mono">
                68%
              </span>
            </div>
          </div>
          <button className="mt-6 w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-DEFAULT font-label-mono text-label-mono">
            Manage subscription
          </button>
        </div>
      </div>
    </section>
  );
}
