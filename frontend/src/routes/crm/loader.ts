import { DataService } from "@/services/data/data-service.service";
import type { LoaderFunctionArgs } from "react-router";

export async function clientLoader(_args: LoaderFunctionArgs) {
  const [clients, contacts, opportunities] = await Promise.all([
    DataService.crm.getClients(),
    DataService.crm.getContacts(),
    DataService.crm.getOpportunities(),
  ]);
  return { clients, contacts, opportunities };
}
