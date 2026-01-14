import type { LoaderFunctionArgs } from "react-router";
import { defer } from "react-router";
import { DataService } from "../../services/dataService";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const [clients, contacts, opportunities] = await Promise.all([
    DataService.crm.getClients(),
    DataService.crm.getContacts(),
    DataService.crm.getOpportunities(),
  ]);
  return defer({ clients, contacts, opportunities });
}
