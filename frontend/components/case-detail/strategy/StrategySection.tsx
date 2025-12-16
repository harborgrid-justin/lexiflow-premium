/**
 * StrategySection.tsx
 * 
 * Reusable strategy section component displaying arguments, defenses, or citations
 * with supporting evidence and authority links.
 * 
 * @module components/case-detail/strategy/StrategySection
 * @category Case Management - Legal Strategy
 */

// External Dependencies
import React from 'react';
import { ExternalLink, BookOpen, CheckCircle, Box, Scale, AlertTriangle, X } from 'lucide-react';

// Internal Dependencies - Components
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { RiskMeter } from '../../common/RiskMeter';
import { Button } from '../../common/Button';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../../utils/cn';

// Types & Interfaces
import { LegalArgument, Defense, Citation, EvidenceItem } from '../../../types';

interface StrategySectionProps {
  title: string;
  items: (LegalArgument | Defense | Citation)[];
  type: 'Argument' | 'Defense' | 'Citation';
  icon: React.ElementType;
  colorClass: string;
  evidence?: EvidenceItem[];
  citations?: Citation[];
  onEdit?: (item: LegalArgument | Defense | Citation) => void;
  onDelete?: (id: string) => void;
}

export const StrategySection: React.FC<StrategySectionProps> = ({ title, items, type, icon: Icon, colorClass, evidence = [], citations = [], onEdit, onDelete }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-5 w-5", colorClass)}/>
        <h4 className={cn("font-bold uppercase text-sm tracking-wide", theme.text.primary)}>{title}</h4>
        <span className={cn("text-xs px-2 py-0.5 rounded-full", theme.surface.highlight, theme.text.secondary)}>{items.length}</span>
      </div>

      {type === 'Citation' ? (
         <div className={cn("rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
            {(items as Citation[]).map((cit) => (
                <div key={cit.id} className={cn("p-3 border-b last:border-0 transition-colors group relative", theme.border.default, `hover:${theme.surface.highlight}`)}>
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center flex-1">
                            {cit.shepardsSignal === 'Positive' && <CheckCircle className="h-3 w-3 text-green-500 mr-1.5"/>}
                            {cit.shepardsSignal === 'Caution' && <AlertTriangle className={cn("h-3 w-3 mr-1.5", theme.status.warning.text)}/>}
                            {cit.shepardsSignal === 'Negative' && <X className="h-3 w-3 text-red-500 mr-1.5"/>}
                            <span className="font-bold text-sm text-blue-700 hover:underline cursor-pointer">{cit.citation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {onEdit && (
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(cit); }} className="h-6 px-2 text-[10px]">
                                Edit
                              </Button>
                            )}
                            {onDelete && (
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(cit.id); }} className="h-6 px-2 text-[10px] text-red-600 hover:text-red-700">
                                Delete
                              </Button>
                            )}
                            <Badge variant="neutral">{cit.type}</Badge>
                        </div>
                    </div>
                    <p className={cn("text-xs font-medium mb-1", theme.text.primary)}>{cit.title}</p>
                    <p className={cn("text-xs line-clamp-2", theme.text.secondary)}>{cit.description}</p>
                </div>
            ))}
            {items.length === 0 && <div className={cn("text-center p-8 text-sm", theme.text.tertiary)}>No citations linked.</div>}
         </div>
      ) : (
        <>
          {items.map((item) => {
            const typedItem = item as LegalArgument | Defense;
            return (
            <Card key={typedItem.id} noPadding className={`border-l-4 hover:shadow-md transition-shadow cursor-pointer ${type === 'Argument' ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h5 className={cn("font-bold text-sm", theme.text.primary)}>{typedItem.title}</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(typedItem); }} className="h-7 px-2 text-xs">
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(typedItem.id); }} className="h-7 px-2 text-xs text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    )}
                    <Badge variant={typedItem.status === 'Active' || (typedItem as Defense).status === 'Asserted' ? 'success' : 'neutral'}>{typedItem.status}</Badge>
                  </div>
                </div>
                <p className={cn("text-xs line-clamp-3 mb-3", theme.text.secondary)}>{typedItem.description}</p>
                
                {type === 'Argument' && (
                   <>
                       <RiskMeter value={(typedItem as LegalArgument).strength} label="Strength" type="strength" />
                       <div className={cn("mt-3 pt-3 border-t flex flex-col gap-2", theme.border.default)}>
                           {/* Citations & Evidence Links Logic */}
                           <div className="flex gap-1 flex-wrap">
                               {(typedItem as LegalArgument).relatedCitationIds.map(cid => {
                                   const cit = citations.find(c => c.id === cid);
                                   return cit ? (
                                       <span key={cid} className={cn("text-[10px] px-1.5 py-0.5 rounded flex items-center border", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                                           <BookOpen className="h-3 w-3 mr-1"/> {cit.citation}
                                       </span>
                                   ) : null;
                               })}
                               {(typedItem as LegalArgument).relatedEvidenceIds?.map(eid => {
                                   const ev = evidence.find(e => e.id === eid);
                                   return ev ? (
                                       <span key={eid} className="text-[10px] bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded text-purple-700 flex items-center">
                                           <Box className="h-3 w-3 mr-1"/> {ev.title}
                                       </span>
                                   ) : null;
                               })}
                           </div>
                       </div>
                   </>
                )}
                
                {type === 'Defense' && (
                    <div className={cn("flex justify-between items-center pt-2 border-t", theme.border.default)}>
                        <span className={cn("text-[10px] uppercase font-bold", theme.text.tertiary)}>{(typedItem as Defense).type}</span>
                        <button className={cn("transition-colors", theme.text.tertiary, `hover:${theme.text.link}`)}><ExternalLink className="h-3 w-3"/></button>
                    </div>
                )}
              </div>
            </Card>
            );
          })}
          {items.length === 0 && <div className={cn("text-center p-8 border-2 border-dashed rounded-lg text-sm", theme.border.default, theme.text.tertiary)}>No {title.toLowerCase()} added.</div>}
        </>
      )}
    </div>
  );
};
