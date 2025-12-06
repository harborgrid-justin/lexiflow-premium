
import React, { useState } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Plus, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { StipulationRequest } from '../../types';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { Modal } from '../common/Modal';
import { Input, TextArea } from '../common/Inputs';
import { useNotify } from '../../hooks/useNotify';

export const DiscoveryStipulations: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStip, setNewStip] = useState<Partial<StipulationRequest>>({ status: 'Pending' });

  const { data: stipulations = [] } = useQuery<StipulationRequest[]>(
      [STORES.STIPULATIONS, 'all'],
      () => DataService.discovery.getStipulations()
  );

  const { mutate: addStip } = useMutation(
      DataService.discovery.addStipulation,
      {
          invalidateKeys: [[STORES.STIPULATIONS, 'all']],
          onSuccess: () => {
              setIsModalOpen(false);
              setNewStip({ status: 'Pending' });
              notify.success("Stipulation requested.");
          }
      }
  );

  const handleSave = () => {
      if (!newStip.title || !newStip.requestingParty) return;
      addStip({
          id: `stip-${Date.now()}`,
          title: newStip.title,
          requestingParty: newStip.requestingParty,
          proposedDate: newStip.proposedDate || new Date().toISOString().split('T')[0],
          status: 'Pending',
          reason: newStip.reason || ''
      } as StipulationRequest);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
                    <FileText className="h-5 w-5 mr-2 text-blue-600"/> Discovery Stipulations (Rule 29)
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>Modify discovery procedures by agreement.</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Propose Stipulation</Button>
        </div>

        <TableContainer>
            <TableHeader>
                <TableHead>Subject</TableHead>
                <TableHead>Requesting Party</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
            </TableHeader>
            <TableBody>
                {stipulations.map(s => (
                    <TableRow key={s.id}>
                        <TableCell className={cn("font-medium", theme.text.primary)}>{s.title}</TableCell>
                        <TableCell>{s.requestingParty}</TableCell>
                        <TableCell>{s.proposedDate}</TableCell>
                        <TableCell>
                            <Badge variant={s.status === 'Agreed' ? 'success' : s.status === 'Rejected' ? 'error' : 'warning'}>{s.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {s.status === 'Pending' && (
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" className="text-green-600" icon={CheckCircle}>Agree</Button>
                                    <Button size="sm" variant="ghost" className="text-red-600" icon={XCircle}>Reject</Button>
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
                {stipulations.length === 0 && (
                    <TableRow><TableCell colSpan={5} className={cn("text-center py-8 italic", theme.text.tertiary)}>No active stipulations.</TableCell></TableRow>
                )}
            </TableBody>
        </TableContainer>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Propose Rule 29 Stipulation">
            <div className="p-6 space-y-4">
                <Input label="Subject" value={newStip.title || ''} onChange={e => setNewStip({...newStip, title: e.target.value})} placeholder="e.g. Extend Deposition Limit"/>
                <Input label="Requesting Party" value={newStip.requestingParty || ''} onChange={e => setNewStip({...newStip, requestingParty: e.target.value})} placeholder="Plaintiff / Defense"/>
                <Input type="date" label="Proposed Date" value={newStip.proposedDate || ''} onChange={e => setNewStip({...newStip, proposedDate: e.target.value})}/>
                <TextArea label="Reasoning" value={newStip.reason || ''} onChange={e => setNewStip({...newStip, reason: e.target.value})} rows={3} />
                <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={handleSave}>Submit Proposal</Button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
