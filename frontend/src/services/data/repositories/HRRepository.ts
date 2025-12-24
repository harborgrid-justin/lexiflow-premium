import { StaffMember, TimeEntry } from '@/types';
import { db, STORES } from '../db';
import { IntegrationOrchestrator } from '@/services/integration/integrationOrchestrator';
import { SystemEventType } from "@/types/integration-types";

export const HRRepository = {
    getStaff: async () => {
        try {
            // Fetch staff and their time entries to calculate utilization
            const [staff, timeEntries] = await Promise.all([
                db.getAll<StaffMember>(STORES.STAFF),
                db.getAll<TimeEntry>(STORES.BILLING)
            ]);

            return staff.map(s => {
                // Filter entries for this user
                // Note: In real app we'd filter by current year/period
                const userEntries = timeEntries.filter(t => t.userId === s.userId);
                const totalHours = userEntries.reduce((acc, t) => acc + (t.duration / 60), 0);
                
                // Calculate utilization (Billable / Target)
                // Assuming target is annual, normalized for YTD
                const utilization = s.billableTarget > 0 
                    ? Math.min(100, Math.round((totalHours / (s.billableTarget / 4)) * 100)) // Divide target by 4 for ~Q1 view
                    : 0;

                return {
                    ...s,
                    currentBillable: Math.round(totalHours),
                    utilizationRate: utilization
                };
            });
        } catch (error) {
            console.warn('[HRRepository] getStaff failed, returning empty array:', error);
            return [];
        }
    },

    getUtilizationMetrics: async () => {
        try {
            const staff = await HRRepository.getStaff();
            return staff.map(s => ({ 
                name: s.name, 
                role: s.role, 
                utilization: s.utilizationRate, 
                cases: 5 // Mock case count for now
            }));
        } catch (error) {
            console.warn('[HRRepository] getUtilizationMetrics failed, returning empty array:', error);
            return [];
        }
    },

    addStaff: async (staff: StaffMember) => {
        const newStaff = { ...staff, id: staff.id || crypto.randomUUID() };
        await db.put(STORES.STAFF, newStaff);
        // Opp #9 Integration Point
        IntegrationOrchestrator.publish(SystemEventType.STAFF_HIRED, { staff: newStaff });
        return newStaff;
    },
    
    updateStaff: async (id: string, updates: Partial<StaffMember>) => {
        const current = await db.get<StaffMember>(STORES.STAFF, id);
        if (!current) throw new Error("Staff not found");
        return db.put(STORES.STAFF, { ...current, ...updates });
    },
    
    deleteStaff: async (id: string) => db.delete(STORES.STAFF, id)
};
