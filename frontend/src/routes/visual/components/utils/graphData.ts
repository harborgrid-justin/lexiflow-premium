/**
 * @module features/visual/utils/graphData
 * @category Visual - Utilities
 * @description Pure functions for building and processing graph data
 * 
 * BEST PRACTICES:
 * - Component isolation - pure logic extracted (Practice #1)
 * - Type-safe architecture (Practice #5)
 * - Clear module boundaries (Practice #10)
 */

import { type Case, type Party, type EvidenceItem, type NexusNodeData } from '@/types';

export interface GraphNode {
  id: string;
  label: string;
  type: 'root' | 'party' | 'evidence';
  data: NexusNodeData;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: NexusNodeData[];
  links: GraphLink[];
}

/**
 * Pure function to build graph data from case entities
 * @param caseData - Case information
 * @param parties - Array of parties
 * @param evidence - Array of evidence items
 * @returns Structured graph data with nodes and links
 */
export const buildGraphData = (
  caseData: Case,
  parties: Party[],
  evidence: EvidenceItem[]
): GraphData => {
  const nodes: NexusNodeData[] = [
    { id: caseData.id, label: caseData.title, type: 'root', original: caseData }
  ];
  
  const links: GraphLink[] = [];
  
  // Add party nodes and links
  parties.forEach(party => {
    nodes.push({ id: party.id, label: party.name, type: 'party', original: party });
    links.push({ source: caseData.id, target: party.id });
  });
  
  // Add evidence nodes and links
  evidence.forEach(item => {
    nodes.push({ id: item.id, label: item.title, type: 'evidence', original: item });
    links.push({ source: caseData.id, target: item.id });
  });
  
  return { nodes, links };
};

/**
 * Get node radius based on node type
 * @param type - Node type
 * @returns Radius in pixels
 */
export const getNodeRadius = (type: string): number => {
  switch (type) {
    case 'root': return 20;
    case 'party': return 16;
    case 'evidence': return 14;
    default: return 12;
  }
};

/**
 * Get label Y offset based on node type
 * @param type - Node type
 * @returns Y offset in pixels
 */
export const getNodeLabelYOffset = (type: string): number => {
  switch (type) {
    case 'root': return 5;
    case 'party': return 4;
    default: return 3;
  }
};

/**
 * Get node stroke color based on type and theme
 * @param type - Node type
 * @param chartTheme - Chart theme object
 * @param defaultColor - Default color fallback
 * @returns Color string
 */
export const getNodeStrokeColor = (
  type: string,
  chartTheme: { primary?: string; secondary?: string; accent?: string } | null | undefined,
  defaultColor: string
): string => {
  switch (type) {
    case 'root': return chartTheme?.primary || defaultColor;
    case 'party': return chartTheme?.secondary || defaultColor;
    case 'evidence': return chartTheme?.accent || defaultColor;
    default: return defaultColor;
  }
};
