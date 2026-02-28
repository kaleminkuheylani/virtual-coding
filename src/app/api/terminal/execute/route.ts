import { NextRequest, NextResponse } from "next/server";
import { executeCommand } from "@/lib/executor";
import type { PlanType } from "@/lib/plans";
import { ensureWorkspace, userWorkspace } from "@/lib/workspace";

const USER_ID = "demo-user";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ stdout: "", stderr: "Invalid JSON payload.", code: 1 }, { status: 400 });
  }
  const command = String(body.command ?? "");
  const plan = (body.plan ?? "free") as PlanType;

  await ensureWorkspace(USER_ID);
  const result = await executeCommand(command, plan, userWorkspace(USER_ID));
  return NextResponse.json(result);
}
