"use client";

import { useMemo, useState } from "react";
import { getPlan, type PlanType } from "@/lib/plans";

export function usePlan(defaultPlan: PlanType = "free") {
  const [plan, setPlan] = useState<PlanType>(defaultPlan);
  const config = useMemo(() => getPlan(plan), [plan]);
  return { plan, setPlan, config };
}
