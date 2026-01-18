/**
 * CaseParties.tsx
 *
 * Party management interface with grouping capabilities, contact information,
 * and hierarchical organization structure (parent entities, groups).
 *
 * @module components/case-detail/CaseParties
 * @category Case Management - Parties & Contacts
 */

// External Dependencies
import { Briefcase, Building, Edit2, Gavel, Layers, Link, Mail, MapPin, Phone, Plus, Trash2, User, Users } from 'lucide-react';
import React from 'react';

// Internal Dependencies - Components
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog/ConfirmDialog';
import { Modal } from '@/components/molecules/Modal';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { EmptyState } from '@/routes/_shared/EmptyState';

// Internal Dependencies - Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Internal Dependencies - Services & Utils
import { cn } from '@/lib/cn';
import { type GroupByOption, useCaseParties } from '@/routes/cases/hooks/useCaseParties';

// Types & Interfaces
import { type Party } from '@/types';
import { type OrgId } from '@/types/primitives';

interface CasePartiesProps {
    parties?: Party[];
    onUpdate: (parties: Party[]) => void;
}

export const CaseParties: React.FC<CasePartiesProps> = ({ parties = [], onUpdate }) => {
    const { theme } = useTheme();

    const {
        partyModal,
        deleteModal,
        currentParty,
        setCurrentParty,
        groupBy,
        setGroupBy,
        grouped,
        orgs,
        handleSave,
        handleDelete,
        confirmDelete,
        openEdit,
        openNew
    } = useCaseParties(parties, onUpdate);

    const getIcon = (type: string) => {
        if (type === 'Corporation') return <Building className={cn("h-4 w-4", theme.text.secondary)} />;
        if (type === 'Government') return <Gavel className={cn("h-4 w-4", theme.text.secondary)} />;
        return <User className={cn("h-4 w-4", theme.text.secondary)} />;
    };

    return (
        <div className="space-y-6">
            <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border shadow-sm gap-4", theme.surface.default, theme.border.default)}>
                <div>
                    <h3 className={cn("text-lg font-bold", theme.text.primary)}>Involved Parties</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Manage plaintiffs, defendants, and groups.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        className={cn("text-sm border rounded-md px-2 py-1.5 outline-none flex-1 sm:flex-none", theme.surface.highlight, theme.border.default, theme.text.primary)}
                        value={groupBy}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGroupBy(e.target.value as GroupByOption)}
                        aria-label="Group parties by"
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
                            <Layers className={cn("h-4 w-4", theme.text.tertiary)} />
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
                                const linkedOrg = orgs.find(o => o.id === party.linkedOrgId);
                                return (
                                    <TableRow key={party.id}>
                                        <TableCell className={cn("font-medium min-w-[200px]", theme.text.primary)}>
                                            <div className="flex items-start gap-3">
                                                <div className={cn("p-2 rounded-full mt-0.5", theme.surface.highlight)}>{getIcon(party.type)}</div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold">{party.name}</div>
                                                    {linkedOrg && (
                                                        <div className={cn("text-[10px] flex items-center mt-0.5", theme.text.link)}>
                                                            <Link className="h-3 w-3 mr-1" /> Linked: {linkedOrg.name}
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
                                                {party.address && <div className="flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /> <span className="truncate">{party.address}</span></div>}
                                                {party.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" /> {party.phone}</div>}
                                                {party.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{party.email}</span></div>}
                                                {!party.address && !party.phone && !party.email && party.contact && <div>{party.contact}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell className={cn("text-xs min-w-[150px]", theme.text.secondary)}>
                                            {party.attorneys && party.attorneys.length > 0 ? (
                                                <div className="space-y-2">
                                                    {party.attorneys.map((att, idx) => (
                                                        <div key={idx} className={cn("p-2 rounded border text-xs", theme.surface.highlight, theme.border.default)}>
                                                            <div className="font-bold flex items-center gap-1 truncate" title={att.name}>
                                                                <Briefcase className={cn("h-3 w-3 shrink-0", theme.text.tertiary)} /> {att.name}
                                                            </div>
                                                            {att.firm && <div className={cn("text-[10px] ml-4 truncate", theme.text.secondary)}>{att.firm}</div>}
                                                            {att.email && <div className={cn("text-[10px] ml-4 hover:underline cursor-pointer truncate", theme.text.link)} onClick={() => window.location.href = `mailto:${att.email}`}>{att.email}</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="max-w-xs whitespace-normal">{party.counsel || '-'}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => openEdit(party)} className={cn("p-1 rounded transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`, `hover:${theme.primary.text}`)} title="Edit party" aria-label="Edit party"><Edit2 className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => handleDelete(party.id)} className={cn("p-1 rounded transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`, `hover:${theme.status.error.text}`)} title="Delete party" aria-label="Delete party"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </TableContainer>
                </div>
            ))}

            {parties.length === 0 && (
                <EmptyState 
                    icon={Users}
                    title="No parties recorded"
                    message="Add plaintiffs, defendants, or other involved parties to get started"
                    size="sm"
                />
            )}

            <Modal isOpen={partyModal.isOpen} onClose={partyModal.close} title={currentParty.id ? 'Edit Party' : 'Add New Party'}>
                <div className="p-6 space-y-4">
                    <Input label="Name" value={currentParty.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentParty({ ...currentParty, name: e.target.value })} placeholder="e.g. John Doe or Acme Corp" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="partyRole" className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Role</label>
                            <select id="partyRole" aria-label="Party Role" className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)} value={currentParty.role || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentParty({ ...currentParty, role: e.target.value })}>
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
                            <label htmlFor="partyType" className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                            <select
                                id="partyType"
                                aria-label="Party Type"
                                className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                                value={currentParty.type || 'Individual'}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentParty({ ...currentParty, type: e.target.value as 'Individual' | 'Corporation' | 'Government' })}
                            >
                                <option value="Individual">Individual</option>
                                <option value="Corporation">Corporation</option>
                                <option value="Government">Government</option>
                            </select>
                        </div>
                    </div>

                    <Input label="Party Group" value={currentParty.partyGroup || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentParty({ ...currentParty, partyGroup: e.target.value })} placeholder="e.g. Class Reps, Subsidiaries" />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Email" value={currentParty.email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentParty({ ...currentParty, email: e.target.value })} />
                        <Input label="Phone" value={currentParty.phone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentParty({ ...currentParty, phone: e.target.value })} />
                    </div>
                    <Input label="Address" value={currentParty.address || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentParty({ ...currentParty, address: e.target.value })} />

                    <Input label="Representation Type" value={currentParty.representationType || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentParty({ ...currentParty, representationType: e.target.value })} placeholder="e.g. Pro Se, Retained" />

                    {!(currentParty.attorneys && Array.isArray(currentParty.attorneys) && currentParty.attorneys.length > 0) && (
                        <Input label="Legal Counsel (Simple String)" value={currentParty.counsel || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentParty({ ...currentParty, counsel: e.target.value })} placeholder="Firm or Attorney Name" />
                    )}

                    {currentParty.type === 'Corporation' && (
                        <div>
                            <label htmlFor="linkedOrgId" className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Link to Organization (Internal DB)</label>
                            <select
                                id="linkedOrgId"
                                aria-label="Link to Organization"
                                className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                                value={currentParty.linkedOrgId || ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentParty({ ...currentParty, linkedOrgId: (e.target.value || undefined) as OrgId | undefined })}
                            >
                                <option value="">No Link</option>
                                {orgs.map(org => (
                                    <option key={org.id} value={org.id}>{org.name} ({org.type})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className={cn("pt-4 flex justify-end gap-2 border-t mt-4", theme.border.default)}>
                        <Button variant="secondary" onClick={partyModal.close}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>Save Party</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={confirmDelete}
                title="Remove Party"
                message="Are you sure you want to remove this party from the case? This action cannot be undone."
                confirmText="Remove Party"
                variant="danger"
            />
        </div>
    );
};
