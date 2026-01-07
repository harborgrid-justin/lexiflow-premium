#!/usr/bin/env node
/**
 * Build API Client from Generated Schemas
 *
 * This script takes the OpenAPI-generated TypeScript types and creates
 * a typed client with all the backend endpoints.
 *
 * Usage: npm run codegen
 */

const fs = require("fs");
const path = require("path");

const GENERATED_DIR = path.join(__dirname, "../services/data/api/generated");
const CLIENT_FILE = path.join(GENERATED_DIR, "client.ts");

// Template for generated client
const CLIENT_TEMPLATE = `/**
 * Auto-generated API Client
 *
 * Generated from NestJS Swagger OpenAPI specification.
 * DO NOT EDIT MANUALLY - regenerate using: npm run codegen
 *
 * @module services/data/api/generated/client
 */

import { authGet, authPost, authPut, authPatch, authDelete } from '../../client/authTransport';
import type { paths, components } from './schemas';

// Extract schema types
export type User = components['schemas']['User'];
export type Case = components['schemas']['Case'];
export type Document = components['schemas']['Document'];
export type Invoice = components['schemas']['Invoice'];
export type Report = components['schemas']['Report'];

/**
 * Users API
 */
export const usersApi = {
  me: () => authGet<User>('/users/me'),
  findAll: () => authGet<User[]>('/users'),
  findOne: (id: string) => authGet<User>(\`/users/\${id}\`),
  update: (id: string, data: Partial<User>) => authPut<User>(\`/users/\${id}\`, data),
  delete: (id: string) => authDelete<void>(\`/users/\${id}\`),
};

/**
 * Cases API
 */
export const casesApi = {
  findAll: () => authGet<Case[]>('/cases'),
  findOne: (id: string) => authGet<Case>(\`/cases/\${id}\`),
  create: (data: Omit<Case, 'id'>) => authPost<Case>('/cases', data),
  update: (id: string, data: Partial<Case>) => authPut<Case>(\`/cases/\${id}\`, data),
  delete: (id: string) => authDelete<void>(\`/cases/\${id}\`),
};

/**
 * Documents API
 */
export const documentsApi = {
  findAll: (caseId?: string) => authGet<Document[]>('/documents', { params: { caseId } }),
  findOne: (id: string) => authGet<Document>(\`/documents/\${id}\`),
  upload: (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    return authPost<Document>('/documents/upload', formData);
  },
  delete: (id: string) => authDelete<void>(\`/documents/\${id}\`),
};

/**
 * Invoices API
 */
export const invoicesApi = {
  findAll: () => authGet<Invoice[]>('/invoices'),
  findOne: (id: string) => authGet<Invoice>(\`/invoices/\${id}\`),
  create: (data: Omit<Invoice, 'id'>) => authPost<Invoice>('/invoices', data),
  update: (id: string, data: Partial<Invoice>) => authPut<Invoice>(\`/invoices/\${id}\`, data),
  delete: (id: string) => authDelete<void>(\`/invoices/\${id}\`),
};

/**
 * Reports API
 */
export const reportsApi = {
  findAll: () => authGet<Report[]>('/reports'),
  findOne: (id: string) => authGet<Report>(\`/reports/\${id}\`),
  generate: (type: string, params: any) => authPost<Report>('/reports/generate', { type, params }),
  export: (id: string, format: 'pdf' | 'csv' | 'xlsx') =>
    authGet<Blob>(\`/reports/\${id}/export\`, { params: { format } }),
};

/**
 * Authentication API
 */
export const authApi = {
  login: (email: string, password: string) =>
    authPost<{ user: User }>('/auth/login', { email, password }),
  logout: () => authPost<void>('/auth/logout'),
  me: () => authGet<User>('/auth/me'),
  refresh: () => authPost<void>('/auth/refresh'),
};
`;

// Ensure directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// Write client file
fs.writeFileSync(CLIENT_FILE, CLIENT_TEMPLATE, "utf8");

console.log("✅ API client generated successfully");
console.log(`📄 Output: ${CLIENT_FILE}`);
console.log("");
console.log("💡 To use in your code:");
console.log(
  "   import { usersApi, casesApi } from '@/services/data/api/generated/client';"
);
