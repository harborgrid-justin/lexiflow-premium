/**
 * War Room Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type WarRoomSession = {
  id: string;
  caseId: string;
  caseName: string;
  date: string;
  status: "Scheduled" | "In Progress" | "Completed";
  participants: string[];
  agenda: string;
  location: string;
};

export interface WarRoomLoaderData {
  sessions: WarRoomSession[];
}

export async function warRoomLoader() {
  const sessions = await DataService.warRoom.getAll().catch(() => []);

  return {
    sessions: sessions || [],
  };
}
