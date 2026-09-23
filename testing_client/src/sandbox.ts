import {
  rm,
  mkdir,
  writeFile,
  readFile,
  stat,
  readdir,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { ok, Result, ServerIssueError } from "./errors.js";
import { fail } from "node:assert";
import { existsSync } from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const failFileNotFound = () => fail("File not found");
const failInvalidAccess = () => fail("Accessing files outside of sandbox");

function isOutsideSandbox(sandboxPath: string, path: string) {
  const relativePath = relative(sandboxPath, path);

  return relativePath.startsWith("..") || isAbsolute(relativePath);
}

export async function resetSandbox(sandboxPath: string) {
  await rm(sandboxPath, { recursive: true, force: true });
  await mkdir(sandboxPath, { recursive: true });
}

type ReadFileResult = Awaited<ReturnType<typeof readFile>>;
export async function readSandboxFile(
  sandboxPath: string,
  filePath: string,
): Promise<Result<ReadFileResult>> {
  const fullPath = join(sandboxPath, filePath);

  if (isOutsideSandbox(sandboxPath, fullPath)) {
    return failInvalidAccess();
  }

  if (!existsSync(fullPath)) {
    return failFileNotFound();
  }

  const fileMetadata = await stat(fullPath);
  if (fileMetadata.isDirectory()) {
    return fail("Trying to read a directory.");
  }

  const buffer = await readFile(fullPath);
  return ok(buffer);
}

type ValidFileType = Parameters<typeof writeFile>[1];
export async function writeSandboxFile(
  sandboxPath: string,
  filePath: string,
  file: ValidFileType,
): Promise<Result<void>> {
  const fullPath = join(sandboxPath, filePath);

  if (isOutsideSandbox(sandboxPath, fullPath)) {
    return failInvalidAccess();
  }

  if (resolve(sandboxPath) === resolve(fullPath)) {
    return fail("Cannot delete root");
  }

  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, file);

  return ok();
}

export async function rmSandboxFile(
  sandboxPath: string,
  filePath: string,
): Promise<Result<void>> {
  const fullPath = join(sandboxPath, filePath);

  if (isOutsideSandbox(sandboxPath, fullPath)) {
    return failInvalidAccess();
  }

  if (!existsSync(fullPath)) {
    return failFileNotFound();
  }

  await rm(fullPath, { recursive: true });
  return ok();
}

interface DirectoryEntry {
  name: string;
  isDirectory: boolean;
}

export async function lsSandbox(
  sandboxPath: string,
  filePath: string,
): Promise<Result<DirectoryEntry[]>> {
  const fullPath = join(sandboxPath, filePath);

  if (isOutsideSandbox(sandboxPath, fullPath)) {
    return failInvalidAccess();
  }

  if (!existsSync(fullPath)) {
    return failFileNotFound();
  }

  const fileMetadata = await stat(fullPath);
  if (!fileMetadata.isDirectory()) {
    return fail("Trying to read something that isn't directory.");
  }

  const entries = await readdir(fullPath, { withFileTypes: true });
  const cleanedEntries = entries.map((entry) => ({
    name: entry.name,
    isDirectory: entry.isDirectory(),
  }));

  return ok(cleanedEntries);
}

export async function execSandboxCommand(
  sandboxPath: string,
  cmd: string,
): Promise<Record<string, string>> {
  const execAsync = promisify(exec);
  return execAsync(cmd, { timeout: 1000, cwd: sandboxPath, env: {} });
}
