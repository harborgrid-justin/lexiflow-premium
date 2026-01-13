// Load .env BEFORE any other imports to ensure env vars are available
import * as dotenv from "dotenv";
import * as path from "path";
import * as zlib from "zlib";

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
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import type { FastifyReply, FastifyRequest } from "fastify";

import { AppModule } from "./app.module";
import { SystemStartupReporter } from "./bootstrap/system-startup.reporter";

import { EnterpriseExceptionFilter } from "./common/filters/enterprise-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";

import { setupSwagger } from "./config/swagger.config";
import { validationPipeConfig } from "./config/validation";

import * as MasterConfig from "./config/master.config";
// import { initTelemetry, shutdownTelemetry } from "./telemetry";

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

async function bootstrap(): Promise<INestApplication> {
  /* ================================================================ */
  /* STARTUP MARKER 1                                                  */
  /* ================================================================ */
  console.log(">>> BOOTSTRAP START <<<");

  const logger = new Logger("bootstrap");

  // Lazy-load telemetry only when enabled to avoid loading heavy OTel SDKs
  if (process.env.OTEL_ENABLED === "true") {
    const { initTelemetry } = await import("./telemetry");
    initTelemetry();
    (global as Record<string, unknown>).__OTEL_INITIALIZED__ = true;
  }

  // Fastify adapter with optimized settings
  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    trustProxy: true,
    bodyLimit: 52428800, // 50MB for file uploads
    // Connection keep-alive optimization
    keepAliveTimeout: 72000,
    maxParamLength: 500,
    // HTTP/2 support
    http2: false,
    // Optimize for high throughput
    ignoreTrailingSlash: true,
    caseSensitive: false,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      logger: ["error", "warn", "log"],
      abortOnError: false,
    }
  );

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  // Register Fastify plugins for optimized performance
  // Lean helmet configuration - only essential security headers
  await app.register(import("@fastify/helmet"), {
    global: true,
    contentSecurityPolicy: false, // Disable CSP for API-only
    crossOriginEmbedderPolicy: false,
  });

  // Brotli compression with aggressive settings
  await app.register(import("@fastify/compress"), {
    global: true,
    encodings: ["br", "gzip", "deflate"],
    brotliOptions: {
      params: {
        [zlib.constants.BROTLI_PARAM_MODE]:
          zlib.constants.BROTLI_MODE_TEXT,
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4, // Balance speed/compression
      },
    },
    threshold: 1024,
  });

  const corsOrigin = configService.get<string | string[] | boolean>(
    "app.server.corsOrigin"
  );
  logger.log(`CORS Configuration: ${JSON.stringify(corsOrigin)}`);

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
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

  // Strict request body size limits for JSON (prevent zip bomb attacks)
  app.getHttpAdapter().getInstance().addContentTypeParser(
    "application/json",
    { parseAs: "string", bodyLimit: 51200 }, // 50KB for JSON
    function (_req: FastifyRequest, body: string, done: (err: Error | null, parsed?: unknown) => void) {
      try {
        const json = JSON.parse(body);
        done(null, json);
      } catch (err: unknown) {
        done(err as Error);
      }
    }
  );

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
      // Lazy-load telemetry shutdown only if enabled
      if (process.env.OTEL_ENABLED === "true" && (global as Record<string, unknown>).__OTEL_INITIALIZED__) {
        const { shutdownTelemetry } = await import("./telemetry");
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
/* Main                                                                */
/* ------------------------------------------------------------------ */

// Only load source-map-support in development (saves memory in production)
if (process.env.NODE_ENV !== "production") {
  require("source-map-support").install();
}

bootstrap().catch((error) => {
  console.error("fatal startup error");
  console.error(error);
  process.exit(1);
});
