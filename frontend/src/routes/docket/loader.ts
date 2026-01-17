import { docketApi } from "@/lib/frontend-api";

import type { LoaderFunctionArgs } from "react-router";

export async function clientLoader(_args: LoaderFunctionArgs) {
  const result = await docketApi.getAll();
  return { docketEntries: result.ok ? result.data : [] };
}
