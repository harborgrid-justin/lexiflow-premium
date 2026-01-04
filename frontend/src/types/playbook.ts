/**
 * Litigation Playbook Types
 *
 * Type Definitions:
 * - PlaybookStage: Represents a phase in litigation workflow
 * - LinkedAuthority: Legal authority citations
 * - AuthorityType: Discriminated union for authority types
 * - PlaybookDifficulty: Difficulty levels
 * - Playbook: Complete playbook structure
 */

/**
 * Represents a stage in litigation workflow
 * @property name - Stage identifier (e.g., 'Discovery', 'Trial')
 * @property duration - Expected time range (e.g., '90-120 Days')
 * @property criticalTasks - Key tasks that must be completed in this stage
 */
export type PlaybookStage = {
  readonly name: string;
  readonly duration: string;
  readonly criticalTasks: readonly string[];
};

/**
 * Legal difficulty classification
 */
export type PlaybookDifficulty = "Low" | "Medium" | "High";

/**
 * Authority type discriminator
 */
export type AuthorityType = "Case" | "Statute" | "Rule";

/**
 * Linked legal authority with citation
 * @property id - Unique identifier for the authority
 * @property title - Case name or statute title
 * @property citation - Proper legal citation format
 * @property type - Category of legal authority
 * @property relevance - Brief explanation of applicability
 */
export type LinkedAuthority = {
  readonly id: string;
  readonly title: string;
  readonly citation: string;
  readonly type: AuthorityType;
  readonly relevance: string;
};

/**
 * War room configuration for playbook
 */
export type WarRoomConfig = {
  readonly recommendedTabs: readonly string[];
  readonly evidenceTags: readonly string[];
};

/**
 * Complete litigation playbook structure
 * Defines strategy, stages, and authorities for a specific type of legal matter
 */
export type Playbook = {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly jurisdiction: string;
  readonly difficulty: PlaybookDifficulty;
  readonly phases: number;
  readonly description: string;
  readonly tags: readonly string[];
  readonly readiness: number;
  readonly status: string;
  readonly stages: readonly PlaybookStage[];
  readonly authorities: readonly LinkedAuthority[];
  readonly warRoomConfig: WarRoomConfig;
  readonly strategyNotes: string;
};
