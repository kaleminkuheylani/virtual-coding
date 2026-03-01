import { spawn } from "node:child_process";
import type { PlanType } from "./plans";
import { validateCommand } from "./security";
import { resolveCommandShell } from "./shell";

export async function executeCommand(command: string, plan: PlanType, cwd: string): Promise<{ stdout: string; stderr: string; code: number | null }> {
  const guard = validateCommand(command, plan);
  if (!guard.ok) {
    return {
      stdout: "",
      stderr: `${guard.message}${guard.suggestion ? `\n${guard.suggestion}` : ""}`,
      code: 1,
    };
  }

  return new Promise((resolve) => {
    const shell = resolveCommandShell(command);
    const child = spawn(shell.command, shell.args, { cwd, env: process.env });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("close", (code) => resolve({ stdout, stderr, code }));
  });
}
