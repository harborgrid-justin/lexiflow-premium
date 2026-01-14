import { DataService } from "@/services/data/data-service.service";
import type { LoaderFunctionArgs } from "react-router";
import { defer } from "react-router";

// LoaderFunctionArgs provides type safety even if we don't use all properties
export async function clientLoader(_args: LoaderFunctionArgs) {
  const [emails, letters, templates] = await Promise.all([
    DataService.correspondence.getEmails(),
    DataService.correspondence.getLetters(),
    DataService.correspondence.getTemplates(),
  ]);
  return defer({ emails, letters, templates });
}
