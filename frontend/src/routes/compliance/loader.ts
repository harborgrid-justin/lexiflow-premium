import type { LoaderFunctionArgs } from "react-router";
import { DataService } from "../../services/dataService";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const [checks, conflicts, deadlines] = await Promise.all([
    DataService.compliance.getChecks(),
    DataService.compliance.getConflicts(),
    DataService.compliance.getDeadlines(),
  ]);
  return { checks, conflicts, deadlines };
}
