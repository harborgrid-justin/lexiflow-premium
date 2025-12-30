/**
 * @module components/entities/EntityProfile
 * @category Entities
 * @description Detailed entity profile with relationships and matter history.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { X, MapPin, Mail, ShieldAlert, Link, Briefcase, GitBranch } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Button } from '@/components/atoms';
import { Tabs } from '@/components/molecules';
import { EmptyState } from '@/components/molecules';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { LegalEntity, EntityRelationship } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EntityProfileProps {
  /** Entity ID to display. */
  entityId: string;
  /** Callback when profile is closed. */
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EntityProfile: React.FC<EntityProfileProps> = ({ entityId, onClose }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  // Efficient Caching using useQuery
  const { data: entity, isLoading: isLoadingEntity } = useQuery<LegalEntity | undefined>(
      ['entities', entityId],
      () => DataService.entities.getById(entityId)
  );

  const { data: relationships = [], isLoading: _isLoadingRels } = useQuery<EntityRelationship[]>(
      ['relationships', entityId],
      () => DataService.entities.getRelationships(entityId)
  );

  if (isLoadingEntity || !entity) {
      return (
          <div className={cn("h-full flex items-center justify-center border-l", theme.surface.default, theme.border.default)}>
              <div className="animate-pulse flex flex-col items-center">
                  <div className={cn("h-16 w-16 rounded-full mb-4", theme.surface.highlight)}></div>
                  <div className={cn("h-4 w-32 rounded", theme.surface.highlight)}></div>
              </div>
          </div>
      );
  }

  return (
    <div className={cn("h-full flex flex-col border-l shadow-xl", theme.surface.default, theme.border.default)}>
        {/* Header */}
        <div className={cn("p-6 border-b", theme.surface.highlight, theme.border.default)}>
            <div className="flex justify-between items-start mb-4">
                <h2 className={cn("text-2xl font-bold", theme.text.primary)}>{entity.name}</h2>
                <button onClick={onClose} aria-label="Close entity profile" className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.default}`)}><X className="h-5 w-5"/></button>
            </div>
            <div className="flex gap-2 mb-4">
                {entity.roles.map(r => <span key={r} className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", theme.status.info.bg, theme.status.info.text)}>{r}</span>)}
                <span className={cn("px-2 py-0.5 rounded text-xs border", theme.surface.default, theme.border.default, theme.text.secondary)}>{entity.type}</span>
            </div>
            <div className={cn("flex flex-wrap gap-4 text-sm", theme.text.secondary)}>
                {entity.city && <span className="flex items-center"><MapPin className="h-3 w-3 mr-1"/> {entity.city}, {entity.state}</span>}
                {entity.email && <span className="flex items-center"><Mail className="h-3 w-3 mr-1"/> {entity.email}</span>}
            </div>
        </div>

        {/* Tabs */}
        <div className={cn("px-4 border-b", theme.border.default)}>
            <Tabs 
                tabs={['overview', 'relationships', 'matters', 'docs']} 
                activeTab={activeTab} 
                onChange={setActiveTab} 
                variant="underline"
            />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
                        <h4 className={cn("font-bold text-sm mb-3 uppercase tracking-wide", theme.text.secondary)}>Contact Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className={cn("block text-xs uppercase", theme.text.tertiary)}>Phone</span> <span className={theme.text.primary}>{entity.phone || '-'}</span></div>
                            <div><span className={cn("block text-xs uppercase", theme.text.tertiary)}>Website</span> <span className={theme.text.primary}>{entity.website || '-'}</span></div>
                            <div className="col-span-2"><span className={cn("block text-xs uppercase", theme.text.tertiary)}>Address</span> <span className={theme.text.primary}>{entity.address || '-'}</span></div>
                        </div>
                    </div>

                    <div className={cn("p-4 rounded-lg border", entity.riskScore > 50 ? cn(theme.status.error.bg, theme.status.error.border) : cn(theme.status.success.bg, theme.status.success.border))}>
                        <h4 className={cn("font-bold text-sm mb-2 flex items-center", entity.riskScore > 50 ? theme.status.error.text : theme.status.success.text)}>
                            <ShieldAlert className="h-4 w-4 mr-2"/> Risk Profile
                        </h4>
                        <p className={cn("text-xs mb-2", entity.riskScore > 50 ? theme.status.error.text : theme.status.success.text)}>Risk Score: <strong>{entity.riskScore}/100</strong></p>
                        <div className={cn("w-full rounded-full h-1.5", theme.surface.highlight)}>
                            <div className={cn("h-1.5 rounded-full", entity.riskScore > 50 ? "bg-red-600" : "bg-green-600")} style={{width: `${entity.riskScore}%`}}></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'relationships' && (
                <div className="space-y-3 animate-in fade-in">
                    {relationships.map(rel => (
                        <div key={rel.id} className={cn("p-3 rounded border flex items-center justify-between", theme.surface.default, theme.border.default)}>
                            <div className="flex items-center gap-3">
                                <Link className={cn("h-4 w-4", theme.text.tertiary)}/>
                                <div>
                                    <p className={cn("text-sm font-bold", theme.text.primary)}>{rel.type.replace('_', ' ')}</p>
                                    <p className={cn("text-xs", theme.text.secondary)}>{rel.description} ({rel.active ? 'Current' : 'Past'})</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost">View</Button>
                        </div>
                    ))}
                    {relationships.length === 0 && (
                        <EmptyState
                            icon={GitBranch}
                            title="No relationships"
                            description="Map connections between entities to visualize relationships."
                            className="py-6"
                            action={<Button variant="outline" icon={Link}>Add Connection</Button>}
                        />
                    )}
                    {relationships.length > 0 && (
                        <Button variant="outline" className="w-full border-dashed" icon={Link}>Add Connection</Button>
                    )}
                </div>
            )}

            {activeTab === 'matters' && (
                <div className="space-y-3 animate-in fade-in">
                     <div className={cn("p-3 rounded border flex items-center gap-3", theme.surface.default, theme.border.default)}>
                        <Briefcase className={cn("h-5 w-5", theme.primary.text)}/>
                        <div>
                            <p className={cn("text-sm font-bold", theme.text.primary)}>Martinez v. TechCorp</p>
                            <p className={cn("text-xs", theme.text.secondary)}>Role: Defendant</p>
                        </div>
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};


