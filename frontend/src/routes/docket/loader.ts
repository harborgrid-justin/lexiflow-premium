import type { LoaderFunctionArgs } from "react-router";
import { DataService } from "../../services/dataService";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const docketEntries = await DataService.docket.getAll();
  return { docketEntries };
}
