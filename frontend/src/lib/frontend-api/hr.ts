/**
 * HR Frontend API
 * Human resources and staff management operations
 */

import { normalizeEmployee, normalizeEmployees } from "../normalization/hr";
import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function getAllEmployees(): Promise<Result<any[]>> {
  const result = await client.get<unknown>("/hr/employees");

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeEmployees(items));
}

export async function getEmployeeById(id: string): Promise<Result<any>> {
  if (!id) {
    return failure(new ValidationError("Employee ID is required"));
  }

  const result = await client.get<unknown>(`/hr/employees/${id}`);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEmployee(result.data));
}

export async function createEmployee(input: any): Promise<Result<any>> {
  if (!input.firstName || !input.lastName || !input.email) {
    return failure(
      new ValidationError("First name, last name, and email are required")
    );
  }

  const result = await client.post<unknown>("/hr/employees", input);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEmployee(result.data));
}

export async function updateEmployee(
  id: string,
  input: any
): Promise<Result<any>> {
  if (!id) {
    return failure(new ValidationError("Employee ID is required"));
  }

  const result = await client.patch<unknown>(`/hr/employees/${id}`, input);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEmployee(result.data));
}

export const hrApi = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
};
