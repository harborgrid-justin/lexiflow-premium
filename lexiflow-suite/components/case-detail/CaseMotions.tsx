
import React, { useState, useEffect } from 'react';
import { Motion, MotionStatus, MotionType, LegalDocument } from '../../types.ts';
import { MOCK_MOTIONS } from '../../data/mockMotions.ts';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { Plus, Gavel, Calendar, Wand2, ArrowRight, RefreshCw, GitBranch, Clock, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { Input } from '../common/Inputs.tsx';
import { TaskCreationModal } from '../common/TaskCreationModal.tsx';

interface CaseMotionsProps {
  caseId: string;
  caseTitle: string;
  documents?: LegalDocument[];
}

export const CaseMotions: React.FC<CaseMotionsProps> = ({ caseId, caseTitle }) => {
  const [motions, setMotions] = useState<Motion[]>(MOCK_MOTIONS.filter(m => m.caseId === caseId));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMotion, setNewMotion] = useState<Partial<Motion>>({ type: 'Dismiss', status: 'Draft', documents: [], linkedRules: [], conferralStatus: 'Required' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskModalMotion, setTaskModalMotion] = useState<Motion | null>(null);

  useEffect(() => {
    if (newMotion.hearingDate) {
      const hearing = new Date(newMotion.hearingDate);
      if (!isNaN(hearing.getTime())) {
        const opp = new Date(hearing);
        opp.setDate(hearing.getDate() - 14); 
        const reply = new Date(hearing);
        reply.setDate(hearing.getDate() - 7); 
        
        setNewMotion(prev => ({
          ...prev,
          oppositionDueDate: opp.toISOString().split('T')[0],
          replyDueDate: reply.toISOString().split('T')[0]
        }));
      }
    }
  }, [newMotion.hearingDate]);

  const handleSave = () => {
    if (!newMotion.title) return;
    const motion: Motion = {
      id: `mot-${Date.now()}`,
      caseId,
      title: newMotion.title,
      type: newMotion.type as MotionType,
      status: newMotion.status as MotionStatus,
      assignedAttorney: 'Current User',
      filingDate: new Date().toISOString().split('T')[0],
      hearingDate: newMotion.hearingDate,
      oppositionDueDate: newMotion.oppositionDueDate,
      replyDueDate: newMotion.replyDueDate,
      documents: newMotion.documents,
      linkedRules: newMotion.linkedRules,
      conferralStatus: newMotion.conferralStatus || 'Required'
    };
    setMotions([...motions, motion]);
    setIsModalOpen(false);
    setNewMotion({ type: 'Dismiss', status: 'Draft', documents: [], linkedRules: [], conferralStatus: 'Required' });
  };

  const handleGenerateStrategy = async () => {
    if (!newMotion.title) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`AI Strategy Generated: Arguments for ${newMotion.title} drafted.`);
    setIsGenerating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'neutral';
      case 'Filed': return 'info';
      case 'Hearing Set': return 'warning';
      case 'Decided': return 'success';
      default: return 'neutral';
    }
  };

  const getConferralBadge = (status?: string) => {
      switch(status) {
          case 'Agreed': return <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">Agreed</span>;
          case 'Impasse': return <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold border border-red-200">Impasse</span>;
          case 'Scheduled': return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">Scheduled</span>;
          default: return <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-200">Required</span>;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {taskModalMotion && (
        <TaskCreationModal 
            isOpen={true} 
            onClose={() => setTaskModalMotion(null)} 
            initialTitle={`Prepare: ${taskModalMotion.title}`}
            relatedModule="Motions"
            relatedItemId={taskModalMotion.id}
            relatedItemTitle={taskModalMotion.title}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Gavel className="h-5 w-5 text-blue-600"/> Motion Practice</h3>
          <p className="text-sm text-slate-500">Track filings, opposition deadlines, and hearings.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" size="sm" icon={RefreshCw} className="flex-1 md:flex-none">Sync Calendar</Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none">New Motion</Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <TableContainer>
          <TableHeader>
            <TableHead>Motion Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hearing</TableHead>
            <TableHead>Rules</TableHead>
            <TableHead>Meet & Confer</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {motions.map(motion => (
              <TableRow key={motion.id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-500"><Gavel className="h-4 w-4"/></div>
                      <div>
                          <div className="font-medium text-slate-900 text-sm">{motion.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Filed: {motion.filingDate || 'Pending'}</div>
                      </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="neutral">{motion.type}</Badge></TableCell>
                <TableCell><Badge variant={getStatusColor(motion.status) as any}>{motion.status}</Badge></TableCell>
                <TableCell>
                  {motion.hearingDate ? (
                    <div className="flex items-center text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 w-fit">
                      <Calendar className="h-3 w-3 mr-1.5 text-slate-500" /> {motion.hearingDate}
                    </div>
                  ) : <span className="text-xs text-slate-400">-</span>}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {motion.linkedRules?.slice(0,2).map(r => (
                      <span key={r} className="text-[9px] bg-white border px-1.5 py-0.5 rounded text-slate-600 shadow-sm">{r}</span>
                    ))}
                    {motion.linkedRules && motion.linkedRules.length > 2 && <span className="text-[9px] text-slate-400">+{motion.linkedRules.length-2}</span>}
                  </div>
                </TableCell>
                <TableCell>
                    {getConferralBadge(motion.conferralStatus)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="text-slate-500 hover:text-indigo-600" onClick={() => setTaskModalMotion(motion)} icon={GitBranch}>Task</Button>
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400"><MoreHorizontal size={16}/></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {motions.map(motion => (
          <div key={motion.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <Badge variant={getStatusColor(motion.status) as any} className="text-[10px] uppercase font-black">{motion.status}</Badge>
              <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={16}/></button>
            </div>
            
            <div className="flex gap-3 items-start">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 border border-slate-100 shrink-0"><Gavel size={18}/></div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{motion.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{motion.type}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide mb-1">Hearing</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400"/>
                        {motion.hearingDate || 'TBD'}
                    </span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col justify-center">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide mb-1">Conferral</span>
                    <div className="w-fit">{getConferralBadge(motion.conferralStatus)}</div>
                </div>
            </div>
            
            <button 
                onClick={() => setTaskModalMotion(motion)}
                className="w-full py-2.5 mt-1 border border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={14}/> Add Associated Task
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Draft New Motion">
        <div className="p-6 space-y-4">
          <Input 
            label="Motion Title" 
            placeholder="e.g. Motion to Dismiss Count III"
            value={newMotion.title || ''}
            onChange={(e) => setNewMotion({...newMotion, title: e.target.value})}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                <select 
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                value={newMotion.type}
                onChange={(e) => setNewMotion({...newMotion, type: e.target.value as MotionType})}
                >
                <option value="Dismiss">Motion to Dismiss</option>
                <option value="Summary Judgment">Summary Judgment</option>
                <option value="Compel Discovery">Compel Discovery</option>
                <option value="In Limine">Motion In Limine</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hearing Date</label>
                <input 
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                value={newMotion.hearingDate || ''}
                onChange={(e) => setNewMotion({...newMotion, hearingDate: e.target.value})}
                />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><Wand2 size={16}/></div>
            <div>
              <h4 className="text-sm font-bold text-indigo-900">AI Strategy Assistance</h4>
              <p className="text-xs text-indigo-700 mt-1 mb-3 leading-relaxed">Gemini can analyze case facts and local rules to suggest arguments for this motion.</p>
              <button 
                onClick={handleGenerateStrategy}
                disabled={isGenerating || !newMotion.title}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm font-bold flex items-center gap-2"
              >
                {isGenerating ? 'Analyzing...' : 'Generate Arguments'} <ChevronRight size={12}/>
              </button>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} icon={ArrowRight}>Create Draft</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
