/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { crmApi } from "@/lib/frontend-api";
import type { LoaderFunctionArgs } from "react-router";
export async function clientLoader(_args: LoaderFunctionArgs) {
  const [leadsResult, relationshipsResult, opportunitiesResult] =
    await Promise.all([
      crmApi.getLeads(),
      crmApi.getRelationships(),
      crmApi.getOpportunities(),
    ]);

  return {
    clients: leadsResult.ok ? leadsResult.data : [],
    contacts: relationshipsResult.ok ? relationshipsResult.data : [],
    opportunities: opportunitiesResult.ok ? opportunitiesResult.data : [],
  };
}
