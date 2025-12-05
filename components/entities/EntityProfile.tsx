
import React, { useState } from 'react';
import { LegalEntity, EntityRelationship } from '../../types';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { X, MapPin, Mail, Phone, Globe, ShieldAlert, Link, Briefcase } from 'lucide-react';
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface EntityProfileProps {
  entityId: string;
  onClose: () => void;
}

export const EntityProfile: React.FC<EntityProfileProps> = ({ entityId, onClose }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  // Efficient Caching using useQuery
  const { data: entity, isLoading: isLoadingEntity } = useQuery<LegalEntity | undefined>(
      [STORES.ENTITIES, entityId],
      () => DataService.entities.getById(entityId)
  );

  const { data: relationships = [], isLoading: isLoadingRels } = useQuery<EntityRelationship[]>(
      [STORES.RELATIONSHIPS, entityId],
      () => DataService.entities.getRelationships(entityId)
  );

  if (isLoadingEntity || !entity) {
      return (
          <div className="h-full flex items-center justify-center bg-white border-l">
              <div className="animate-pulse flex flex-col items-center">
                  <div className="h-16 w-16 bg-slate-200 rounded-full mb-4"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
              </div>
          </div>
      );
  }

  return (
    <div className={cn("h-full flex flex-col bg-white border-l shadow-xl", theme.border.default)}>
        {/* Header */}
        <div className={cn("p-6 border-b", theme.surfaceHighlight, theme.border.default)}>
            <div className="flex justify-between items-start mb-4">
                <h2 className={cn("text-2xl font-bold", theme.text.primary)}>{entity.name}</h2>
                <button onClick={onClose} className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)}><X className="h-5 w-5"/></button>
            </div>
            <div className="flex gap-2 mb-4">
                {entity.roles.map(r => <span key={r} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">{r}</span>)}
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs border">{entity.type}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                {entity.city && <span className="flex items-center"><MapPin className="h-3 w-3 mr-1"/> {entity.city}, {entity.state}</span>}
                {entity.email && <span className="flex items-center"><Mail className="h-3 w-3 mr-1"/> {entity.email}</span>}
            </div>
        </div>

        {/* Tabs */}
        <div className="px-4 border-b">
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
                    <div className={cn("p-4 rounded-lg border", theme.surface, theme.border.default)}>
                        <h4 className={cn("font-bold text-sm mb-3 uppercase tracking-wide", theme.text.secondary)}>Contact Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="block text-xs text-slate-400 uppercase">Phone</span> {entity.phone || '-'}</div>
                            <div><span className="block text-xs text-slate-400 uppercase">Website</span> {entity.website || '-'}</div>
                            <div className="col-span-2"><span className="block text-xs text-slate-400 uppercase">Address</span> {entity.address || '-'}</div>
                        </div>
                    </div>

                    <div className={cn("p-4 rounded-lg border", entity.riskScore > 50 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100")}>
                        <h4 className={cn("font-bold text-sm mb-2 flex items-center", entity.riskScore > 50 ? "text-red-800" : "text-green-800")}>
                            <ShieldAlert className="h-4 w-4 mr-2"/> Risk Profile
                        </h4>
                        <p className={cn("text-xs mb-2", entity.riskScore > 50 ? "text-red-700" : "text-green-700")}>Risk Score: <strong>{entity.riskScore}/100</strong></p>
                        <div className={cn("w-full rounded-full h-1.5", entity.riskScore > 50 ? "bg-red-200" : "bg-green-200")}>
                            <div className={cn("h-1.5 rounded-full", entity.riskScore > 50 ? "bg-red-600" : "bg-green-600")} style={{width: `${entity.riskScore}%`}}></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'relationships' && (
                <div className="space-y-3 animate-in fade-in">
                    {relationships.map(rel => (
                        <div key={rel.id} className={cn("p-3 rounded border flex items-center justify-between", theme.surface, theme.border.default)}>
                            <div className="flex items-center gap-3">
                                <Link className="h-4 w-4 text-slate-400"/>
                                <div>
                                    <p className={cn("text-sm font-bold", theme.text.primary)}>{rel.type.replace('_', ' ')}</p>
                                    <p className={cn("text-xs", theme.text.secondary)}>{rel.description} ({rel.active ? 'Current' : 'Past'})</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost">View</Button>
                        </div>
                    ))}
                    {relationships.length === 0 && <div className="text-center text-slate-400 py-8 text-sm">No mapped relationships.</div>}
                    <Button variant="outline" className="w-full border-dashed" icon={Link}>Add Connection</Button>
                </div>
            )}

            {activeTab === 'matters' && (
                <div className="space-y-3 animate-in fade-in">
                     <div className="p-3 rounded border flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-blue-500"/>
                        <div>
                            <p className="text-sm font-bold">Martinez v. TechCorp</p>
                            <p className="text-xs text-slate-500">Role: Defendant</p>
                        </div>
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};
