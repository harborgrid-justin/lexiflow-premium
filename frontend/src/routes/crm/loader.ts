/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

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
