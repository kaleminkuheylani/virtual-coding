import { NextRequest, NextResponse } from "next/server";
import { runAiPrompt } from "@/lib/ai";
import { getPlan, type PlanType } from "@/lib/plans";

const inMemoryUsage = new Map<string, { date: string; count: number }>();

function consumeAiQuota(userId: string, plan: PlanType): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const usage = inMemoryUsage.get(userId);
  const config = getPlan(plan);

  if (!usage || usage.date !== today) {
    inMemoryUsage.set(userId, { date: today, count: 1 });
    return true;
  }

  if (config.dailyAiLimit !== "unlimited" && usage.count >= config.dailyAiLimit) {
    return false;
  }

  usage.count += 1;
  inMemoryUsage.set(userId, usage);
  return true;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const userId = "demo-user";
  const plan = (body.plan ?? "free") as PlanType;

  if (!consumeAiQuota(userId, plan)) {
    return NextResponse.json({ error: "Daily AI quota exceeded." }, { status: 429 });
  }

  const reply = await runAiPrompt({
    prompt: body.prompt,
    apiKey: body.apiKey,
    model: body.model,
  });

  return NextResponse.json({ reply });
}
