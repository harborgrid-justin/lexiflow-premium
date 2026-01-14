import type { LoaderFunctionArgs } from "react-router";
import { DataService } from "../../services/dataService";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const documents = await DataService.documents.getAll();
  return { documents };
}
