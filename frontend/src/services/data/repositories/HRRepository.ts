import { TimeEntriesApiService } from "@/api/billing/work-logs-api";
import { HRApiService } from "@/api/hr/hr-api";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { StaffMember } from "@/types";
import { SystemEventType } from "@/types/integration-types";

class HRRepositoryClass {
  private hrApi: HRApiService;
  private timeApi: TimeEntriesApiService;

  constructor() {
    this.hrApi = new HRApiService();
    this.timeApi = new TimeEntriesApiService();
  }

  getStaff = async () => {
    try {
      const [staff, timeEntries] = await Promise.all([
        this.hrApi.getAll(),
        this.timeApi.getAll(),
      ]);

      return staff.map((s) => {
        const userEntries = timeEntries.filter((t) => t.userId === s.userId);
        // Fallback: check hours or duration/60
        const totalHours = userEntries.reduce((acc, t) => {
          const hours = (t as { hours?: number; duration?: number }).hours || (t.duration ? t.duration / 60 : 0);
          return acc + hours;
        }, 0);

        const utilization =
          s.billableTarget > 0
            ? Math.min(
                100,
                Math.round((totalHours / (s.billableTarget / 4)) * 100)
              )
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
  };

  getUtilizationMetrics = async () => {
    try {
      const staff = await this.getStaff();
      return staff.map((s) => ({
        name: s.name,
        role: s.role,
        utilization: s.utilizationRate,
        cases: 0,
      }));
    } catch (error) {
      console.warn(
        "[HRRepository] getUtilizationMetrics failed, returning empty array:",
        error
      );
      return [];
    }
  };

  addStaff = async (staff: StaffMember) => {
    try {
      const newStaff = await this.hrApi.create(staff);
      await IntegrationEventPublisher.publish(SystemEventType.STAFF_HIRED, {
        staff: newStaff,
      });
      return newStaff;
    } catch (error) {
      console.error("[HRRepository] Error adding staff:", error);
      throw error;
    }
  };

  updateStaff = async (id: string, updates: Partial<StaffMember>) => {
    try {
      return await this.hrApi.update(id, updates);
    } catch (error) {
      console.error("[HRRepository] Error updating staff:", error);
      throw error;
    }
  };

  deleteStaff = async (id: string) => {
    try {
      if (this.hrApi.delete) {
        await this.hrApi.delete(id);
      } else {
        console.warn("[HRRepository] Delete not implemented in API");
      }
    } catch (error) {
      console.error("[HRRepository] Error deleting staff:", error);
      throw error;
    }
  };
}

export const HRRepository = new HRRepositoryClass();
