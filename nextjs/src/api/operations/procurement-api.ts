/**
 * Procurement & Vendor Management API Service
 * Manages vendor spending, contracts, and procurement analytics
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface VendorSpend {
  vendorId: string;
  vendorName: string;
  category: string;
  amount: number;
  month: string;
  year: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
  budget: number;
  variance: number;
}

export interface TrendData {
  month: string;
  amount: number;
  budget: number;
}

export class ProcurementApiService {
  async getVendorSpend(params: { year: number }): Promise<VendorSpend[]> {
    return apiClient.get<VendorSpend[]>("/procurement/vendor-spend", params);
  }

  async getCategorySpend(params: { year: number }): Promise<CategorySpend[]> {
    return apiClient.get<CategorySpend[]>(
      "/procurement/category-spend",
      params
    );
  }

  async getSpendTrends(params: { year: number }): Promise<TrendData[]> {
    return apiClient.get<TrendData[]>("/procurement/trends", params);
  }

  async getVendors(): Promise<any[]> {
    return apiClient.get("/procurement/vendors");
  }

  async createVendor(vendor: any): Promise<any> {
    return apiClient.post("/procurement/vendors", vendor);
  }

  async updateVendor(id: string, vendor: any): Promise<any> {
    return apiClient.put(`/procurement/vendors/${id}`, vendor);
  }

  async deleteVendor(id: string): Promise<void> {
    return apiClient.delete(`/procurement/vendors/${id}`);
  }
}
