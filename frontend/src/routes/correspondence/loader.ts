import { DataService } from "@/services/data/data-service.service";
import type { LoaderFunctionArgs } from "react-router";
import { defer } from "react-router";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const [emails, letters, templates] = await Promise.all([
    DataService.correspondence.getEmails(),
    DataService.correspondence.getLetters(),
    DataService.correspondence.getTemplates(),
  ]);
  return defer({ emails, letters, templates });
}
