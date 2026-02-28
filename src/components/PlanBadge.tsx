"use client";

import type { PlanType } from "@/lib/plans";

export function PlanBadge({ plan }: { plan: PlanType }) {
  return <span className="rounded-full border px-3 py-1 text-xs uppercase">{plan}</span>;
}
