"use client";

type PlanType = "free" | "starter" | "pro";

interface PlanInfo {
  name: string;
  price: string;
  features: string[];
  current: boolean;
}

interface ProfilePanelProps {
  current: PlanType;
  onSelect: (plan: PlanType) => void;
  userEmail?: string;
  onSignOut?: () => void;
}

const PLANS: Record<PlanType, PlanInfo> = {
  free: {
    name: "Free",
    price: "$0/ay",
    features: ["Temel editör", "5 dosya", "Sınırlı AI"],
    current: false,
  },
  starter: {
    name: "Starter",
    price: "$9/ay",
    features: ["Gelişmiş editör", "50 dosya", "Python desteği", "AI asistan"],
    current: false,
  },
  pro: {
    name: "Pro",
    price: "$29/ay",
    features: ["Tüm özellikler", "Sınırsız dosya", "Tüm diller", "Öncelikli AI", "Paket kurulumu"],
    current: false,
  },
};

export function ProfilePanel({
  current,
  onSelect,
  userEmail = "demo@virtual-ide.dev",
  onSignOut,
}: ProfilePanelProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/30">
      {/* User info */}
      <div className="flex items-center gap-3 border-b border-slate-800/50 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white ring-2 ring-violet-500/20">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{userEmail}</p>
          <p className="text-xs text-slate-500">
            <span className={`inline-flex items-center gap-1 ${
              current === "pro" ? "text-violet-400" : current === "starter" ? "text-blue-400" : "text-slate-400"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                current === "pro" ? "bg-violet-400" : current === "starter" ? "bg-blue-400" : "bg-slate-400"
              }`} />
              {PLANS[current].name} Plan
            </span>
          </p>
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            title="Çıkış yap"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Plan selector */}
      <div className="p-2 space-y-1">
        {(Object.keys(PLANS) as PlanType[]).map((planKey) => {
          const plan = PLANS[planKey];
          const isActive = current === planKey;

          return (
            <button
              key={planKey}
              onClick={() => onSelect(planKey)}
              className={`w-full rounded-lg p-2 text-left transition ${
                isActive
                  ? "bg-violet-600/20 ring-1 ring-violet-500/50"
                  : "hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  isActive ? "text-violet-300" : "text-slate-300"
                }`}>
                  {plan.name}
                </span>
                <span className={`text-xs ${
                  isActive ? "text-violet-400" : "text-slate-500"
                }`}>
                  {plan.price}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {plan.features.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
