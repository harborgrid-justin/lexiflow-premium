
import React, { useState, useTransition } from 'react';
import { Party } from '../../types.ts';
import { MOCK_ORGS } from '../../data/mockHierarchy.ts';
import { Button } from '../common/Button.tsx';
import { Plus, User, Building, Gavel, Mail, Phone, Link, Layers, MoreHorizontal, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { Input } from '../common/Inputs.tsx';
import { Badge } from '../common/Badge.tsx';

interface CasePartiesProps {
  parties?: Party[];
  onUpdate: (parties: Party[]) => void;
}

export const CaseParties: React.FC<CasePartiesProps> = ({ parties = [], onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParty, setCurrentParty] = useState<Partial<Party>>({});
  const [groupBy, setGroupBy] = useState<'none' | 'role' | 'group'>('group');
  
  const [isPending, startTransition] = useTransition();

  const handleGroupByChange = (mode: 'none' | 'role' | 'group') => {
      startTransition(() => {
          setGroupBy(mode);
      });
  };
  
  const handleSave = () => {
    if (!currentParty.name || !currentParty.role) return;
    
    let newParties = [...parties];
    if (currentParty.id) {
        newParties = newParties.map(p => p.id === currentParty.id ? { ...p, ...currentParty } as Party : p);
    } else {
        const newParty: Party = {
            id: `p-${Date.now()}`,
            name: currentParty.name!,
            role: currentParty.role!,
            partyGroup: currentParty.partyGroup,
            contact: currentParty.contact || '',
            type: currentParty.type || 'Individual',
            counsel: currentParty.counsel,
            linkedOrgId: currentParty.linkedOrgId
        };
        newParties.push(newParty);
    }
    onUpdate(newParties);
    setIsModalOpen(false);
    setCurrentParty({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove party?')) {
        onUpdate(parties.filter(p => p.id !== id));
    }
  };

  const openEdit = (party: Party) => {
      setCurrentParty(party);
      setIsModalOpen(true);
  };

  const openNew = () => {
      setCurrentParty({ type: 'Individual' });
      setIsModalOpen(true);
  };

  const getGroupedParties = () => {
      if (groupBy === 'none') return { 'All Parties': parties };
      
      const groups: Record<string, Party[]> = {};
      parties.forEach(p => {
          const key = groupBy === 'role' ? p.role : (p.partyGroup || 'Ungrouped');
          if (!groups[key]) groups[key] = [];
          groups[key].push(p);
      });
      return groups;
  };

  const grouped = getGroupedParties();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
            <h3 className="text-lg font-bold text-slate-900">Involved Parties</h3>
            <p className="text-sm text-slate-500">Manage plaintiffs, defendants, and third parties.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="bg-slate-100 rounded-lg p-1 flex w-full sm:w-auto">
                {['group', 'role', 'none'].map((mode) => (
                    <button 
                        key={mode}
                        onClick={() => handleGroupByChange(mode as any)} 
                        className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${groupBy === mode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
            <Button variant="primary" icon={Plus} onClick={openNew} size="sm" className="w-full sm:w-auto justify-center">Add Party</Button>
        </div>
      </div>

      <div className={`space-y-6 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      {Object.entries(grouped).map(([groupName, groupParties]) => (
        <div key={groupName} className="space-y-3">
            {groupBy !== 'none' && (
                <div className="flex items-center gap-2 px-1 pb-1 border-b border-slate-200">
                    <Layers className="h-4 w-4 text-slate-400"/>
                    <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">{groupName}</h4>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{groupParties.length}</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupParties.map(party => {
                    const linkedOrg = MOCK_ORGS.find(o => o.id === party.linkedOrgId);
                    return (
                        <div key={party.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col h-full relative">
                             <div className="flex items-start gap-3 mb-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold border shadow-sm ${
                                     party.type === 'Corporation' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 
                                     party.type === 'Government' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-blue-50 border-blue-100 text-blue-700'
                                 }`}>
                                     {party.type === 'Corporation' ? <Building size={18}/> : party.type === 'Government' ? <Gavel size={18}/> : party.name.substring(0,2).toUpperCase()}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                     <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{party.name}</h4>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="neutral" className="text-[9px] py-0 px-1.5">{party.role}</Badge>
                                        {linkedOrg && (
                                            <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 rounded border border-blue-100 flex items-center gap-1 font-medium">
                                                <Link size={8}/> Org
                                            </span>
                                        )}
                                     </div>
                                 </div>
                                 <button className="text-slate-300 hover:text-slate-600 p-1 -mr-2 -mt-2" onClick={(e) => { e.stopPropagation(); openEdit(party); }}>
                                     <MoreHorizontal size={16}/>
                                 </button>
                             </div>
                             
                             <div className="mt-auto pt-3 border-t border-slate-50 flex flex-col gap-2 text-xs text-slate-500">
                                 {party.contact && (
                                    <div className="flex items-center gap-2 truncate" title={party.contact}>
                                        <Mail size={12} className="text-slate-400 shrink-0"/> 
                                        <span className="truncate">{party.contact}</span>
                                    </div>
                                 )}
                                 {party.counsel && (
                                    <div className="flex items-center gap-2 truncate" title={party.counsel}>
                                        <User size={12} className="text-slate-400 shrink-0"/> 
                                        <span className="truncate">Counsel: {party.counsel}</span>
                                    </div>
                                 )}
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
      ))}
      </div>

      {parties.length === 0 && (
         <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
             <User size={32} className="mx-auto mb-3 opacity-20"/>
             <p className="text-slate-500 font-medium">No parties recorded.</p>
             <Button variant="ghost" size="sm" onClick={openNew} className="mt-2 text-blue-600">Add First Party</Button>
         </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentParty.id ? 'Edit Party' : 'Add New Party'}>
          <div className="p-6 space-y-4">
              <Input label="Name" value={currentParty.name || ''} onChange={e => setCurrentParty({...currentParty, name: e.target.value})} placeholder="e.g. John Doe"/>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Role</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={currentParty.role || ''} onChange={e => setCurrentParty({...currentParty, role: e.target.value})}>
                          <option value="">Select Role...</option>
                          <option value="Plaintiff">Plaintiff</option>
                          <option value="Defendant">Defendant</option>
                          <option value="Witness">Witness</option>
                          <option value="Expert">Expert</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={currentParty.type || 'Individual'} onChange={e => setCurrentParty({...currentParty, type: e.target.value as any})}>
                          <option value="Individual">Individual</option>
                          <option value="Corporation">Corporation</option>
                          <option value="Government">Government</option>
                      </select>
                  </div>
              </div>
              
              <Input label="Party Group" value={currentParty.partyGroup || ''} onChange={e => setCurrentParty({...currentParty, partyGroup: e.target.value})} placeholder="e.g. Class Reps"/>
              <Input label="Contact Info" value={currentParty.contact || ''} onChange={e => setCurrentParty({...currentParty, contact: e.target.value})} />
              <Input label="Counsel" value={currentParty.counsel || ''} onChange={e => setCurrentParty({...currentParty, counsel: e.target.value})} />
              
              {currentParty.type === 'Corporation' && (
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Link Organization</label>
                      <select 
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" 
                        value={currentParty.linkedOrgId || ''} 
                        onChange={e => setCurrentParty({...currentParty, linkedOrgId: e.target.value})}
                      >
                          <option value="">No Link</option>
                          {MOCK_ORGS.map(org => (
                              <option key={org.id} value={org.id}>{org.name} ({org.type})</option>
                          ))}
                      </select>
                  </div>
              )}

              <div className="pt-6 flex justify-between border-t border-slate-100 mt-2">
                  {currentParty.id && <Button variant="danger" onClick={() => { handleDelete(currentParty.id!); setIsModalOpen(false); }}>Delete</Button>}
                  <div className="flex gap-2 ml-auto">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save</Button>
                  </div>
              </div>
          </div>
      </Modal>
    </div>
  );
};
