/**
 * Interface for jurisdiction map visualization nodes
 */

export interface JurisdictionMapNode {
  id: string;
  label: string;
  type: string;
  system: string;
  fullName: string;
  x: number;
  y: number;
  radius: number;
}
