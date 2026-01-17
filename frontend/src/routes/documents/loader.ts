import { documentsApi } from "@/lib/frontend-api";

import type { LoaderFunctionArgs } from "react-router";

export async function clientLoader(_args: LoaderFunctionArgs) {
  const result = await documentsApi.getAllDocuments({ page: 1, limit: 1000 });
  return { documents: result.ok ? result.data.data : [] };
}
