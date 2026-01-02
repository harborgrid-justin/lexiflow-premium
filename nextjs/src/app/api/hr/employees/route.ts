import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Employee Management API Routes
 */

export interface EmployeeQueryParams {
  status?: string;
  department?: string;
  role?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  role?: string;
  hireDate?: string;
  status?: string;
}

/**
 * GET /api/hr/employees - Get all employees
 * @query status, department, role, search, sortBy, sortOrder, page, limit
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/hr/employees`);
}

/**
 * POST /api/hr/employees - Create new employee
 * @body CreateEmployeeDto
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/hr/employees`);
}
