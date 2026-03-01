import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { guardPathTraversal } from "./security";

export const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT ?? "/workspace";

export function userWorkspace(userId: string): string {
  return path.join(WORKSPACE_ROOT, userId);
}

export function resolveUserPath(userId: string, relativePath = ""): string {
  const safety = guardPathTraversal(relativePath);
  if (!safety.ok) throw new Error(safety.message);
  return path.join(userWorkspace(userId), relativePath);
}

export async function ensureWorkspace(userId: string): Promise<string> {
  const root = userWorkspace(userId);
  await mkdir(root, { recursive: true });
  return root;
}

export async function listDirectory(userId: string, relativePath = ""): Promise<string[]> {
  const absolute = resolveUserPath(userId, relativePath);
  await ensureWorkspace(userId);
  return readdir(absolute);
}

export async function readWorkspaceFile(userId: string, relativePath: string): Promise<string> {
  const absolute = resolveUserPath(userId, relativePath);
  return readFile(absolute, "utf8");
}

export async function saveWorkspaceFile(userId: string, relativePath: string, content: string): Promise<void> {
  const absolute = resolveUserPath(userId, relativePath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content, "utf8");
}

export async function renameWorkspacePath(userId: string, fromPath: string, toPath: string): Promise<void> {
  const source = resolveUserPath(userId, fromPath);
  const target = resolveUserPath(userId, toPath);
  await mkdir(path.dirname(target), { recursive: true });
  await rename(source, target);
}

export async function removeWorkspacePath(userId: string, relativePath: string): Promise<void> {
  const absolute = resolveUserPath(userId, relativePath);
  const fsStat = await stat(absolute);
  if (fsStat.isDirectory()) {
    await rm(absolute, { recursive: true, force: true });
    return;
  }
  await rm(absolute, { force: true });
}
