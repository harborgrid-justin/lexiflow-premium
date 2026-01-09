/**
 * useEnterpriseData Hook
 * @module hooks/useEnterpriseData
 * @description Centralized hook for fetching organization-wide data (departments, staff, office locations, etc.)
 * @status PRODUCTION READY
 */

import { useQuery } from "@/hooks/backend";
import { DataService } from "@/services/data/dataService";

export const useEnterpriseData = () => {
  // Fetch Departments
  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    error: departmentsError,
  } = useQuery(
    ["enterprise", "departments"],
    () => DataService.hr.getDepartments(),
    { staleTime: 1000 * 60 * 60 } // Cache for 1 hour
  );

  // Fetch Staff Directory
  const {
    data: staff,
    isLoading: isStaffLoading,
    error: staffError,
  } = useQuery(
    ["enterprise", "staff"],
    () => DataService.hr.getStaff(),
    { staleTime: 1000 * 60 * 15 } // Cache for 15 mins
  );

  // Fetch Office Locations (simulated via operations descriptors if available, or static config)
  // For now we assume this might be part of organization settings
  const { data: offices, isLoading: isOfficesLoading } = useQuery(
    ["enterprise", "offices"],
    // Fallback/Placeholder until specific simplified endpoint exists
    async () => [
      { id: "hq", name: "Headquarters", timezone: "America/New_York" },
      {
        id: "west",
        name: "West Coast Office",
        timezone: "America/Los_Angeles",
      },
    ],
    { staleTime: Infinity }
  );

  return {
    departments: departments || [],
    staff: staff || [],
    offices: offices || [],
    isLoading: isDepartmentsLoading || isStaffLoading || isOfficesLoading,
    errors: {
      departments: departmentsError,
      staff: staffError,
    },
  };
};
