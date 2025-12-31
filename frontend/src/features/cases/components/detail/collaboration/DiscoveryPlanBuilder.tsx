/**
 * DiscoveryPlanBuilder.tsx
 * 
 * Collaborative FRCP 26(f) discovery plan builder with section-by-section
 * editing, status tracking, and agreement export.
 * 
 * @module components/case-detail/collaboration/DiscoveryPlanBuilder
 * @category Case Management - Discovery Planning
 */

// External Dependencies
import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Edit2, Save, Download, Loader2 } from 'lucide-react';

// Internal Dependencies - Components
import { Card } from '@/components/ui/molecules/Card';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useQuery, useMutation } from '@/hooks/useQueryHooks';

// Internal Dependencies - Services & Utils
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { cn } from '@/utils/cn';

// Types & Interfaces
import { JointPlan, PlanSection } from '@/types';

interface DiscoveryPlanBuilderProps {
  caseId: string;
}

export const DiscoveryPlanBuilder: React.FC<DiscoveryPlanBuilderProps> = ({ caseId }) => {
  const { theme } = useTheme();
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Enterprise Data Access
  const { data: plans = [], isLoading } = useQuery<JointPlan[]>(
      ['joint-plans', caseId],
      () => DataService.collaboration.getPlans(caseId)
  );

  const activePlan = plans.length > 0 ? plans[0] : null;

  const { mutate: updatePlan } = useMutation(
      DataService.collaboration.updatePlan,
      { invalidateKeys: [['joint-plans', caseId]] }
  );

  const handleEditSection = (section: PlanSection) => {
    setEditingSectionId(section.id);
    setEditContent(section.content);
  };

  const handleSaveSection = async () => {
    if (!activePlan || !editingSectionId) return;
    
    const updatedSections = activePlan.sections.map(s => 
      s.id === editingSectionId ? { ...s, content: editContent } : s
    );
    
    const updatedPlan = { ...activePlan, sections: updatedSections };
    updatePlan(updatedPlan);
    setEditingSectionId(null);
  };

  const toggleSectionStatus = async (sectionId: string, status: PlanSection['status']) => {
    if (!activePlan) return;
    const updatedSections = activePlan.sections.map(s => 
      s.id === sectionId ? { ...s, status } : s
    );
    const updatedPlan = { ...activePlan, sections: updatedSections };
    updatePlan(updatedPlan);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className={cn("animate-spin", theme.text.link)}/></div>;

  if (!activePlan) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg", theme.surface.highlight, theme.border.default, theme.text.tertiary)}>
        <FileText className="h-12 w-12 mb-3 opacity-20"/>
        <p>No joint discovery plans active.</p>
        <Button variant="outline" className="mt-4" onClick={() => alert("Start New Plan")}>Start Rule 26(f) Report</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold", theme.text.primary)}>{activePlan.title}</h3>
          <p className={cn("text-xs", theme.text.secondary)}>Last updated: {activePlan.lastUpdated}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info">{activePlan.status}</Badge>
          <Button variant="outline" size="sm" icon={Download}>Export PDF</Button>
        </div>
      </div>

      <div className="space-y-4">
        {activePlan.sections.map(section => (
          <Card key={section.id} noPadding className="overflow-visible">
            <div className={cn("p-4 border-b flex justify-between items-center rounded-t-lg", theme.surface.highlight, theme.border.default)}>
              <h4 className={cn("font-bold text-sm", theme.text.primary)}>{section.title}</h4>
              <div className="flex items-center gap-2">
                {section.status === 'Agreed' && <span className="text-xs font-bold text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1"/> Agreed</span>}
                {section.status === 'Disputed' && <span className="text-xs font-bold text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1"/> Disputed</span>}
                
                <div className={cn("h-4 w-px mx-1", theme.border.default)}></div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => toggleSectionStatus(section.id, 'Agreed')}
                    className={`p-1 rounded hover:bg-green-100 ${section.status === 'Agreed' ? 'text-green-600 bg-green-50' : 'text-slate-400'}`}
                    title="Mark Agreed"
                  >
                    <CheckCircle className="h-4 w-4"/>
                  </button>
                  <button 
                    onClick={() => toggleSectionStatus(section.id, 'Disputed')}
                    className={`p-1 rounded hover:bg-red-100 ${section.status === 'Disputed' ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}
                    title="Mark Disputed"
                  >
                    <AlertCircle className="h-4 w-4"/>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              {editingSectionId === section.id ? (
                <div>
                  <textarea 
                    className={cn("w-full p-3 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px]", theme.border.default, theme.surface.default, theme.text.primary)}
                    value={editContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                    placeholder="Enter section content..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingSectionId(null)}>Cancel</Button>
                    <Button size="sm" variant="primary" icon={Save} onClick={handleSaveSection}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <p className={cn("text-sm whitespace-pre-wrap leading-relaxed", theme.text.secondary)}>{section.content}</p>
                  <button 
                    onClick={() => handleEditSection(section)}
                    title="Edit section"
                    className={cn("absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity", theme.text.primary, `hover:${theme.primary.light}`)}
                  >
                    <Edit2 className="h-4 w-4"/>
                  </button>
                </div>
              )}

              {section.opposingComments && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-xs text-red-800 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 shrink-0 mt-0.5"/>
                  <div>
                    <span className="font-bold block mb-1">Opposing Counsel Comment:</span>
                    {section.opposingComments}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

