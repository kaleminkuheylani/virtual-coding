"use client";

import { PLANS, type PlanType } from "@/lib/plans";

export function ProfilePanel({
  current,
  onSelect,
}: {
  current: PlanType;
  onSelect: (plan: PlanType) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40">
      <h3 className="text-base font-semibold text-slate-100">Profil</h3>
      <p className="mt-1 text-sm text-slate-400">Planını buradan yönetebilirsin.</p>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">VC</div>
        <div>
          <p className="text-sm font-medium">Virtual User</p>
          <p className="text-xs text-slate-400">developer@virtual.dev</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {Object.values(PLANS).map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelect(plan.id)}
            className={`w-full rounded-xl border px-3 py-2 text-left transition ${
              current === plan.id
                ? "border-violet-400 bg-violet-500/10"
                : "border-slate-800 bg-slate-950/30 hover:border-slate-600"
            }`}
          >
            <p className="text-sm font-semibold">{plan.label}</p>
            <p className="text-xs text-slate-400">${plan.monthlyPriceUsd}/ay · AI: {plan.dailyAiLimit === "unlimited" ? "Sınırsız" : `${plan.dailyAiLimit}/gün`}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
