import express, {
  NextFunction,
  type Express,
  type Request,
  type Response,
} from "express";
import { env } from "node:process";
import { existsSync } from "node:fs";
import {
  execSandboxCommand,
  lsSandbox,
  readSandboxFile,
  resetSandbox,
  rmSandboxFile,
  writeSandboxFile,
} from "./sandbox.js";
import {
  assertEnvVariableDefined,
  InvalidRequest,
  InvalidFilePathError,
  isInvalidFilePath,
  InvalidRequestError,
} from "./errors.js";
import { contentType } from "mime-types";

assertEnvVariableDefined("PORT", env.PORT); // Server port
assertEnvVariableDefined("SANDBOX_PATH", env.SANDBOX_PATH); // Absolute file path to sandbox
assertEnvVariableDefined("ACCESS_KEY", env.ACCESS_KEY); // Secure secret key

const app: Express = express();

const config = {
  port: env.PORT!,
  sandboxPath: env.SANDBOX_PATH!,
  secretKey: env.ACCESS_KEY!,
};

app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ err: "Missing authorization" });
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || token != config.secretKey) {
    res.status(401).json({ err: "Invalid authorization" });
  }

  next();
});

app.get("/health", async (_, res) => {
  if (existsSync(config.sandboxPath)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(503);
  }
});

app.post("/clean", (_, res) => {
  resetSandbox(config.sandboxPath);
  res.sendStatus(200);
});

app.get("/sandbox/ls/*filepath", async (req, res) => {
  const path = req.params.filepath.join("/");

  if (isInvalidFilePath(path)) {
    throw new InvalidFilePathError();
  }

  const result = await lsSandbox(config.sandboxPath, path);
  if (!result.ok) {
    throw new InvalidRequestError(result.err);
  }

  res.status(200).json(result.val);
});

app.use("/sandbox/file/*filepath", express.raw({ type: "*/*", limit: "10mb" }));

app.get("/sandbox/file/*filepath", async (req, res) => {
  const path = req.params.filepath.join("/");

  if (isInvalidFilePath(path)) {
    throw new InvalidFilePathError();
  }

  const result = await readSandboxFile(config.sandboxPath, path);
  if (!result.ok) {
    throw new InvalidRequestError(result.err);
  }

  const httpContentType = contentType(path) || "application/octet-stream";
  res.status(200).contentType(httpContentType).send(result.val);
});

app.post("/sandbox/file/*filepath", async (req, res) => {
  const path = req.params.filepath.join("/");

  if (isInvalidFilePath(path)) {
    throw new InvalidFilePathError();
  }

  const result = await writeSandboxFile(config.sandboxPath, path, req.body);
  if (!result.ok) {
    throw new InvalidRequestError(result.err);
  }

  res.sendStatus(201);
});

app.delete("/sandbox/file/*filepath", async (req, res) => {
  const path = req.params.filepath.join("/");

  if (isInvalidFilePath(path)) {
    throw new InvalidFilePathError();
  }

  const result = await rmSandboxFile(config.sandboxPath, path);
  if (!result.ok) {
    throw new InvalidRequestError(result.err);
  }

  res.sendStatus(200);
});

app.post("/sandbox/cmd", express.json(), async (req, res) => {
  const cmd = req.body.cmd as string | undefined | null;

  if (!cmd) {
    throw new InvalidRequestError("Missing or invalid cmd field in body");
  }

  const result = await execSandboxCommand(config.sandboxPath, cmd);
  res.status(200).json(result);
});

// Invalid request handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (err.cause !== InvalidRequest) {
    next(err);
  }

  res.status(400).json({ error: err.message });
});

// Default error handler
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  res.status(500).json({ error: err.message });
});

app.listen(env.PORT);
