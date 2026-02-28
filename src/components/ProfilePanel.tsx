"use client";

import { useMemo, useState } from "react";
import { PLANS, type PlanType } from "@/lib/plans";
import { PlanBadge } from "@/components/PlanBadge";

export function ProfilePanel({
  current,
  onSelect,
}: {
  current: PlanType;
  onSelect: (plan: PlanType) => void;
}) {
  const [deployMenuOpen, setDeployMenuOpen] = useState(false);
  const [planMenuOpen, setPlanMenuOpen] = useState(false);
  const activePlan = useMemo(() => PLANS[current], [current]);
  const userName = "Virtual User";
  const avatarLetter = userName.charAt(0).toUpperCase();

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40">
      <h3 className="text-base font-semibold text-slate-100">Profil</h3>
      <p className="mt-1 text-sm text-slate-400">Planını buradan yönetebilirsin.</p>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">{avatarLetter}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-slate-400">developer@virtual.dev</p>
          </div>
          <PlanBadge plan={current} />

          <div className="relative ml-auto">
            <button
              onClick={() => setDeployMenuOpen((value) => !value)}
              className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs hover:border-slate-500"
            >
              Deploy
            </button>

            {deployMenuOpen && (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-700 bg-slate-900 p-1">
                {[
                  "GitHub",
                  "Netlify",
                  "Vercel",
                  "Railway",
                ].map((provider) => (
                  <button
                    key={provider}
                    className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-slate-800"
                    onClick={() => setDeployMenuOpen(false)}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Aktif Plan: {activePlan.label}</p>
            <p className="text-xs text-slate-400">${activePlan.monthlyPriceUsd}/ay · Depolama: {activePlan.storageLimitMb === "unlimited" ? "Sınırsız" : `${activePlan.storageLimitMb}MB`}</p>
          </div>

          <button
            onClick={() => setPlanMenuOpen((value) => !value)}
            className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs hover:border-slate-500"
          >
            Plan Değiştir
          </button>
        </div>

        {planMenuOpen && (
          <div className="mt-2 grid gap-1">
            {Object.values(PLANS).map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  onSelect(plan.id);
                  setPlanMenuOpen(false);
                }}
                className={`rounded-md border px-2 py-1.5 text-left text-xs ${current === plan.id ? "border-violet-400 bg-violet-500/10" : "border-slate-700 bg-slate-900 hover:border-slate-500"}`}
              >
                {plan.label} · {plan.storageLimitMb === "unlimited" ? "∞" : `${plan.storageLimitMb}MB`} · ${plan.monthlyPriceUsd}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
