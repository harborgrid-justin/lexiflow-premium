/**
 * Litigation Playbook Mock Data
 *
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.knowledge.getPlaybooks() instead.
 * This constant is only for seeding and testing purposes.
 */

import { Playbook } from "@/types/playbook";

/**
 * @deprecated MOCK DATA - Use DataService.knowledge instead
 */
export const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: "pb1",
    title: "CA Litigation Standard",
    category: "Litigation",
    jurisdiction: "California",
    difficulty: "Medium" as const,
    phases: 3,
    description: "Standard California litigation playbook",
    tags: [],
    readiness: 90,
    status: "Active",
    stages: [],
    authorities: [],
    warRoomConfig: {
      enabled: false,
      dedicatedSpace: false,
      teamSize: 0,
      requiredRoles: [],
    },
    strategyNotes: "",
  },
  {
    id: "pb2",
    title: "Delaware Chancery M&A",
    category: "M&A",
    jurisdiction: "Delaware",
    difficulty: "High" as const,
    phases: 4,
    description: "Delaware Chancery Court M&A playbook",
    tags: [],
    readiness: 85,
    status: "Active",
    stages: [],
    authorities: [],
    warRoomConfig: {
      enabled: false,
      dedicatedSpace: false,
      teamSize: 0,
      requiredRoles: [],
    },
    strategyNotes: "",
  },
];
