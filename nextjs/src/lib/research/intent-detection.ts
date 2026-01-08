/**
 * Research Query Intent Detection
 *
 * Heuristic-based intent detection for categorizing legal research queries.
 * Identifies whether a query is targeting case law, statutes, regulations,
 * or general legal research.
 *
 * @module lib/research/intent-detection
 */

// ==================== Type Definitions ====================

/**
 * Intent types for legal research queries.
 * Each intent corresponds to a different category of legal materials.
 */
export type IntentType = 'general' | 'caselaw' | 'statute' | 'regulation';

/**
 * Intent detection result with metadata.
 */
export interface IntentDetectionResult {
  /** Detected intent type */
  intent: IntentType;
  /** Confidence level (0-1) based on pattern match strength */
  confidence: number;
  /** Patterns that matched the query */
  matchedPatterns: string[];
}

/**
 * Configuration for intent pattern matching.
 */
export interface IntentPatternConfig {
  /** Pattern name for debugging/display */
  name: string;
  /** Regular expression for matching */
  pattern: RegExp;
  /** Weight for confidence calculation (higher = more confident) */
  weight: number;
}

// ==================== Intent Patterns ====================

/**
 * Regex patterns for detecting query intent.
 * Each pattern is designed to match common legal terminology and citation formats.
 *
 * Pattern Design Rationale:
 * - Case law: Court terminology, case citation patterns (v., versus), legal holdings
 * - Statute: USC citations, code references, legislative terminology
 * - Regulation: CFR citations, agency terminology, regulatory language
 */
export const INTENT_PATTERNS: Readonly<Record<IntentType, ReadonlyArray<IntentPatternConfig>>> = {
  /**
   * Case law patterns - court decisions, opinions, and precedents.
   * Matches: "Smith v. Jones", "court held", "precedent", "ruling", etc.
   */
  caselaw: [
    {
      name: 'versus_citation',
      pattern: /\bv\.\s*\w+|\bversus\b/i,
      weight: 0.9,
    },
    {
      name: 'holding_terminology',
      pattern: /\b(?:holding|held|ruled|decided|opinion|ruling|judgment)\b/i,
      weight: 0.7,
    },
    {
      name: 'precedent_reference',
      pattern: /\b(?:precedent|stare\s*decisis|overruled|distinguished)\b/i,
      weight: 0.8,
    },
    {
      name: 'court_reference',
      pattern: /\b(?:court|circuit|supreme|appeals|district|tribunal)\b/i,
      weight: 0.5,
    },
    {
      name: 'reporter_citation',
      pattern: /\d+\s+(?:U\.?S\.?|F\.?\s*(?:2d|3d|4th)?|S\.?\s*Ct\.?|L\.?\s*Ed\.?)\s+\d+/i,
      weight: 0.95,
    },
    {
      name: 'case_elements',
      pattern: /\b(?:plaintiff|defendant|appellant|appellee|petitioner|respondent)\b/i,
      weight: 0.6,
    },
  ],

  /**
   * Statute patterns - legislative codes and statutory provisions.
   * Matches: "26 USC 501", "section 1983", "statutory", "enacted", etc.
   */
  statute: [
    {
      name: 'usc_citation',
      pattern: /\d+\s*U\.?S\.?C\.?\s*(?:section|\u00A7|sec\.?)?\s*\d+/i,
      weight: 0.95,
    },
    {
      name: 'section_reference',
      pattern: /\b(?:section|\u00A7|sec\.?)\s*\d+/i,
      weight: 0.7,
    },
    {
      name: 'code_reference',
      pattern: /\b(?:code|statute|statutes|act|acts|law|laws)\b/i,
      weight: 0.5,
    },
    {
      name: 'state_code',
      pattern: /\b(?:penal|civil|criminal|commercial|probate|family)\s+code\b/i,
      weight: 0.8,
    },
    {
      name: 'legislative_terms',
      pattern: /\b(?:enacted|amended|repealed|codified|provision|subsection)\b/i,
      weight: 0.6,
    },
    {
      name: 'public_law',
      pattern: /\b(?:public\s+law|P\.?L\.?)\s*\d+[-\s]*\d+/i,
      weight: 0.9,
    },
  ],

  /**
   * Regulation patterns - administrative rules and agency regulations.
   * Matches: "40 CFR 122", "EPA regulation", "rulemaking", etc.
   */
  regulation: [
    {
      name: 'cfr_citation',
      pattern: /\d+\s*C\.?F\.?R\.?\s*(?:part|\u00A7|section|sec\.?)?\s*\d+/i,
      weight: 0.95,
    },
    {
      name: 'federal_register',
      pattern: /\b(?:federal\s+register|fed\.?\s*reg\.?)\b/i,
      weight: 0.85,
    },
    {
      name: 'regulatory_terms',
      pattern: /\b(?:regulation|regulatory|rulemaking|rule|promulgated)\b/i,
      weight: 0.5,
    },
    {
      name: 'agency_reference',
      pattern: /\b(?:EPA|FDA|SEC|FTC|FCC|OSHA|DOL|DOJ|HHS|IRS|USCIS)\b/,
      weight: 0.6,
    },
    {
      name: 'administrative_terms',
      pattern: /\b(?:administrative|agency|agencies|commissioner|administrator)\b/i,
      weight: 0.4,
    },
    {
      name: 'compliance_terms',
      pattern: /\b(?:compliance|enforcement|violation|penalty|penalties)\b/i,
      weight: 0.3,
    },
  ],

  /**
   * General patterns - catch-all for non-specific legal research.
   * These patterns have low weights and serve as a baseline.
   */
  general: [
    {
      name: 'legal_research',
      pattern: /\b(?:legal|law|attorney|lawyer|jurisdiction)\b/i,
      weight: 0.1,
    },
  ],
} as const;

/**
 * Minimum query length required for intent detection.
 * Shorter queries lack sufficient context for accurate classification.
 */
export const MIN_QUERY_LENGTH = 5;

/**
 * Default debounce delay for real-time intent detection (milliseconds).
 */
export const INTENT_DETECTION_DEBOUNCE_MS = 600;

// ==================== Intent Detection Functions ====================

/**
 * Detects the intent type from a search query using pattern matching.
 *
 * Algorithm:
 * 1. Skip detection for queries below minimum length (returns 'general')
 * 2. Test query against all patterns for each intent type
 * 3. Calculate confidence scores based on matched pattern weights
 * 4. Return the intent with highest confidence (or 'general' if no matches)
 *
 * @param query - The search query to analyze
 * @returns The detected intent type
 *
 * @example
 * ```typescript
 * detectQueryIntent('Smith v. Jones holding'); // Returns 'caselaw'
 * detectQueryIntent('26 USC 501(c)(3)'); // Returns 'statute'
 * detectQueryIntent('40 CFR 122.1'); // Returns 'regulation'
 * detectQueryIntent('contract law'); // Returns 'general'
 * ```
 */
export function detectQueryIntent(query: string): IntentType {
  const result = detectQueryIntentWithDetails(query);
  return result.intent;
}

/**
 * Detects query intent with detailed confidence and pattern match information.
 * Use this function when you need more context about the detection result.
 *
 * @param query - The search query to analyze
 * @returns Detection result with intent, confidence, and matched patterns
 *
 * @example
 * ```typescript
 * const result = detectQueryIntentWithDetails('Smith v. Jones');
 * // { intent: 'caselaw', confidence: 0.9, matchedPatterns: ['versus_citation'] }
 * ```
 */
export function detectQueryIntentWithDetails(query: string): IntentDetectionResult {
  // Return early for short queries - insufficient context
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return {
      intent: 'general',
      confidence: 0,
      matchedPatterns: [],
    };
  }

  const normalizedQuery = query.trim();

  // Calculate scores for each intent type
  const intentScores: Map<IntentType, { score: number; patterns: string[] }> = new Map();

  const intentTypes: IntentType[] = ['caselaw', 'statute', 'regulation'];

  for (const intentType of intentTypes) {
    const patterns = INTENT_PATTERNS[intentType];
    let totalScore = 0;
    const matchedPatternNames: string[] = [];

    for (const config of patterns) {
      if (config.pattern.test(normalizedQuery)) {
        totalScore += config.weight;
        matchedPatternNames.push(config.name);
      }
    }

    if (totalScore > 0) {
      intentScores.set(intentType, {
        score: totalScore,
        patterns: matchedPatternNames,
      });
    }
  }

  // Find the intent with the highest score
  let bestIntent: IntentType = 'general';
  let bestScore = 0;
  let bestPatterns: string[] = [];

  for (const [intent, data] of intentScores) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestIntent = intent;
      bestPatterns = data.patterns;
    }
  }

  // Normalize confidence to 0-1 range (cap at 1.0)
  const confidence = Math.min(bestScore, 1.0);

  return {
    intent: bestIntent,
    confidence,
    matchedPatterns: bestPatterns,
  };
}

/**
 * Gets display metadata for an intent type.
 * Useful for rendering intent badges with appropriate styling.
 *
 * @param intent - The intent type
 * @returns Display configuration for the intent
 */
export function getIntentDisplayInfo(intent: IntentType): {
  label: string;
  shortLabel: string;
  colorClass: string;
  bgColorClass: string;
  description: string;
} {
  switch (intent) {
    case 'caselaw':
      return {
        label: 'Case Law',
        shortLabel: 'caselaw',
        colorClass: 'text-blue-700 dark:text-blue-400',
        bgColorClass: 'bg-blue-100 dark:bg-blue-900/40',
        description: 'Court decisions and judicial opinions',
      };
    case 'statute':
      return {
        label: 'Statute',
        shortLabel: 'statute',
        colorClass: 'text-purple-700 dark:text-purple-400',
        bgColorClass: 'bg-purple-100 dark:bg-purple-900/40',
        description: 'Legislative codes and statutory provisions',
      };
    case 'regulation':
      return {
        label: 'Regulation',
        shortLabel: 'regulation',
        colorClass: 'text-amber-700 dark:text-amber-400',
        bgColorClass: 'bg-amber-100 dark:bg-amber-900/40',
        description: 'Administrative rules and agency regulations',
      };
    case 'general':
    default:
      return {
        label: 'General Search',
        shortLabel: 'general',
        colorClass: 'text-slate-500 dark:text-slate-400',
        bgColorClass: 'bg-slate-100 dark:bg-slate-700',
        description: 'General legal research',
      };
  }
}

/**
 * Validates if a string is a valid IntentType.
 * Type guard for runtime validation.
 *
 * @param value - Value to check
 * @returns True if value is a valid IntentType
 */
export function isValidIntentType(value: unknown): value is IntentType {
  return (
    typeof value === 'string' &&
    ['general', 'caselaw', 'statute', 'regulation'].includes(value)
  );
}
