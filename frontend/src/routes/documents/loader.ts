import type { LoaderFunctionArgs } from "react-router";
import { defer } from "react-router";
import { DataService } from "../../services/dataService";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const documents = await DataService.documents.getAll();
  return defer({ documents });
}
