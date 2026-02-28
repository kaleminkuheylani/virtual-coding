"use client";

import type { PlanType } from "@/lib/plans";

export function PlanBadge({ plan }: { plan: PlanType }) {
  return <span className="rounded-full border border-violet-400/60 bg-violet-500/10 px-3 py-1 text-xs uppercase text-violet-100">{plan}</span>;
}
