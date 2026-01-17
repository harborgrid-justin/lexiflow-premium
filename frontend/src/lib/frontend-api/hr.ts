/**
 * HR Frontend API
 * Enterprise-grade API layer for human resources and staff management
 *
 * @module lib/frontend-api/hr
 * @description Domain-level contract for HR operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * Covers:
 * - Employee management
 * - Team and department structure
 * - Role and permission management
 * - Performance tracking
 * - Training and development
 */

import { normalizeEmployee, normalizeEmployees } from "../normalization/hr";

import { client } from "./client";
import { NotFoundError, ValidationError } from "./errors";
import { failure, type PaginatedResult, type Result, success } from "./types";

import type { Employee } from "@/types";

/**
 * Employee query filters
 */
export interface EmployeeFilters {
  departmentId?: string;
  role?: string;
  status?: "active" | "inactive" | "onLeave";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "firstName" | "lastName" | "email" | "hireDate";
  sortOrder?: "asc" | "desc";
}

/**
 * Employee creation input
 */
export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  role?: string;
  hireDate?: string | Date;
  manager?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Employee update input
 */
export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  role?: string;
  manager?: string;
  status?: "active" | "inactive" | "onLeave";
  metadata?: Record<string, unknown>;
}

/**
 * Get all employees with optional filtering
 */
export async function getAllEmployees(
  filters?: EmployeeFilters
): Promise<Result<PaginatedResult<Employee>>> {
  const params: Record<string, string | number> = {};

  if (filters?.departmentId) params.departmentId = filters.departmentId;
  if (filters?.role) params.role = filters.role;
  if (filters?.status) params.status = filters.status;
  if (filters?.search) params.search = filters.search;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/hr/employees", { params });

  if (!result.ok) {
    return result;
  }

  const response = result.data as Record<string, unknown>;
  const items = Array.isArray(response.data) ? response.data : [];
  const total =
    typeof response.total === "number" ? response.total : items.length;
  const page = typeof response.page === "number" ? response.page : 1;
  const pageSize =
    typeof response.pageSize === "number" ? response.pageSize : items.length;

  return success({
    data: normalizeEmployees(items),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: string): Promise<Result<Employee>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid employee ID is required"));
  }

  const result = await client.get<unknown>(`/hr/employees/${id}`);

  if (!result.ok) {
    return result;
  }

  if (!result.data) {
    return failure(new NotFoundError(`Employee ${id} not found`));
  }

  return success(normalizeEmployee(result.data));
}

/**
 * Create employee
 */
export async function createEmployee(
  input: CreateEmployeeInput
): Promise<Result<Employee>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Employee input is required"));
  }

  if (!input.firstName || typeof input.firstName !== "string") {
    return failure(new ValidationError("First name is required"));
  }

  if (!input.lastName || typeof input.lastName !== "string") {
    return failure(new ValidationError("Last name is required"));
  }

  if (!input.email || typeof input.email !== "string") {
    return failure(new ValidationError("Email is required"));
  }

  const result = await client.post<unknown>("/hr/employees", input);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEmployee(result.data));
}

/**
 * Update employee
 */
export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput
): Promise<Result<Employee>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid employee ID is required"));
  }

  if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
    return failure(new ValidationError("At least one field must be updated"));
  }

  const result = await client.patch<unknown>(`/hr/employees/${id}`, input);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEmployee(result.data));
}

/**
 * Delete employee
 */
export async function deleteEmployee(id: string): Promise<Result<void>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid employee ID is required"));
  }

  return client.delete<void>(`/hr/employees/${id}`);
}

/**
 * Get employees by department
 */
export async function getEmployeesByDepartment(
  departmentId: string
): Promise<Result<Employee[]>> {
  if (
    !departmentId ||
    typeof departmentId !== "string" ||
    departmentId.trim() === ""
  ) {
    return failure(new ValidationError("Valid department ID is required"));
  }

  const result = await getAllEmployees({ departmentId, limit: 1000 });

  if (!result.ok) return result;

  return success(result.data.data);
}

/**
 * Search employees
 */
export async function searchEmployees(
  query: string,
  options?: { limit?: number }
): Promise<Result<Employee[]>> {
  if (!query || typeof query !== "string" || query.trim() === "") {
    return failure(new ValidationError("Search query is required"));
  }

  const params: Record<string, string | number> = { q: query.trim() };
  if (options?.limit) params.limit = options.limit;

  const result = await client.get<unknown>("/hr/employees/search", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeEmployees(items));
}

/**
 * HR API module
 */
export const hrApi = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  searchEmployees,
} as const;
