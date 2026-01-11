// Load .env BEFORE any other imports to ensure env vars are available
import * as dotenv from "dotenv";
import * as path from "path";

// In production, .env is in parent directory of dist/
// In development with ts-node, .env is in current directory
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

import {
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import compression from "compression";
import { Request, Response } from "express";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { SystemStartupReporter } from "./bootstrap/system-startup.reporter";

import { EnterpriseExceptionFilter } from "./common/filters/enterprise-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";

import { setupSwagger } from "./config/swagger.config";
import { validationPipeConfig } from "./config/validation";

import * as MasterConfig from "./config/master.config";
import { initTelemetry, shutdownTelemetry } from "./telemetry";

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

async function bootstrap(): Promise<INestApplication> {
  /* ================================================================ */
  /* STARTUP MARKER 1                                                  */
  /* ================================================================ */
  console.log(">>> BOOTSTRAP START <<<");

  const logger = new Logger("bootstrap");

  if (process.env.OTEL_ENABLED === "true") {
    initTelemetry();
    (global as Record<string, unknown>).__OTEL_INITIALIZED__ = true;
  }

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
    abortOnError: false,
  });

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(
    compression({
      level: 6,
      threshold: 1024,
      filter: (req: Request, res: Response): boolean => {
        if (req.headers["x-no-compression"]) {
          return false;
        }
        return compression.filter(req, res) as boolean;
      },
    })
  );

  const corsOrigin = configService.get<string | string[] | boolean>(
    "cors.origin"
  );
  logger.log(`CORS Configuration: ${JSON.stringify(corsOrigin)}`);

  app.enableCors({
    origin: corsOrigin,
    credentials: configService.get<boolean>("cors.credentials"),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-API-Version",
      "X-Correlation-ID",
    ],
    exposedHeaders: ["X-Total-Count", "X-Page-Count", "X-Correlation-ID"],
    maxAge: 86400,
  });

  app.setGlobalPrefix("api");

  app.enableVersioning({
    type: VersioningType.HEADER,
    // defaultVersion: '1',
    header: "X-API-Version",
  });

  app.useGlobalFilters(new EnterpriseExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(MasterConfig.REQUEST_TIMEOUT_MS)
  );
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));

  setupSwagger(app);

  const port =
    configService.get<number>("PORT") ??
    configService.get<number>("port") ??
    3001;
  const host = "0.0.0.0";

  /* ================================================================ */
  /* STARTUP MARKER 2                                                  */
  /* ================================================================ */
  console.log(">>> ABOUT TO LISTEN <<<");

  await app.listen(port, host);

  /* ================================================================ */
  /* STARTUP MARKER 3                                                  */
  /* ================================================================ */
  console.log(">>> LISTEN COMPLETE <<<");

  /* -------------------------------------------------------------- */
  /* Network Reporting (authoritative)                               */
  /* -------------------------------------------------------------- */

  SystemStartupReporter.network({ host, port });

  logger.log(`listening on ${host}:${port}`);
  logger.log(`api docs: /api/docs`);
  logger.log(`health: /api/health`);

  registerShutdownHandlers(app, logger);
  return app;
}

/* ------------------------------------------------------------------ */
/* Shutdown Handling                                                   */
/* ------------------------------------------------------------------ */

function registerShutdownHandlers(app: INestApplication, logger: Logger): void {
  const shutdown = async (signal: string) => {
    logger.log(`shutdown signal received: ${signal}`);
    try {
      await app.close();
      if (process.env.OTEL_ENABLED === "true") {
        await shutdownTelemetry();
      }
      process.exit(0);
    } catch {
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

/* ------------------------------------------------------------------ */

bootstrap().catch((error) => {
  console.error("fatal startup error");
  console.error(error);
  process.exit(1);
});
