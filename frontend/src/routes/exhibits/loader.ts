/**
 * Exhibits Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";
import { defer } from "react-router";

type Exhibit = {
  id: string;
  exhibitNumber: string;
  title: string;
  type: "Document" | "Photo" | "Video" | "Audio" | "Physical";
  caseId: string;
  admissionStatus: "Pending" | "Admitted" | "Rejected";
  dateSubmitted: string;
  description: string;
};

export interface ExhibitsLoaderData {
  exhibits: Exhibit[];
}

export async function exhibitsLoader() {
  const exhibits = await DataService.exhibits.getAll().catch(() => []);

  return defer({
    exhibits: exhibits || [],
  });
}
