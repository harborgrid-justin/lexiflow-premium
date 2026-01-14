/**
 * HR Domain Normalizers
 * Transform backend HR data to frontend format
 */

import {
  normalizeArray,
  normalizeDate,
  normalizeId,
  normalizeNumber,
  normalizeString,
  type Normalizer,
} from "./index";

interface BackendEmployee {
  id: string | number;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
  title?: string;
  hire_date?: string;
  salary?: number;
  created_at?: string;
}

export const normalizeEmployee: Normalizer<BackendEmployee, unknown> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    employeeId: normalizeString(backend.employee_id),
    firstName: normalizeString(backend.first_name),
    lastName: normalizeString(backend.last_name),
    email: normalizeString(backend.email),
    department: normalizeString(backend.department),
    title: normalizeString(backend.title),
    hireDate: normalizeDate(backend.hire_date),
    salary: normalizeNumber(backend.salary),
    createdAt: normalizeDate(backend.created_at) || new Date(),
  };
};

export function normalizeEmployees(backendEmployees: unknown): unknown[] {
  return normalizeArray(backendEmployees, normalizeEmployee);
}
