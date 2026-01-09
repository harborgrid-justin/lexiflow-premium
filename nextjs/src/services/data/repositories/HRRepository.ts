import { StaffMember, TimeEntry } from "@/types";
import { db, STORES } from "@/services/data/db";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { SystemEventType } from "@/types/integration-types";
import { isBackendApiEnabled } from "@/api";
import { HRApiService } from "@/api/hr/hr-api";

const hrApi = new HRApiService();

interface StaffWithMetrics extends StaffMember {
  utilizationRate?: number;
  activeCases?: number;
  currentBillable?: number;
}

export const HRRepository = {
  getStaff: async (): Promise<StaffWithMetrics[]> => {
    if (isBackendApiEnabled()) {
      return hrApi.getAll();
    }

    try {
      // Fetch staff and their time entries to calculate utilization
      const [staff, timeEntries] = await Promise.all([
        db.getAll<StaffMember>(STORES.STAFF),
        db.getAll<TimeEntry>(STORES.BILLING),
      ]);

      return staff.map((s) => {
        // Filter entries for this user
        // Note: In real app we'd filter by current year/period
        const userEntries = timeEntries.filter((t) => t.userId === s.userId);
        const totalHours = userEntries.reduce(
          (acc, t) => acc + t.duration / 60,
          0
        );

        // Calculate utilization (Billable / Target)
        // Assuming target is annual, normalized for YTD
        const utilization =
          s.billableTarget > 0
            ? Math.min(
                100,
                Math.round((totalHours / (s.billableTarget / 4)) * 100)
              ) // Divide target by 4 for ~Q1 view
            : 0;

        return {
          ...s,
          currentBillable: Math.round(totalHours),
          utilizationRate: utilization,
        };
      });
    } catch (error) {
      console.warn(
        "[HRRepository] getStaff failed, returning empty array:",
        error
      );
      return [];
    }
  },

  getUtilizationMetrics: async () => {
    if (isBackendApiEnabled()) {
      // If api has this endpoint
      // hrApi.getUtilizationMetrics() ?
      // If not, we fetch all staff (which from backend should include metrics) and map
      const staff = await hrApi.getAll();
      return staff.map((s) => {
        const member = s as StaffWithMetrics;
        return {
          name: member.name,
          role: member.role,
          utilization: member.utilizationRate || 0,
          cases: member.activeCases || 5,
        };
      });
    }

    try {
      const staff = await HRRepository.getStaff();
      return staff.map((s) => {
        const member = s as StaffWithMetrics;
        return {
          name: member.name,
          role: member.role,
          utilization: member.utilizationRate || 0,
          cases: 5, // Mock case count for now
        };
      });
    } catch (error) {
      console.warn(
        "[HRRepository] getUtilizationMetrics failed, returning empty array:",
        error
      );
      return [];
    }
  },

  addStaff: async (staff: StaffMember) => {
    if (isBackendApiEnabled()) {
      return hrApi.create(staff);
    }

    const newStaff = { ...staff, id: staff.id || crypto.randomUUID() };
    await db.put(STORES.STAFF, newStaff);
    // Opp #9 Integration Point
    await IntegrationEventPublisher.publish(SystemEventType.STAFF_HIRED, {
      staff: newStaff,
    });
    return newStaff;
  },

  updateStaff: async (id: string, updates: Partial<StaffMember>) => {
    if (isBackendApiEnabled()) {
      return hrApi.update(id, updates);
    }

    const current = await db.get<StaffMember>(STORES.STAFF, id);
    if (!current) throw new Error("Staff not found");
    return db.put(STORES.STAFF, { ...current, ...updates });
  },

  deleteStaff: async (id: string) => {
    if (isBackendApiEnabled()) {
      return hrApi.delete(id);
    }
    return db.delete(STORES.STAFF, id);
  },
};
