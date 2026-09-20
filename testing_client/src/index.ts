import express, {
  NextFunction,
  type Express,
  type Request,
  type Response,
} from "express";
import { env, exit } from "node:process";
import { existsSync } from "node:fs";
import { resetSandbox } from "./sandbox.js";

if (!env.PORT) {
  console.error("No PORT env variable found!");
  exit(1);
}

if (!env.SANDBOX_PATH) {
  console.error("No SANDBOX_PATH env variable found!");
  exit(1);
}

const app: Express = express();

const config = {
  port: env.PORT!,
  path: env.SANDBOX_PATH!,
};

app.get("/health", async (_: Request, res: Response) => {
  if (existsSync(config.path)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(503);
  }
});

app.post("/clean", (_: Request, res: Response) => {
  resetSandbox(config.path);
  res.sendStatus(200);
});

app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  res.status(500).json({ error: err.message });
});

app.listen(env.PORT);
