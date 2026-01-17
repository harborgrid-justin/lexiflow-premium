/**
 * graphUtils.ts
 *
 * Utility functions for Nexus graph data transformation and rendering.
 *
 * @module components/visual/utils/graphUtils
 */

import { Case, EvidenceItem, NexusNodeData, Party } from "@/types";

export interface GraphLink {
  sourceIndex: number;
  targetIndex: number;
  strength: number;
  source: string;
  target: string;
}

export interface GraphData {
  nodes: NexusNodeData[];
  links: GraphLink[];
}

/**
 * Transforms case data, parties, and evidence into graph nodes
 */
export const transformToGraphNodes = (
  caseData: Case,
  parties: Party[],
  evidence: EvidenceItem[],
): NexusNodeData[] => {
  const rootNode: NexusNodeData = {
    id: "root",
    type: "root",
    label: caseData.title ? truncateLabel(caseData.title, 20) : "Untitled Case",
    original: caseData,
  };

  const partyNodes: NexusNodeData[] = parties.map((p) => ({
    id: p.id,
    type: (p.type === "Corporation" ? "org" : "party") as "org" | "party",
    label: p.name,
    original: p,
  }));

  const evidenceNodes: NexusNodeData[] = evidence.map((e) => ({
    id: e.id,
    type: "evidence" as const,
    label: truncateLabel(e.title, 15),
    original: e,
  }));

  return [rootNode, ...partyNodes, ...evidenceNodes];
};

/**
 * Creates graph links connecting root to parties and evidence
 */
export const createGraphLinks = (
  parties: Party[],
  evidence: EvidenceItem[],
): Omit<GraphLink, "sourceIndex" | "targetIndex">[] => {
  const partyLinks = parties.map((p) => ({
    source: "root",
    target: p.id,
    strength: 0.8,
  }));

  const evidenceLinks = evidence.map((e) => ({
    source: "root",
    target: e.id,
    strength: 0.3,
  }));

  return [...partyLinks, ...evidenceLinks];
};

/**
 * Truncates a label with ellipsis
 */
export const truncateLabel = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Converts link data to indexed format for physics simulation
 */
export const indexGraphLinks = (
  links: Omit<GraphLink, "sourceIndex" | "targetIndex">[],
): GraphLink[] => {
  return links.map((l) => ({
    sourceIndex: 0, // Will be computed by physics engine
    targetIndex: 0, // Will be computed by physics engine
    strength: l.strength,
    source: l.source,
    target: l.target,
  }));
};

/**
 * Main function to transform case data into graph structure
 */
export const buildGraphData = (
  caseData: Case,
  parties: Party[],
  evidence: EvidenceItem[],
): GraphData => {
  const nodes = transformToGraphNodes(caseData, parties, evidence);
  const rawLinks = createGraphLinks(parties, evidence);
  const links = indexGraphLinks(rawLinks);

  return { nodes, links };
};

/**
 * Gets stroke color for node type based on chart theme
 */
export const getNodeStrokeColor = (
  type: string,
  chartTheme: { colors: Record<string, string> },
  fallback: string,
): string => {
  switch (type) {
    case "party":
      return chartTheme.colors["blue"] || fallback;
    case "org":
      return chartTheme.colors["purple"] || fallback;
    case "evidence":
      return chartTheme.colors["amber"] || fallback;
    default:
      return fallback;
  }
};

/**
 * Gets node radius based on node type
 */
export const getNodeRadius = (type: string): number => {
  switch (type) {
    case "root":
      return 40;
    case "org":
      return 30;
    default:
      return 18;
  }
};

/**
 * Calculates text Y offset for node label based on type
 */
export const getNodeLabelYOffset = (type: string): number => {
  return type === "root" ? 46 : 32;
};
