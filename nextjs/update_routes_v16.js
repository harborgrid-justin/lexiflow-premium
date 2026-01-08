#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Next.js v16 Route Handler Compliance Script
 * Applies Next.js v16 best practices to all route.ts files
 */

const fs = require("fs");
const path = require("path");

// Find all route.ts files
const findRouteFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (item === "route.ts") {
      files.push(fullPath);
    }
  }

  return files;
};

// Analyze route file to determine supported methods and if it has dynamic params
const analyzeRouteFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const methods = [];
  const hasDynamicParams =
    filePath.includes("[id]") ||
    filePath.includes("[type]") ||
    filePath.includes("[jurisdiction]");
  const hasParams = content.includes("params: Promise<");

  // Extract exported methods
  const methodRegex = /export async function (GET|POST|PUT|PATCH|DELETE)/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1]);
  }

  return { methods, hasDynamicParams, hasParams };
};

// Generate CORS headers based on methods
const generateCorsHeaders = (methods) => {
  const methodString = methods.concat(["OPTIONS"]).join(", ");
  return `const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS : '*',
  'Access-Control-Allow-Methods': '${methodString}',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};`;
};

// Generate security headers
const generateSecurityHeaders = () => {
  return `const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};`;
};

// Generate route interface for dynamic params
const generateRouteInterface = () => {
  return `interface RouteParams {
  params: Promise<{ id: string }>;
}`;
};

// Generate OPTIONS handler
const generateOptionsHandler = () => {
  return `// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: { ...CORS_HEADERS, ...SECURITY_HEADERS },
  });
}`;
};

// Generate method handler with validation
const generateMethodHandler = (method, hasDynamicParams, routePath) => {
  const paramDestructuring = hasDynamicParams ? "{ params }: RouteParams" : "";
  const paramValidation = hasDynamicParams
    ? `
// Validate and await params (Next.js v16 requirement)
    const { id } = await params;

    // Validate case ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_ID', message: 'Valid ID is required' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }`
    : "";

  const bodyValidation = ["POST", "PUT", "PATCH"].includes(method)
    ? `
// Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_CONTENT_TYPE', message: 'Content-Type must be application/json' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Basic request body validation
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }`
    : "";

  const specificValidation =
    method === "POST"
      ? `
// Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'MISSING_TITLE', message: 'Title is required and must be a non-empty string' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }`
      : method === "PATCH"
        ? `
// For PATCH, body can be partial, but should not be empty
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'EMPTY_BODY', message: 'Request body cannot be empty for PATCH operations' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }`
        : "";

  return `// ${method} ${routePath} - ${method === "GET" ? "Get" : method === "POST" ? "Create" : method === "PUT" ? "Update" : method === "PATCH" ? "Partial update" : "Delete"} ${hasDynamicParams ? "specific " : ""}resource
export async function ${method}(request: NextRequest${paramDestructuring ? `, ${paramDestructuring}` : ""}) {
  try {
    // Validate request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED', message: 'Authentication required' },
        {
          status: 401,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }${paramValidation}${bodyValidation}${specificValidation}

    // Log request
    console.log(\`[API] ${method} ${routePath} - \${request.headers.get('x-forwarded-for') || 'unknown'}\`);

    const response = await proxyToBackend(request, "${routePath.replace("[id]", "${id}")}");

    // Add security headers to response
    const headers = new Headers(response.headers);
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error(\`[API] ${method} ${routePath} error:\`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      {
        status: 500,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      }
    );
  }
}`;
};

// Generate 405 handlers for unsupported methods
const generate405Handlers = (supportedMethods) => {
  const allMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];
  const unsupportedMethods = allMethods.filter(
    (method) => !supportedMethods.includes(method)
  );

  return unsupportedMethods
    .map(
      (method) => `
export async function ${method}(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: '${method} method not supported${supportedMethods.length > 0 ? ` on this endpoint` : ""}' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': '${supportedMethods.concat(["OPTIONS"]).join(", ")}'
      }
    }
  );
}`
    )
    .join("\n");
};

// Main update function
const updateRouteFile = (filePath) => {
  console.log(`Updating ${filePath}...`);

  const { methods, hasDynamicParams } = analyzeRouteFile(filePath);
  const routePath = filePath
    .replace("/workspaces/lexiflow-premium/nextjs/src/app/api", "/api")
    .replace("/route.ts", "")
    .replace(/\[([^\]]+)\]/g, "[$1]");

  let content = `import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest, NextResponse } from "next/server";

// Cache policy: API routes are dynamic and should not be cached
export const dynamic = 'force-dynamic';

${generateCorsHeaders(methods)}

${generateSecurityHeaders()}

/**
 * API Route Handler
 * Handles ${routePath} operations
 *
${methods.map((method) => ` * ${method} ${routePath}${hasDynamicParams ? "/[id]" : ""} - ${method === "GET" ? "Get" : method === "POST" ? "Create" : method === "PUT" ? "Update" : method === "PATCH" ? "Partial update" : "Delete"} ${hasDynamicParams ? "specific " : ""}resource`).join("\n")}
 *
 * @security Requires authentication
 */`;

  if (hasDynamicParams) {
    content += `\n${generateRouteInterface()}`;
  }

  content += `\n${generateOptionsHandler()}`;

  methods.forEach((method) => {
    content += `\n${generateMethodHandler(method, hasDynamicParams, routePath + (hasDynamicParams ? "/${id}" : ""))}`;
  });

  content += `\n${generate405Handlers(methods)}`;

  fs.writeFileSync(filePath, content);
  console.log(`✓ Updated ${filePath}`);
};

// Main execution
const main = () => {
  const routeFiles = findRouteFiles(
    "/workspaces/lexiflow-premium/nextjs/src/app/api"
  );
  console.log(`Found ${routeFiles.length} route.ts files to update`);

  // Update files in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < routeFiles.length; i += batchSize) {
    const batch = routeFiles.slice(i, i + batchSize);
    batch.forEach(updateRouteFile);

    if (i + batchSize < routeFiles.length) {
      console.log(
        `Processed ${Math.min(i + batchSize, routeFiles.length)}/${routeFiles.length} files...`
      );
      // Small delay between batches
      require("child_process").execSync("sleep 0.1");
    }
  }

  console.log(
    "✅ All route.ts files have been updated with Next.js v16 compliance!"
  );
};

if (require.main === module) {
  main();
}

module.exports = { updateRouteFile, analyzeRouteFile };
