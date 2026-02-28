import { getPlan, type PlanType } from "@/lib/plans";

const HARDBLOCK_COMMANDS = ["npm", "yarn", "pnpm", "pip", "sudo", "rm -rf /"];

export type CommandValidationResult =
  | { ok: true }
  | { ok: false; message: string; suggestion?: string };

export function guardPathTraversal(path: string): CommandValidationResult {
  if (path.includes("..")) {
    return {
      ok: false,
      message: "Path traversal blocked.",
      suggestion: "Use project-relative safe paths only.",
    };
  }
  return { ok: true };
}

export function validateCommand(command: string, plan: PlanType): CommandValidationResult {
  const normalized = command.trim().toLowerCase();
  if (HARDBLOCK_COMMANDS.some((blocked) => normalized.includes(blocked))) {
    return {
      ok: false,
      message: "Blocked command detected by security policy.",
      suggestion: "Use bun add (Pro) or uv pip install (Starter+).",
    };
  }

  if (normalized.startsWith("bun add") && !getPlan(plan).canInstallJavaScript) {
    return {
      ok: false,
      message: "JavaScript package installation is only available on Pro.",
      suggestion: "Upgrade to Pro to use bun add.",
    };
  }

  if (normalized.startsWith("uv pip install") && !getPlan(plan).canInstallPython) {
    return {
      ok: false,
      message: "Python package installation is only available on Starter and Pro.",
      suggestion: "Upgrade to Starter or Pro to use uv pip install.",
    };
  }

  return { ok: true };
}
