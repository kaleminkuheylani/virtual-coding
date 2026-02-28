"use client";

import { PLANS, type PlanType } from "@/lib/plans";

export function PricingModal({
  current,
  onSelect,
}: {
  current: PlanType;
  onSelect: (plan: PlanType) => void;
}) {
  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">Pricing</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <button
            key={plan.id}
            className={`rounded-lg border p-3 text-left ${current === plan.id ? "border-blue-500" : ""}`}
            onClick={() => onSelect(plan.id)}
          >
            <p className="font-medium">{plan.label}</p>
            <p>${plan.monthlyPriceUsd}/month</p>
            <p>AI: {plan.dailyAiLimit === "unlimited" ? "Unlimited" : `${plan.dailyAiLimit}/day`}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
