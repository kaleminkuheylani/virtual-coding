import { NextRequest, NextResponse } from "next/server";
import { executeCommand } from "@/lib/executor";
import { getUserContext } from "@/lib/user-context";
import { ensureWorkspace, userWorkspace } from "@/lib/workspace";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const command = String(body.command ?? "");
  const user = getUserContext(request);

  await ensureWorkspace(user.id);
  const result = await executeCommand(command, user.plan, userWorkspace(user.id));
  return NextResponse.json(result);
}
