import { DataService } from "@/services/data/data-service.service";
import type { LoaderFunctionArgs } from "react-router";
import { defer } from "react-router";

export async function clientLoader({ request: _request }: LoaderFunctionArgs) {
  const documents = await DataService.documents.getAll();
  return defer({ documents });
}
