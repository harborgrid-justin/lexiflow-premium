/**
 * Facilities Management API Service
 * Manages office locations, meeting rooms, and facility information
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface Facility {
  id: string;
  name: string;
  type: "Office" | "Storage" | "Meeting Room" | "Court" | "Other";
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone?: string;
  capacity?: number;
  amenities?: string[];
  notes?: string;
}

export class FacilitiesApiService {
  async getAll(): Promise<Facility[]> {
    return apiClient.get<Facility[]>("/facilities");
  }

  async getById(id: string): Promise<Facility> {
    return apiClient.get<Facility>(`/facilities/${id}`);
  }

  async create(facility: Omit<Facility, "id">): Promise<Facility> {
    return apiClient.post<Facility>("/facilities", facility);
  }

  async update(id: string, facility: Partial<Facility>): Promise<Facility> {
    return apiClient.put<Facility>(`/facilities/${id}`, facility);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/facilities/${id}`);
  }

  async search(query: string): Promise<Facility[]> {
    return apiClient.get<Facility[]>("/facilities/search", { q: query });
  }
}
