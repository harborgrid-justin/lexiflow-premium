import type { LoaderFunctionArgs } from "react-router";
import { DataService } from "../../services/dataService";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const [clients, contacts, opportunities] = await Promise.all([
    DataService.crm.getClients(),
    DataService.crm.getContacts(),
    DataService.crm.getOpportunities(),
  ]);
  return { clients, contacts, opportunities };
}
