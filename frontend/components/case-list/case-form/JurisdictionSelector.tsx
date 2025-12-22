/**
 * JurisdictionSelector.tsx
 * 
 * Hierarchical jurisdiction selector supporting Federal (circuit/district) and
 * State (state/court level/county) court systems. Dynamically loads court options
 * based on selected hierarchy level.
 * 
 * @module components/case-list/case-form/JurisdictionSelector
 * @category Case Management - Forms
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { Globe, Building } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Utils & Data
import { cn } from '../../../utils/cn';
import { FEDERAL_CIRCUITS, STATE_JURISDICTIONS, StateJurisdiction } from '../../../data/federalHierarchy';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { JurisdictionObject } from '../../../types';

interface JurisdictionSelectorProps {
  onJurisdictionChange: (data: { finalCourt: string; jurisdictionConfig: JurisdictionObject } | null) => void;
}

export const JurisdictionSelector: React.FC<JurisdictionSelectorProps> = ({ onJurisdictionChange }) => {
    const { theme } = useTheme();
    const [system, setSystem] = useState<'Federal' | 'State' | null>(null);
    const [level1, setLevel1] = useState<string | null>(null); // e.g., '4th Circuit' or 'VA'
    const [level2, setLevel2] = useState<string | null>(null); // e.g., 'E.D. Virginia' or 'Circuit Court'
    const [finalCourt, setFinalCourt] = useState<string | null>(null);

    useEffect(() => {
        if (system && level1 && ((system === 'Federal' && level2) || (system === 'State' && level2 && finalCourt))) {
             onJurisdictionChange({
                finalCourt: finalCourt || level2!,
                jurisdictionConfig: {
                    country: 'USA',
                    state: system === 'State' ? (Object.values(STATE_JURISDICTIONS).find(s => s.name === level1)?.name || 'Unknown') : 'Federal',
                    courtLevel: system,
                    division: system === 'Federal' ? level2! : undefined,
                    county: system === 'State' ? finalCourt! : undefined,
                }
            });
        } else {
            onJurisdictionChange(null);
        }
    }, [system, level1, level2, finalCourt, onJurisdictionChange]);

    const handleSystemSelect = (sys: 'Federal' | 'State') => {
        setSystem(sys);
        setLevel1(null);
        setLevel2(null);
        setFinalCourt(null);
    };

    const level1Options = system === 'Federal' 
        ? FEDERAL_CIRCUITS.map(c => c.name) 
        : Object.values(STATE_JURISDICTIONS).map(s => s.name);
    
    const level2Options = useMemo(() => {
        if (!level1) return [];
        if (system === 'Federal') {
            return FEDERAL_CIRCUITS.find(c => c.name === level1)?.districts || [];
        }
        if (system === 'State') {
            const stateKey = Object.keys(STATE_JURISDICTIONS).find(k => STATE_JURISDICTIONS[k].name === level1);
            return stateKey ? STATE_JURISDICTIONS[stateKey].levels.map(l => l.name) : [];
        }
        return [];
    }, [system, level1]);

    const finalCourtOptions = useMemo(() => {
        if (!level1 || !level2) return [];
        if (system === 'State') {
            const stateKey = Object.keys(STATE_JURISDICTIONS).find(k => STATE_JURISDICTIONS[k].name === level1);
            return stateKey ? STATE_JURISDICTIONS[stateKey].levels.find(l => l.name === level2)?.courts || [] : [];
        }
        return [];
    }, [system, level1, level2]);

    const renderSelect = (label: string, value: string | null, onChange: (val: string) => void, options: string[], placeholder: string, disabled: boolean) => (
        <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>{label}</label>
            <select
                className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                value={value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                disabled={disabled}
            >
                <option value="">{placeholder}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div className={cn("p-4 rounded-lg border space-y-4", theme.surface.highlight, theme.border.default)}>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => handleSystemSelect('Federal')}
                    className={cn("p-4 border rounded-lg text-center", theme.border.default, system === 'Federal' ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200" : `hover:${theme.surface.default}`)}
                >
                    <Globe className="h-6 w-6 mx-auto text-blue-600 mb-1"/>
                    <span className="text-sm font-bold text-blue-800">Federal</span>
                </button>
                <button
                    onClick={() => handleSystemSelect('State')}
                    className={cn("p-4 border rounded-lg text-center", theme.border.default, system === 'State' ? "bg-green-50 border-green-300 ring-1 ring-green-200" : `hover:${theme.surface.default}`)}
                >
                    <Building className="h-6 w-6 mx-auto text-green-600 mb-1"/>
                    <span className="text-sm font-bold text-green-800">State</span>
                </button>
            </div>

            {renderSelect(
                system === 'Federal' ? 'Circuit' : 'State',
                level1,
                (val) => { setLevel1(val); setLevel2(null); setFinalCourt(null); },
                level1Options,
                `Select ${system}...`,
                !system
            )}

            {system === 'Federal' && renderSelect(
                'District',
                level2,
                (val) => { setLevel2(val); setFinalCourt(val); },
                level2Options,
                'Select District...',
                !level1
            )}

            {system === 'State' && renderSelect(
                'Court Level',
                level2,
                (val) => { setLevel2(val); setFinalCourt(null); },
                level2Options,
                'Select Level...',
                !level1
            )}
            
            {system === 'State' && level2 && finalCourtOptions.length > 0 && renderSelect(
                'Court Name',
                finalCourt,
                (val) => setFinalCourt(val),
                finalCourtOptions,
                'Select Court...',
                !level2
            )}
        </div>
    );
};