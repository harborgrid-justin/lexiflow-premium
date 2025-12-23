/**
 * API Alignment Analysis Script
 * Extracts and compares all backend endpoints with frontend API calls
 */

import * as fs from 'fs';
import * as path from 'path';

interface BackendEndpoint {
  controller: string;
  method: string;
  path: string;
  fullPath: string;
  file: string;
  handler: string;
}

interface FrontendApiCall {
  service: string;
  method: string;
  path: string;
  file: string;
  functionName: string;
}

interface Misalignment {
  type: 'missing_backend' | 'missing_frontend' | 'method_mismatch' | 'path_mismatch';
  description: string;
  backend?: BackendEndpoint;
  frontend?: FrontendApiCall;
}

/**
 * Extract backend endpoints from controller files
 */
function extractBackendEndpoints(controllerPath: string): BackendEndpoint[] {
  const content = fs.readFileSync(controllerPath, 'utf-8');
  const endpoints: BackendEndpoint[] = [];

  // Extract @Controller path
  const controllerMatch = content.match(/@Controller\('([^']*)'\)/);
  const basePath = controllerMatch ? controllerMatch[1] : '';

  // Extract HTTP method decorators and their paths
  const httpMethodRegex = /@(Get|Post|Put|Delete|Patch)\((?:'([^']*)'|"([^"]*)"|)\)/g;
  let match;

  while ((match = httpMethodRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const routePath = match[2] || match[3] || '';
    const fullPath = `/${basePath}${routePath ? '/' + routePath : ''}`.replace(/\/+/g, '/');

    // Find the handler function name
    const handlerMatch = content.slice(match.index).match(/async\s+(\w+)\(/);
    const handler = handlerMatch ? handlerMatch[1] : 'unknown';

    endpoints.push({
      controller: basePath,
      method,
      path: routePath,
      fullPath,
      file: controllerPath,
      handler,
    });
  }

  return endpoints;
}

/**
 * Extract frontend API calls from service files
 */
function extractFrontendApiCalls(servicePath: string): FrontendApiCall[] {
  const content = fs.readFileSync(servicePath, 'utf-8');
  const calls: FrontendApiCall[] = [];

  // Extract apiClient calls: apiClient.get/post/put/delete/patch
  const apiCallRegex = /apiClient\.(get|post|put|delete|patch)<[^>]*>\('([^']+)'|apiClient\.(get|post|put|delete|patch)<[^>]*>\("([^"]+)"/g;
  let match;

  while ((match = apiCallRegex.exec(content)) !== null) {
    const method = (match[1] || match[3]).toUpperCase();
    const apiPath = match[2] || match[4];

    // Find the function name containing this call
    const beforeCall = content.slice(0, match.index);
    const functionMatch = beforeCall.match(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*\{[^}]*$/);
    const functionName = functionMatch ? functionMatch[1] : 'unknown';

    calls.push({
      service: path.basename(servicePath, '.ts'),
      method,
      path: apiPath,
      file: servicePath,
      functionName,
    });
  }

  return calls;
}

/**
 * Main analysis function
 */
function analyzeApiAlignment() {
  const backendDir = path.join(process.cwd(), 'backend', 'src');
  const frontendDir = path.join(process.cwd(), 'frontend', 'services', 'api');

  console.log('Starting API Alignment Analysis...\n');

  // Extract all backend endpoints
  const backendEndpoints: BackendEndpoint[] = [];
  const controllerFiles = getAllFiles(backendDir, '.controller.ts');

  for (const file of controllerFiles) {
    const endpoints = extractBackendEndpoints(file);
    backendEndpoints.push(...endpoints);
  }

  console.log(`Found ${backendEndpoints.length} backend endpoints across ${controllerFiles.length} controllers\n`);

  // Extract all frontend API calls
  const frontendCalls: FrontendApiCall[] = [];
  const serviceFiles = getAllFiles(frontendDir, '-api.ts');

  for (const file of serviceFiles) {
    const calls = extractFrontendApiCalls(file);
    frontendCalls.push(...calls);
  }

  console.log(`Found ${frontendCalls.length} frontend API calls across ${serviceFiles.length} services\n`);

  // Find misalignments
  const misalignments: Misalignment[] = [];

  // Check for frontend calls without backend endpoints
  for (const frontendCall of frontendCalls) {
    const matchingBackend = backendEndpoints.find(
      be => be.fullPath === frontendCall.path && be.method === frontendCall.method
    );

    if (!matchingBackend) {
      // Check if path exists but method differs
      const pathExists = backendEndpoints.find(be => be.fullPath === frontendCall.path);

      if (pathExists) {
        misalignments.push({
          type: 'method_mismatch',
          description: `Frontend calls ${frontendCall.method} ${frontendCall.path} but backend has ${pathExists.method}`,
          backend: pathExists,
          frontend: frontendCall,
        });
      } else {
        misalignments.push({
          type: 'missing_backend',
          description: `Frontend expects ${frontendCall.method} ${frontendCall.path} but backend endpoint missing`,
          frontend: frontendCall,
        });
      }
    }
  }

  // Check for backend endpoints without frontend calls
  for (const backendEndpoint of backendEndpoints) {
    const matchingFrontend = frontendCalls.find(
      fc => fc.path === backendEndpoint.fullPath && fc.method === backendEndpoint.method
    );

    if (!matchingFrontend && backendEndpoint.fullPath !== '/') {
      misalignments.push({
        type: 'missing_frontend',
        description: `Backend has ${backendEndpoint.method} ${backendEndpoint.fullPath} but no frontend call found`,
        backend: backendEndpoint,
      });
    }
  }

  // Report results
  console.log('='.repeat(80));
  console.log('API ALIGNMENT ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log(`\nTotal Misalignments Found: ${misalignments.length}\n`);

  const groupedMisalignments = {
    missing_backend: misalignments.filter(m => m.type === 'missing_backend'),
    missing_frontend: misalignments.filter(m => m.type === 'missing_frontend'),
    method_mismatch: misalignments.filter(m => m.type === 'method_mismatch'),
  };

  console.log(`Missing Backend Endpoints: ${groupedMisalignments.missing_backend.length}`);
  console.log(`Missing Frontend Calls: ${groupedMisalignments.missing_frontend.length}`);
  console.log(`Method Mismatches: ${groupedMisalignments.method_mismatch.length}`);
  console.log('\n' + '='.repeat(80) + '\n');

  // Detailed reports
  if (groupedMisalignments.missing_backend.length > 0) {
    console.log('MISSING BACKEND ENDPOINTS:');
    console.log('-'.repeat(80));
    groupedMisalignments.missing_backend.forEach((m, i) => {
      console.log(`${i + 1}. ${m.description}`);
      console.log(`   Frontend: ${m.frontend!.service}.${m.frontend!.functionName}()`);
      console.log(`   File: ${m.frontend!.file.replace(process.cwd(), '')}`);
      console.log('');
    });
  }

  if (groupedMisalignments.method_mismatch.length > 0) {
    console.log('\nMETHOD MISMATCHES:');
    console.log('-'.repeat(80));
    groupedMisalignments.method_mismatch.forEach((m, i) => {
      console.log(`${i + 1}. ${m.description}`);
      console.log(`   Frontend: ${m.frontend!.service}.${m.frontend!.functionName}()`);
      console.log(`   Backend: ${m.backend!.controller}.${m.backend!.handler}()`);
      console.log('');
    });
  }

  if (groupedMisalignments.missing_frontend.length > 0) {
    console.log('\nMISSING FRONTEND CALLS (Backend endpoints not used):');
    console.log('-'.repeat(80));
    groupedMisalignments.missing_frontend.slice(0, 20).forEach((m, i) => {
      console.log(`${i + 1}. ${m.description}`);
      console.log(`   Backend: ${m.backend!.controller}.${m.backend!.handler}()`);
      console.log(`   File: ${m.backend!.file.replace(process.cwd(), '')}`);
      console.log('');
    });
    if (groupedMisalignments.missing_frontend.length > 20) {
      console.log(`   ... and ${groupedMisalignments.missing_frontend.length - 20} more`);
    }
  }

  // Save detailed report to file
  const reportPath = path.join(process.cwd(), 'API_ALIGNMENT_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      totalBackendEndpoints: backendEndpoints.length,
      totalFrontendCalls: frontendCalls.length,
      totalMisalignments: misalignments.length,
      missingBackend: groupedMisalignments.missing_backend.length,
      missingFrontend: groupedMisalignments.missing_frontend.length,
      methodMismatches: groupedMisalignments.method_mismatch.length,
    },
    backendEndpoints,
    frontendCalls,
    misalignments,
  }, null, 2));

  console.log(`\n\nDetailed report saved to: ${reportPath}`);
}

/**
 * Recursively get all files with specific extension
 */
function getAllFiles(dir: string, extension: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, extension));
    } else if (item.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Run the analysis
analyzeApiAlignment();
