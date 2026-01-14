import { DataService } from "@/services/data/data-service.service";

export async function clientLoader() {
  const [checks, conflicts, deadlines] = await Promise.all([
    DataService.compliance.getChecks(),
    DataService.compliance.getConflicts(),
    DataService.compliance.getDeadlines(),
  ]);
  return { checks, conflicts, deadlines };
}
