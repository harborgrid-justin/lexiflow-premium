/**
 * CLE (Continuing Legal Education) API Service
 * Manages CLE credits, courses, requirements, and compliance tracking
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface CLERequirement {
  jurisdiction: string;
  totalRequired: number;
  ethicsRequired: number;
  generalRequired: number;
  specialtyRequired?: number;
  reportingPeriod: string;
  deadline: string;
}

export interface CLECredit {
  id: string;
  courseId: string;
  courseName: string;
  provider: string;
  date: string;
  credits: number;
  category: "Ethics" | "General" | "Specialty";
  jurisdiction: string;
  certificateUrl?: string;
  status: "Completed" | "Pending" | "Verified";
}

export interface CLECourse {
  id: string;
  title: string;
  provider: string;
  credits: number;
  category: "Ethics" | "General" | "Specialty";
  jurisdiction: string[];
  format: "Live" | "Online" | "On-Demand";
  date?: string;
  cost: number;
  description: string;
  registrationUrl?: string;
}

export interface CLEProgress {
  jurisdiction: string;
  ethicsCompleted: number;
  ethicsRequired: number;
  generalCompleted: number;
  generalRequired: number;
  specialtyCompleted: number;
  specialtyRequired: number;
  totalCompleted: number;
  totalRequired: number;
  percentComplete: number;
  deadline: string;
  daysRemaining: number;
  isCompliant: boolean;
}

export class CLEApiService {
  async getRequirements(): Promise<CLERequirement[]> {
    return apiClient.get<CLERequirement[]>("/cle/requirements");
  }

  async getCredits(): Promise<CLECredit[]> {
    return apiClient.get<CLECredit[]>("/cle/credits");
  }

  async getAvailableCourses(): Promise<CLECourse[]> {
    return apiClient.get<CLECourse[]>("/cle/courses");
  }

  async getProgress(): Promise<CLEProgress[]> {
    return apiClient.get<CLEProgress[]>("/cle/progress");
  }

  async addCredit(credit: Omit<CLECredit, "id">): Promise<CLECredit> {
    return apiClient.post<CLECredit>("/cle/credits", credit);
  }

  async deleteCredit(creditId: string): Promise<void> {
    return apiClient.delete(`/cle/credits/${creditId}`);
  }

  async uploadCertificate(creditId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string }>(
      `/cle/credits/${creditId}/certificate`,
      formData
    );
    return response.url;
  }

  async enrollCourse(courseId: string): Promise<void> {
    return apiClient.post(`/cle/courses/${courseId}/enroll`, {});
  }

  async exportReport(jurisdiction: string): Promise<Blob> {
    const response = await fetch(
      `${apiClient.baseURL}/cle/reports/${jurisdiction}/export`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lexiflow_access_token")}`,
        },
      }
    );
    return response.blob();
  }
}
