/**
 * Vendor Service
 * Handles vendor and court reporter operations for discovery management
 *
 * @module VendorService
 * @description Manages vendor records and court reporter information
 */

import { OperationError, ValidationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/api-client.service";

import type { Vendor } from "@/types";

/**
 * Vendor Service Class
 * Manages vendor and reporter data operations
 */
export class VendorService {
  /**
   * Get all vendors
   *
   * @returns Promise<Vendor[]> Array of vendors
   *
   * @example
   * const vendors = await vendorService.getVendors();
   */
  async getVendors(): Promise<Vendor[]> {
    try {
      return await apiClient.get<Vendor[]>("/discovery/vendors");
    } catch (error) {
      console.error("[VendorService.getVendors] Error:", error);
      return [];
    }
  }

  /**
   * Add a new vendor
   *
   * @param vendor - Vendor data
   * @returns Promise<Vendor> Created vendor
   * @throws ValidationError if vendor data is invalid
   * @throws OperationError if create fails
   *
   * @example
   * const vendor = await vendorService.addVendor({
   *   name: 'Discovery Experts Inc.',
   *   type: 'processing',
   *   contact: 'info@discoveryexperts.com'
   * });
   */
  async addVendor(vendor: Vendor): Promise<Vendor> {
    if (!vendor || typeof vendor !== "object") {
      throw new ValidationError(
        "[VendorService.addVendor] Invalid vendor data"
      );
    }

    try {
      return await apiClient.post<Vendor>("/discovery/vendors", vendor);
    } catch (error) {
      console.error("[VendorService.addVendor] Error:", error);
      throw new OperationError("addVendor", "Failed to add vendor");
    }
  }

  /**
   * Get all court reporters
   *
   * @returns Promise<unknown[]> Array of reporters
   *
   * @example
   * const reporters = await vendorService.getReporters();
   */
  async getReporters(): Promise<unknown[]> {
    try {
      return await apiClient.get<unknown[]>("/discovery/reporters");
    } catch (error) {
      console.error("[VendorService.getReporters] Error:", error);
      return [];
    }
  }
}

export const vendorService = new VendorService();
