/**
 * @module components/entities/EntityMap
 * @category Entities
 * @description Geographic entity distribution map with jurisdiction overlay.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Components
import { JurisdictionGeoMap } from '../../knowledge/jurisdiction/JurisdictionGeoMap';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { LegalEntity } from '../../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EntityMapProps {
    /** List of entities to display on map. */
    entities: LegalEntity[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EntityMap: React.FC<EntityMapProps> = ({ entities }) => {
    const { theme } = useTheme();

    return (
        <div className="h-full flex flex-col">
            <div className={cn("absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border max-w-xs", theme.border.default)}>
                <h4 className={cn("font-bold text-sm mb-1", theme.text.primary)}>Entity Distribution</h4>
                <p className={cn("text-xs", theme.text.secondary)}>
                    Visualizing {entities.length} entities across jurisdictions. 
                </p>
                <div className="mt-2 flex gap-2 text-[10px]">
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Federal</span>
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> State</span>
                </div>
            </div>
            <JurisdictionGeoMap />
        </div>
    );
};
