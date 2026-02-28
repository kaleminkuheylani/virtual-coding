export type PlanType = "free" | "starter" | "pro";

export type PlanConfig = {
  id: PlanType;
  label: string;
  monthlyPriceUsd: number;
  dailyAiLimit: number | "unlimited";
  storageLimitMb: number | "unlimited";
  deployLimit: number | "unlimited";
  packageManagerSupport: "none" | "uv" | "uv+bun";
  securityTier: string;
  canInstallPython: boolean;
  canInstallJavaScript: boolean;
};

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: "free",
    label: "Free",
    monthlyPriceUsd: 0,
    dailyAiLimit: 10,
    storageLimitMb: 100,
    deployLimit: 1,
    packageManagerSupport: "none",
    securityTier: "Temel komut filtreleme ve path-traversal koruması",
    canInstallPython: false,
    canInstallJavaScript: false,
  },
  starter: {
    id: "starter",
    label: "Starter",
    monthlyPriceUsd: 10,
    dailyAiLimit: 50,
    storageLimitMb: 300,
    deployLimit: "unlimited",
    packageManagerSupport: "uv",
    securityTier: "Gelişmiş komut doğrulama + uv izin listesi",
    canInstallPython: true,
    canInstallJavaScript: false,
  },
  pro: {
    id: "pro",
    label: "Pro",
    monthlyPriceUsd: 25,
    dailyAiLimit: "unlimited",
    storageLimitMb: "unlimited",
    deployLimit: "unlimited",
    packageManagerSupport: "uv+bun",
    securityTier: "Pro koruma: uv + bun güvenli bayrak/komut denetimleri",
    canInstallPython: true,
    canInstallJavaScript: true,
  },
};

export function getPlan(plan: string | null | undefined): PlanConfig {
  if (!plan) return PLANS.free;
  return PLANS[plan as PlanType] ?? PLANS.free;
}
