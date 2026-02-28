export type PlanType = "free" | "starter" | "pro";

export type PlanConfig = {
  id: PlanType;
  label: string;
  monthlyPriceUsd: number;
  dailyAiLimit: number | "unlimited";
  canInstallPython: boolean;
  canInstallJavaScript: boolean;
};

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: "free",
    label: "Free",
    monthlyPriceUsd: 0,
    dailyAiLimit: 10,
    canInstallPython: false,
    canInstallJavaScript: false,
  },
  starter: {
    id: "starter",
    label: "Starter",
    monthlyPriceUsd: 10,
    dailyAiLimit: 50,
    canInstallPython: true,
    canInstallJavaScript: false,
  },
  pro: {
    id: "pro",
    label: "Pro",
    monthlyPriceUsd: 25,
    dailyAiLimit: "unlimited",
    canInstallPython: true,
    canInstallJavaScript: true,
  },
};

export function getPlan(plan: string | null | undefined): PlanConfig {
  if (!plan) return PLANS.free;
  return PLANS[plan as PlanType] ?? PLANS.free;
}
