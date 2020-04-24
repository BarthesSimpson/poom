import compress from "compression";
import helmet from "helmet";
import cors from "cors";
import express from "@feathersjs/express";
import logger from "../logger";

import { Application } from "../declarations";

export default function applyMiddlewares(app: Application) {
  // Enable security, CORS, compression, favicon and body parsing
  app.use(helmet());
  app.use(cors());
  app.use(compress());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.notFound());
  app.use(express.errorHandler({ logger } as any));
}
