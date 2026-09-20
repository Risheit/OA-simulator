import express, { type Express, type Request, type Response } from "express";
import { env, exit } from "node:process";

if (!env.PORT) {
  console.error("No PORT env variable found!");
  exit(1);
}

const app: Express = express();

app.get("/health", (_: Request, res: Response) => {
  res.status(200);
});

app.get("/clean", (_: Request, res: Response) => {
  res.status(200);
});

app.listen(env.PORT);
