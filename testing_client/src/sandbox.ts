import { rm, mkdir } from "node:fs/promises";

export async function resetSandbox(sandboxPath: string) {
  await rm(sandboxPath, { recursive: true, force: true });
  await mkdir(sandboxPath, { recursive: true });
}

