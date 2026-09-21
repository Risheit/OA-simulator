export const InvalidRequest = "invalid request" as const;

export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message, { cause: InvalidRequest });
  }
}

export class InvalidFilePathError extends InvalidRequestError {
  constructor() {
    super("Invalid filepath given");
  }
}

export type Result<T> = { ok: true; val: T } | { ok: false; err: string };

export function ok<T>(val: T): Result<T>;
export function ok(): Result<void>;
export function ok<T>(val?: T): Result<T | void> {
  return { ok: true, val };
}

export function fail(msg: string): Result<unknown> {
  return { ok: false, err: msg };
}

export function assertEnvVariableDefined(name: string, val: unknown) {
  if (val === undefined || val === null) {
    throw new Error(`No ${name} found in environment variables`);
  }
}

export function isInvalidFilePath(path: string): boolean {
  const validPathRegex = /^[a-zA-Z0-9_.\-/]+$/;

  return !path || !validPathRegex.test(path);
}
