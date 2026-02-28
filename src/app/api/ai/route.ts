import { NextRequest, NextResponse } from "next/server";
import { runAiPrompt, verifyAiProviderKey, type AiProvider } from "@/lib/ai";
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
  const body = (await request.json()) as {
    prompt?: string;
    apiKey?: string;
    model?: string;
    provider?: AiProvider;
    plan?: PlanType;
    action?: "verify" | "prompt";
  };
  const userId = "demo-user";
  const plan = (body.plan ?? "free") as PlanType;

  if (body.action === "verify") {
    try {
      const ok = await verifyAiProviderKey({
        provider: body.provider ?? "openrouter",
        apiKey: body.apiKey,
        model: body.model,
      });
      return NextResponse.json({ ok });
    } catch {
      return NextResponse.json({ ok: false, error: "Provider doğrulanamadı." }, { status: 401 });
    }
  }

  if (!consumeAiQuota(userId, plan)) {
    return NextResponse.json({ error: "Daily AI quota exceeded." }, { status: 429 });
  }

  try {
    const reply = await runAiPrompt({
      prompt: body.prompt ?? "",
      provider: body.provider,
      apiKey: body.apiKey,
      model: body.model,
    });

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "AI isteği başarısız oldu." }, { status: 500 });
  }
}
