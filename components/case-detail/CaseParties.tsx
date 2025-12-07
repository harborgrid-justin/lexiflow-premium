
import React, { useState, useEffect } from 'react';
import { Party } from '../../types';
import { MOCK_ORGS } from '../../data/mockHierarchy';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Plus, Edit2, Trash2, User, Building, Gavel, Link, Layers, MapPin, Phone, Mail, Briefcase } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Inputs';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Scheduler } from '../../utils/scheduler';

interface CasePartiesProps {
  parties?: Party[];
  onUpdate: (parties: Party[]) => void;
}

type GroupByOption = 'none' | 'role' | 'group';

export const CaseParties: React.FC<CasePartiesProps> = ({ parties = [], onUpdate }) => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParty, setCurrentParty] = useState<Partial<Party>>({});
  const [groupBy, setGroupBy] = useState<GroupByOption>('group');
  const [grouped, setGrouped] = useState<Record<string, Party[]>>({});

  useEffect(() => {
    Scheduler.defer(() => {
        if (groupBy === 'none') {
            setGrouped({ 'All Parties': parties });
            return;
        }
        const groups: Record<string, Party[]> = {};
        parties.forEach(p => {
            const key = groupBy === 'role' ? p.role : (p.partyGroup || 'Ungrouped');
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });
        setGrouped(groups);
    });
  }, [parties, groupBy]);
  
  const handleSave = () => {
    if (!currentParty.name || !currentParty.role) return;
    
    let newParties = [...parties];
    if (currentParty.id) {
        // Edit
        newParties = newParties.map(p => p.id === currentParty.id ? { ...p, ...currentParty } as Party : p);
    } else {
        // Add
        const newParty: Party = {
            id: `p-${Date.now()}`,
            name: currentParty.name,
            role: currentParty.role,
            partyGroup: currentParty.partyGroup,
            contact: currentParty.contact || '',
            type: currentParty.type || 'Individual',
            counsel: currentParty.counsel,
            linkedOrgId: currentParty.linkedOrgId,
            address: currentParty.address,
            phone: currentParty.phone,
            email: currentParty.email,
            representationType: currentParty.representationType,
            attorneys: currentParty.attorneys
        };
        newParties.push(newParty);
    }
    onUpdate(newParties);
    setIsModalOpen(false);
    setCurrentParty({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this party from the case?')) {
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

  const getIcon = (type: string) => {
      if (type === 'Corporation') return <Building className={cn("h-4 w-4", theme.text.secondary)}/>;
      if (type === 'Government') return <Gavel className={cn("h-4 w-4", theme.text.secondary)}/>;
      return <User className={cn("h-4 w-4", theme.text.secondary)}/>;
  };

  return (
    <div className="space-y-6">
      <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border shadow-sm gap-4", theme.surface, theme.border.default)}>
        <div>
            <h3 className={cn("text-lg font-bold", theme.text.primary)}>Involved Parties</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Manage plaintiffs, defendants, and groups.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <select 
                className={cn("text-sm border rounded-md px-2 py-1.5 outline-none flex-1 sm:flex-none", theme.surfaceHighlight, theme.border.default, theme.text.primary)}
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
            >
                <option value="none">No Grouping</option>
                <option value="group">Group by Party Type</option>
                <option value="role">Group by Role</option>
            </select>
            <Button variant="primary" icon={Plus} onClick={openNew}>Add Party</Button>
        </div>
      </div>

      {Object.entries(grouped).map(([groupName, groupParties]: [string, Party[]]) => (
        <div key={groupName} className="space-y-2">
            {groupBy !== 'none' && (
                <div className="flex items-center gap-2 px-1">
                    <Layers className={cn("h-4 w-4", theme.text.tertiary)}/>
                    <h4 className={cn("font-bold text-sm uppercase", theme.text.secondary)}>{groupName}</h4>
                    <span className={cn("text-xs", theme.text.tertiary)}>({groupParties.length})</span>
                </div>
            )}
            
            <TableContainer responsive="card">
                <TableHeader>
                    <TableHead>Entity Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact Details</TableHead>
                    <TableHead>Legal Team</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                    {groupParties.map(party => {
                        const linkedOrg = MOCK_ORGS.find(o => o.id === party.linkedOrgId);
                        return (
                        <TableRow key={party.id}>
                            <TableCell className={cn("font-medium min-w-[200px]", theme.text.primary)}>
                                <div className="flex items-start gap-3">
                                    <div className={cn("p-2 rounded-full mt-0.5", theme.surfaceHighlight)}>{getIcon(party.type)}</div>
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold">{party.name}</div>
                                        {linkedOrg && (
                                            <div className="text-[10px] text-blue-600 flex items-center mt-0.5">
                                                <Link className="h-3 w-3 mr-1"/> Linked: {linkedOrg.name}
                                            </div>
                                        )}
                                        {party.representationType && (
                                            <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                                                [{party.representationType}]
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={party.role.includes('Plaintiff') || party.role.includes('Appellant') ? 'info' : party.role.includes('Defendant') || party.role.includes('Appellee') ? 'warning' : 'neutral'}>
                                    {party.role}
                                </Badge>
                                <div className="text-[10px] text-slate-500 mt-1 ml-1">{party.partyGroup}</div>
                            </TableCell>
                            <TableCell className={cn("text-xs min-w-[180px]", theme.text.secondary)}>
                                <div className="space-y-1">
                                    {party.address && <div className="flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0"/> <span className="truncate">{party.address}</span></div>}
                                    {party.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0"/> {party.phone}</div>}
                                    {party.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0"/> <span className="truncate">{party.email}</span></div>}
                                    {!party.address && !party.phone && !party.email && party.contact && <div>{party.contact}</div>}
                                </div>
                            </TableCell>
                            <TableCell className={cn("text-xs min-w-[150px]", theme.text.secondary)}>
                                {party.attorneys && party.attorneys.length > 0 ? (
                                    <div className="space-y-2">
                                        {party.attorneys.map((att, idx) => (
                                            <div key={idx} className={cn("p-2 rounded border text-xs", theme.surfaceHighlight, theme.border.light)}>
                                                <div className="font-bold flex items-center gap-1 truncate" title={att.name}>
                                                    <Briefcase className={cn("h-3 w-3 shrink-0", theme.text.tertiary)}/> {att.name}
                                                </div>
                                                {att.firm && <div className={cn("text-[10px] ml-4 truncate", theme.text.secondary)}>{att.firm}</div>}
                                                {att.email && <div className="text-[10px] text-blue-600 ml-4 hover:underline cursor-pointer truncate" onClick={()=>window.location.href=`mailto:${att.email}`}>{att.email}</div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="max-w-xs whitespace-normal">{party.counsel || '-'}</div>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => openEdit(party)} className={cn("p-1 rounded transition-colors", theme.text.primary, `hover:${theme.surfaceHighlight}`, `hover:${theme.primary.text}`)}><Edit2 className="h-4 w-4"/></button>
                                    <button onClick={() => handleDelete(party.id)} className={cn("p-1 rounded transition-colors", theme.text.primary, `hover:${theme.surfaceHighlight}`, `hover:${theme.status.error.text}`)}><Trash2 className="h-4 w-4"/></button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </TableContainer>
        </div>
      ))}

      {parties.length === 0 && (
         <div className={cn("text-center py-8 italic rounded-lg", theme.surfaceHighlight, theme.text.tertiary)}>No parties recorded.</div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentParty.id ? 'Edit Party' : 'Add New Party'}>
          <div className="p-6 space-y-4">
              <Input label="Name" value={currentParty.name || ''} onChange={e => setCurrentParty({...currentParty, name: e.target.value})} placeholder="e.g. John Doe or Acme Corp"/>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Role</label>
                      <select className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)} value={currentParty.role || ''} onChange={e => setCurrentParty({...currentParty, role: e.target.value})}>
                          <option value="">Select Role...</option>
                          <option value="Plaintiff">Plaintiff</option>
                          <option value="Defendant">Defendant</option>
                          <option value="Debtor - Appellant">Debtor - Appellant</option>
                          <option value="Creditor - Appellee">Creditor - Appellee</option>
                          <option value="Witness">Witness</option>
                          <option value="Expert">Expert</option>
                      </select>
                  </div>
                  <div>
                      <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                      <select 
                        className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)}
                        value={currentParty.type || 'Individual'}
                        onChange={e => setCurrentParty({...currentParty, type: e.target.value as 'Individual' | 'Corporation' | 'Government'})}
                      >
                          <option value="Individual">Individual</option>
                          <option value="Corporation">Corporation</option>
                          <option value="Government">Government</option>
                      </select>
                  </div>
              </div>
              
              <Input label="Party Group" value={currentParty.partyGroup || ''} onChange={e => setCurrentParty({...currentParty, partyGroup: e.target.value})} placeholder="e.g. Class Reps, Subsidiaries"/>

              <div className="grid grid-cols-2 gap-4">
                  <Input label="Email" value={currentParty.email || ''} onChange={e => setCurrentParty({...currentParty, email: e.target.value})} />
                  <Input label="Phone" value={currentParty.phone || ''} onChange={e => setCurrentParty({...currentParty, phone: e.target.value})} />
              </div>
              <Input label="Address" value={currentParty.address || ''} onChange={e => setCurrentParty({...currentParty, address: e.target.value})} />

              <Input label="Representation Type" value={currentParty.representationType || ''} onChange={e => setCurrentParty({...currentParty, representationType: e.target.value})} placeholder="e.g. Pro Se, Retained" />
              
              {!(currentParty.attorneys && Array.isArray(currentParty.attorneys) && currentParty.attorneys.length > 0) && (
                  <Input label="Legal Counsel (Simple String)" value={currentParty.counsel || ''} onChange={e => setCurrentParty({...currentParty, counsel: e.target.value})} placeholder="Firm or Attorney Name"/>
              )}
              
              {currentParty.type === 'Corporation' && (
                  <div>
                      <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Link to Organization (Internal DB)</label>
                      <select 
                        className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)} 
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

              <div className={cn("pt-4 flex justify-end gap-2 border-t mt-4", theme.border.light)}>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave}>Save Party</Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};
