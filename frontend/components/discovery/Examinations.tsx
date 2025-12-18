import React, { useState } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Stethoscope, Plus, Calendar, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/data/dataService';
import { Examination } from '../../types';
import { useQuery, useMutation } from '../../services/infrastructure/queryClient';
import { STORES } from '../../services/data/dataService';
import { queryKeys } from '../../utils/queryKeys';
import { Modal } from '../common/Modal';
import { Input, TextArea } from '../common/Inputs';

export const Examinations: React.FC = () => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Examination>>({});

  const { data: exams = [] } = useQuery<Examination[]>(
      [STORES.EXAMINATIONS, 'all'],
      () => DataService.discovery.getExaminations()
  );

  const { mutate: addExam } = useMutation(
      DataService.discovery.addExamination,
      {
          invalidateKeys: [[STORES.EXAMINATIONS, 'all']],
          onSuccess: () => {
              setIsModalOpen(false);
              setNewExam({});
          }
      }
  );

  const handleSave = () => {
      if (!newExam.examinee || !newExam.type) return;
      addExam({
          id: `exam-${Date.now()}`,
          caseId: 'General',
          examinee: newExam.examinee,
          type: newExam.type as 'Physical' | 'Mental',
          doctorName: newExam.doctorName || 'Pending Selection',
          date: newExam.date || '',
          status: 'Scheduled',
          goodCause: newExam.goodCause || ''
      } as Examination);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
                    <Stethoscope className="h-5 w-5 mr-2 text-rose-500"/> Physical & Mental Examinations (Rule 35)
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>Manage IME appointments and reports.</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>Order Exam</Button>
        </div>

        <TableContainer>
            <TableHeader>
                <TableHead>Examinee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Doctor / Examiner</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Report</TableHead>
            </TableHeader>
            <TableBody>
                {exams.map(e => (
                    <TableRow key={e.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <User className={cn("h-4 w-4", theme.text.tertiary)}/>
                                <span className={cn("font-medium", theme.text.primary)}>{e.examinee}</span>
                            </div>
                        </TableCell>
                        <TableCell>{e.type}</TableCell>
                        <TableCell>{e.doctorName}</TableCell>
                        <TableCell>
                            {e.date ? <div className="flex items-center text-xs"><Calendar className="h-3 w-3 mr-1"/>{e.date}</div> : '-'}
                        </TableCell>
                        <TableCell>
                            <Badge variant={e.status === 'Report Received' ? 'success' : e.status === 'Disputed' ? 'error' : 'info'}>{e.status}</Badge>
                        </TableCell>
                        <TableCell>
                            <Button size="sm" variant="ghost" disabled={e.status !== 'Report Received'}>View Report</Button>
                        </TableCell>
                    </TableRow>
                ))}
                {exams.length === 0 && (
                    <TableRow><TableCell colSpan={6} className={cn("text-center py-8 italic", theme.text.tertiary)}>No examinations scheduled.</TableCell></TableRow>
                )}
            </TableBody>
        </TableContainer>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Order Rule 35 Examination">
            <div className="p-6 space-y-4">
                <Input label="Examinee Name" value={newExam.examinee || ''} onChange={e => setNewExam({...newExam, examinee: e.target.value})}/>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                         <select className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)} value={newExam.type} onChange={e => setNewExam({...newExam, type: e.target.value as any})}>
                             <option value="">Select...</option>
                             <option value="Physical">Physical</option>
                             <option value="Mental">Mental</option>
                         </select>
                     </div>
                     <Input type="date" label="Date" value={newExam.date || ''} onChange={e => setNewExam({...newExam, date: e.target.value})}/>
                </div>
                <Input label="Examiner (Doctor)" value={newExam.doctorName || ''} onChange={e => setNewExam({...newExam, doctorName: e.target.value})}/>
                <TextArea label="Good Cause Statement" placeholder="Detail why condition is in controversy..." value={newExam.goodCause || ''} onChange={e => setNewExam({...newExam, goodCause: e.target.value})} rows={3}/>
                <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={handleSave}>Create Order</Button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default Examinations;
