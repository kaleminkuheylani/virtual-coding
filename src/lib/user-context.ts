import { NextRequest } from "next/server";
import { getPlan, type PlanType } from "@/lib/plans";

export type UserContext = {
  id: string;
  plan: PlanType;
};

const DEMO_USER_ID = "demo-user";

export function getUserContext(_request: NextRequest): UserContext {
  const configuredPlan = getPlan(process.env.DEMO_USER_PLAN);

  return {
    id: DEMO_USER_ID,
    plan: configuredPlan.id,
  };
}
