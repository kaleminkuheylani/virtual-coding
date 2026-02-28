"use client";

import { useMemo, useState } from "react";
import { PLANS, type PlanType } from "@/lib/plans";
import { PlanBadge } from "@/components/PlanBadge";
import type { AuthUser } from "@/hooks/useAuth";

export function ProfilePanel({
  current,
  onSelect,
  user,
  onSignOut,
}: {
  current: PlanType;
  onSelect: (plan: PlanType) => void;
  user: AuthUser | null;
  onSignOut: () => void;
}) {
  const [planMenuOpen, setPlanMenuOpen] = useState(false);
  const [deployMenuOpen, setDeployMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const activePlan = useMemo(() => PLANS[current], [current]);

  const displayEmail = user?.email ?? "demo@virtual.dev";
  const avatarLetter = displayEmail.charAt(0).toUpperCase();
  const isDemo = user?.isDemo ?? true;

  async function handleSignOut() {
    setSigningOut(true);
    await onSignOut();
  }

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl shadow-slate-950/40">
      {/* User info row */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-sm font-semibold text-violet-300 ring-1 ring-violet-500/20">
          {avatarLetter}
          {isDemo && (
            <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 px-1 py-0 text-[9px] font-bold leading-4 text-black">
              D
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-100">{displayEmail}</p>
          <div className="flex items-center gap-1.5">
            <PlanBadge plan={current} />
            {isDemo && <span className="text-[10px] text-amber-500/80">Demo mod</span>}
          </div>
        </div>

        <button
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          title="Çıkış yap"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:border-red-800 hover:bg-red-950/30 hover:text-red-400 disabled:opacity-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

      {/* Plan info */}
      <div className="mt-3 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200">{activePlan.label} Plan</p>
            <p className="text-[11px] text-slate-500">
              {activePlan.monthlyPriceUsd === 0 ? "Ücretsiz" : `$${activePlan.monthlyPriceUsd}/ay`}
              {" · "}
              {activePlan.storageLimitMb === "unlimited" ? "∞ depolama" : `${activePlan.storageLimitMb}MB`}
            </p>
          </div>
          <button
            onClick={() => setPlanMenuOpen((v) => !v)}
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 transition hover:border-violet-600/50 hover:bg-violet-950/30 hover:text-violet-300"
          >
            Değiştir
          </button>
        </div>

        {planMenuOpen && (
          <div className="mt-2 grid gap-1">
            {Object.values(PLANS).map((plan) => (
              <button
                key={plan.id}
                onClick={() => { onSelect(plan.id); setPlanMenuOpen(false); }}
                className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                  current === plan.id
                    ? "border-violet-500/40 bg-violet-950/40 text-violet-200"
                    : "border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60"
                }`}
              >
                <span className="font-medium">{plan.label}</span>
                <span className="text-slate-500">
                  {plan.storageLimitMb === "unlimited" ? "∞" : `${plan.storageLimitMb}MB`}
                  {" · "}
                  {plan.monthlyPriceUsd === 0 ? "Ücretsiz" : `$${plan.monthlyPriceUsd}`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Deploy quick access */}
      <div className="relative mt-3">
        <button
          onClick={() => setDeployMenuOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <span className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Deploy
          </span>
          <svg className={`h-3 w-3 text-slate-500 transition-transform ${deployMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {deployMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl shadow-slate-950/60">
            {["Railway", "Vercel", "Netlify", "GitHub Pages"].map((provider) => (
              <button
                key={provider}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
                onClick={() => setDeployMenuOpen(false)}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                {provider}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
