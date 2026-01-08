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
    difficulty: "Medium",
    phases: 5,
    description: "Standard litigation playbook for California jurisdiction",
    tags: ["litigation", "california"],
    readiness: 100,
    status: "active",
    stages: [],
    authorities: [],
    warRoomConfig: { recommendedTabs: [], evidenceTags: [] },
    strategyNotes: "",
  },
  {
    id: "pb2",
    title: "Delaware Chancery M&A",
    category: "M&A",
    jurisdiction: "Delaware",
    difficulty: "High",
    phases: 7,
    description: "M&A playbook for Delaware Chancery Court",
    tags: ["m&a", "delaware", "chancery"],
    readiness: 100,
    status: "active",
    stages: [],
    authorities: [],
    warRoomConfig: { recommendedTabs: [], evidenceTags: [] },
    strategyNotes: "",
  },
];
