import { DataService } from "@/services/data/data-service.service";
import type { LoaderFunctionArgs } from "react-router";

export async function clientLoader(_args: LoaderFunctionArgs) {
  const documents = await DataService.documents.getAll();
  return { documents };
}
