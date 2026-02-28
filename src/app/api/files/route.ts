import { NextRequest, NextResponse } from "next/server";
import {
  listDirectory,
  readWorkspaceFile,
  removeWorkspacePath,
  renameWorkspacePath,
  saveWorkspaceFile,
} from "@/lib/workspace";

const USER_ID = "demo-user";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") ?? "";
  const type = request.nextUrl.searchParams.get("type") ?? "list";

  if (type === "file") {
    const content = await readWorkspaceFile(USER_ID, path);
    return NextResponse.json({ path, content });
  }

  const entries = await listDirectory(USER_ID, path);
  return NextResponse.json({ path, entries });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = body.action as "save" | "rename" | "delete";

  if (action === "save") {
    await saveWorkspaceFile(USER_ID, body.path, body.content ?? "");
  }

  if (action === "rename") {
    await renameWorkspacePath(USER_ID, body.fromPath, body.toPath);
  }

  if (action === "delete") {
    await removeWorkspacePath(USER_ID, body.path);
  }

  return NextResponse.json({ success: true });
}
