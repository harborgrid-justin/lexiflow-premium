/**
 * jurisdictionConfig.ts
 * 
 * Configuration constants for the Jurisdiction Manager module.
 * 
 * @module components/jurisdiction/utils/jurisdictionConfig
 */

import { Globe, Scale, Building2, Shield, Users, Map as MapIcon, Gavel, type LucideIcon } from 'lucide-react';

export type JurisdictionView = 'federal' | 'state' | 'regulatory' | 'international' | 'arbitration' | 'local' | 'map';

export interface JurisdictionTab {
  id: JurisdictionView;
  label: string;
  icon: LucideIcon;
}

/**
 * Tab configuration for the Jurisdiction Manager
 */
export const JURISDICTION_TABS: JurisdictionTab[] = [
  { id: 'federal', label: 'Federal', icon: Scale },
  { id: 'state', label: 'State', icon: Building2 },
  { id: 'map', label: 'Geo Map', icon: MapIcon },
  { id: 'regulatory', label: 'Regulatory', icon: Shield },
  { id: 'international', label: 'International', icon: Globe },
  { id: 'arbitration', label: 'Arbitration', icon: Users },
  { id: 'local', label: 'Local Rules', icon: Gavel },
];

/**
 * Gets tab configuration by ID
 */
export const getTabById = (id: JurisdictionView): JurisdictionTab | undefined => {
  return JURISDICTION_TABS.find(tab => tab.id === id);
};

/**
 * Validates if a string is a valid jurisdiction view
 */
export const isValidJurisdictionView = (view: string): view is JurisdictionView => {
  return JURISDICTION_TABS.some(tab => tab.id === view);
};
