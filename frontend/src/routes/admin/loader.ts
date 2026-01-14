import { DataService } from "@/services/data/data-service.service";
import type { LoaderFunctionArgs } from "react-router";

export async function clientLoader({ request: _request }: LoaderFunctionArgs) {
  const [users, settings, auditLogs] = await Promise.all([
    DataService.admin.getUsers(),
    DataService.admin.getSettings(),
    DataService.admin.getAuditLogs(),
  ]);
  return { users, settings, auditLogs };
}
