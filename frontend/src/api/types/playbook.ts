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
    name: "CA Litigation Standard",
    jurisdiction: "California",
    matterType: "Litigation",
    stages: [],
  },
  {
    id: "pb2",
    name: "Delaware Chancery M&A",
    jurisdiction: "Delaware",
    matterType: "M&A",
    stages: [],
  },
];
