/**
 * @module components/entities/EntityVendorOps
 * @category Entity Management - Vendor Management
 * @description Preferred vendor program dashboard with rate cards, attorney ratings, and cost savings tracking.
 *
 * THEME SYSTEM USAGE:
 * Uses theme.surface, theme.text, theme.border for consistent theming. Hardcoded green for savings metrics.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import { Star, DollarSign, TrendingDown, Briefcase } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Components
import { Card } from '@/components/ui/molecules/Card/Card';
import { Button } from '@/components/ui/atoms/Button';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// Types
import { LegalEntity } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EntityVendorOpsProps {
  entities: LegalEntity[];
  onSelect: (e: LegalEntity) => void;
}

export const EntityVendorOps: React.FC<EntityVendorOpsProps> = ({ entities, onSelect }) => {
  const { theme } = useTheme();

  const vendors = useMemo(() =>
      entities.filter(e => e.type === 'Law Firm' || e.type === 'Vendor' || e.roles.includes('Expert')),
  [entities]);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Preferred Vendor Program">
                <div className="space-y-4">
                    <p className={cn("text-sm", theme.text.secondary)}>Manage approved counsel lists and negotiated rates.</p>
                    <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-xs font-bold text-green-800 uppercase">Avg. Savings</span>
                        <span className="text-lg font-bold text-green-700 flex items-center"><TrendingDown className="h-4 w-4 mr-1"/> 12%</span>
                    </div>
                    <Button className="w-full" variant="outline">View Rate Cards</Button>
                </div>
            </Card>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map(vendor => (
                    <div key={vendor.id} className={cn("p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer", theme.surface.default, theme.border.default)} onClick={() => onSelect(vendor)}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-indigo-600"/>
                                <h4 className={cn("font-bold text-sm", theme.text.primary)}>{vendor.name}</h4>
                            </div>
                            <div className="flex items-center text-yellow-500">
                                <Star className="h-3 w-3 fill-current"/>
                                <span className="text-xs font-bold ml-1 text-slate-700">4.8</span>
                            </div>
                        </div>
                        <p className={cn("text-xs mb-3", theme.text.secondary)}>{vendor.type} • {vendor.city}</p>
                        <div className={cn("flex justify-between items-center text-xs pt-2 border-t", theme.border.default)}>
                            <span className={theme.text.tertiary}>Hourly Rate</span>
                            <span className={cn("font-mono font-bold flex items-center", theme.text.primary)}><DollarSign className="h-3 w-3"/> {vendor.riskScore * 10 + 200}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
