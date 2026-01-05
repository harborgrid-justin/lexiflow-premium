
import React, { useState, useTransition } from 'react';
import { JointPlan, PlanSection } from '../../../types.ts';
import { MOCK_JOINT_PLANS } from '../../../data/mockCollaboration.ts';
import { Card } from '../../common/Card.tsx';
import { Button } from '../../common/Button.tsx';
import { Badge } from '../../common/Badge.tsx';
import { FileText, CheckCircle, AlertCircle, Edit2, Save, Download } from 'lucide-react';

interface DiscoveryPlanBuilderProps {
  caseId: string;
}

export const DiscoveryPlanBuilder: React.FC<DiscoveryPlanBuilderProps> = ({ caseId }) => {
  const [plans, setPlans] = useState<JointPlan[]>(MOCK_JOINT_PLANS.filter(p => p.caseId === caseId));
  const [activePlan, setActivePlan] = useState<JointPlan | null>(plans[0] || null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Guideline 3: Transition for state updates
  const [isPending, startTransition] = useTransition();

  const handleEditSection = (section: PlanSection) => {
    setEditingSectionId(section.id);
    setEditContent(section.content);
  };

  const handleSaveSection = () => {
    if (!activePlan || !editingSectionId) return;
    
    startTransition(() => {
        const updatedSections = activePlan.sections.map(s => 
        s.id === editingSectionId ? { ...s, content: editContent } : s
        );
        
        const updatedPlan = { ...activePlan, sections: updatedSections };
        setActivePlan(updatedPlan);
        setPlans(plans.map(p => p.id === activePlan.id ? updatedPlan : p));
        setEditingSectionId(null);
    });
  };

  const toggleSectionStatus = (sectionId: string, status: PlanSection['status']) => {
    if (!activePlan) return;
    startTransition(() => {
        const updatedSections = activePlan.sections.map(s => 
        s.id === sectionId ? { ...s, status } : s
        );
        const updatedPlan = { ...activePlan, sections: updatedSections };
        setActivePlan(updatedPlan);
    });
  };

  if (!activePlan) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
        <FileText className="h-12 w-12 mb-3 opacity-20"/>
        <p>No joint discovery plans active.</p>
        <Button variant="outline" className="mt-4">Start Rule 26(f) Report</Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900">{activePlan.title}</h3>
          <p className="text-xs text-slate-500">Last updated: {activePlan.lastUpdated}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info">{activePlan.status}</Badge>
          <Button variant="outline" size="sm" icon={Download}>Export PDF</Button>
        </div>
      </div>

      <div className="space-y-4">
        {activePlan.sections.map(section => (
          <Card key={section.id} noPadding className="border border-slate-200 overflow-visible">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-lg">
              <h4 className="font-bold text-sm text-slate-800">{section.title}</h4>
              <div className="flex items-center gap-2">
                {section.status === 'Agreed' && <span className="text-xs font-bold text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1"/> Agreed</span>}
                {section.status === 'Disputed' && <span className="text-xs font-bold text-red-600 flex items-center"><AlertCircle className="h-3 w-3 mr-1"/> Disputed</span>}
                
                <div className="h-4 w-px bg-slate-300 mx-1"></div>
                
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
                    className="w-full p-3 border border-blue-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px]"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingSectionId(null)}>Cancel</Button>
                    <Button size="sm" variant="primary" icon={Save} onClick={handleSaveSection}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{section.content}</p>
                  <button 
                    onClick={() => handleEditSection(section)}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-blue-600 p-1 hover:bg-blue-50 rounded"
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
