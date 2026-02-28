type SpawnShellConfig = {
  command: string;
  args: string[];
};

export function resolveCommandShell(command: string): SpawnShellConfig {
  if (process.platform === "win32") {
    return {
      command: process.env.COMSPEC ?? "powershell.exe",
      args: ["-NoLogo", "-NoProfile", "-Command", command],
    };
  }

  const shellPath = process.env.SHELL ?? "bash";
  return {
    command: shellPath,
    args: ["-lc", command],
  };
}

export function resolveInteractiveShell(): { command: string; args: string[] } {
  if (process.platform === "win32") {
    return {
      command: process.env.COMSPEC ?? "powershell.exe",
      args: ["-NoLogo"],
    };
  }

  return {
    command: process.env.SHELL ?? "bash",
    args: ["-l"],
  };
}

