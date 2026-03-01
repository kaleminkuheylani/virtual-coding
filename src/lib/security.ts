import { getPlan, type PlanType } from "./plans";

const HARDBLOCK_PATTERNS = [/\bnpm\b/, /\bnpx\b/, /\byarn\b/, /\bpnpm\b/, /^pip(\s|$)/, /\bpython\s+-m\s+pip\b/, /\bpip3\b/, /\bsudo\b/, /rm\s+-rf\s+\//];
const UNSAFE_INSTALL_FLAG_PATTERNS = [/(^|\s)--global(\s|$)/, /(^|\s)-g(\s|$)/, /(^|\s)--system(\s|$)/, /(^|\s)--break-system-packages(\s|$)/];

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
  const currentPlan = getPlan(plan);

  if (HARDBLOCK_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      ok: false,
      message: "Blocked command detected by security policy.",
      suggestion: "Use bun add (Pro) or uv pip install (Starter+).",
    };
  }

  if (UNSAFE_INSTALL_FLAG_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      ok: false,
      message: "Unsafe package install flag blocked.",
      suggestion: "Install packages only in the project scope without global/system flags.",
    };
  }

  if (normalized.startsWith("bun add") && !currentPlan.canInstallJavaScript) {
    return {
      ok: false,
      message: "JavaScript package installation is only available on Pro.",
      suggestion: "Upgrade to Pro to use bun add.",
    };
  }

  if (normalized.startsWith("uv pip install") && !currentPlan.canInstallPython) {
    return {
      ok: false,
      message: "Python package installation is only available on Starter and Pro.",
      suggestion: "Upgrade to Starter or Pro to use uv pip install.",
    };
  }

  if (normalized.startsWith("uv ") && !normalized.startsWith("uv pip install")) {
    return {
      ok: false,
      message: "Only uv pip install is allowed for security reasons.",
      suggestion: "Use uv pip install <package>.",
    };
  }

  if (normalized.startsWith("bun ") && !normalized.startsWith("bun add")) {
    return {
      ok: false,
      message: "Only bun add is allowed for security reasons.",
      suggestion: "Use bun add <package>.",
    };
  }

  return { ok: true };
}
