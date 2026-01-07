// DAL: Data Access Layer for Dashboard (Server-Side Only)

import "server-only";
import { cookies } from "next/headers";

// Define DTOs based on backend/src/analytics/dashboard/dto/dashboard.dto.ts
// Simplifying for now
export interface QuickStat {
  label: string;
  value: string | number;
  change?: number; // percentage change
  trend?: "up" | "down" | "neutral";
  icon?: string;
}

export interface ChartData {
  label: string;
  data: number[];
}

export interface DashboardData {
  summary: {
    totalCases: number;
    activeCases: number;
    pendingTasks: number;
    upcomingDeadlines: number;
  };
  recentActivity: Array<{
    id: string;
    description: string;
    timestamp: string;
    userId: string;
  }>;
  quickStats: QuickStat[];
  // Add other sections as needed
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const getDashboardData = async (): Promise<DashboardData> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // For development (if no backend running or no token), return mock data
  if (!token) {
    console.warn("No auth token found, returning mock dashboard data");
    return {
      summary: {
        totalCases: 124,
        activeCases: 42,
        pendingTasks: 18,
        upcomingDeadlines: 5,
      },
      recentActivity: [
        {
          id: "1",
          description: "New document uploaded to Case #23-001",
          timestamp: new Date().toISOString(),
          userId: "u1",
        },
        {
          id: "2",
          description: "Docket update for Johnson v. Smith",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: "system",
        },
      ],
      quickStats: [
        { label: "Revenue", value: "$124,000", change: 12, trend: "up" },
        { label: "Billable Hours", value: "342", change: 5, trend: "up" },
        { label: "New Cases", value: "8", change: -2, trend: "down" },
      ],
    };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Dashboard data should be fresh
    });

    if (!res.ok) {
      // Graceful degradation or error throwing
      if (res.status === 401) {
        // In real app, might redirect to login, but here valid returns null or throws
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to fetch dashboard data: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Dashboard DAL Error:", error);
    // Return mock data fallback for demo continuity
    return {
      summary: {
        totalCases: 0,
        activeCases: 0,
        pendingTasks: 0,
        upcomingDeadlines: 0,
      },
      recentActivity: [],
      quickStats: [],
    };
  }
};
