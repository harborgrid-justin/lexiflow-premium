import { DataService } from "@/services/data/data-service.service";
import { defer } from "react-router";

export async function clientLoader() {
  const [checks, conflicts, deadlines] = await Promise.all([
    DataService.compliance.getChecks(),
    DataService.compliance.getConflicts(),
    DataService.compliance.getDeadlines(),
  ]);
  return defer({ checks, conflicts, deadlines });
}
