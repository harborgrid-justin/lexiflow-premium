import type { LoaderFunctionArgs } from "react-router";
import { DataService } from "../../services/dataService";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const [users, settings, auditLogs] = await Promise.all([
    DataService.admin.getUsers(),
    DataService.admin.getSettings(),
    DataService.admin.getAuditLogs(),
  ]);
  return { users, settings, auditLogs };
}
