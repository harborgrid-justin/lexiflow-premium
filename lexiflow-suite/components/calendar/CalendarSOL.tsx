
import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Button } from '../common/Button.tsx';
import { Modal } from '../common/Modal.tsx';
import { Input } from '../common/Inputs.tsx';

export const CalendarSOL: React.FC = () => {
  const [solData, setSolData] = useState([
      { id: '1', date: '2024-05-15', matter: 'Smith Personal Injury', cause: 'Negligence (Bodily Injury)', jurisdiction: 'California (2 Years)', daysLeft: 64, critical: true },
      { id: '2', date: '2025-01-20', matter: 'TechCorp Breach', cause: 'Breach of Written Contract', jurisdiction: 'California (4 Years)', daysLeft: 300, critical: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSOL, setCurrentSOL] = useState<any>(null);

  const handleDelete = (id: string) => setSolData(solData.filter(d => d.id !== id));
  
  const handleSave = () => {
    // Basic day diff logic for demo
    const daysLeft = Math.floor((new Date(currentSOL.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const newItem = { ...currentSOL, daysLeft, critical: daysLeft < 90 };
    
    if (newItem.id) {
        setSolData(solData.map(d => d.id === newItem.id ? newItem : d));
    } else {
        setSolData([...solData, { ...newItem, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  const openNew = () => {
      setCurrentSOL({ date: '', matter: '', cause: '', jurisdiction: '' });
      setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
      setCurrentSOL(item);
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative group/container h-full">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center relative">
        <div className="absolute top-4 right-4">
             <Button size="sm" variant="danger" icon={Plus} onClick={openNew}>Add SOL</Button>
        </div>
        <ShieldAlert className="h-12 w-12 text-red-600 mx-auto mb-3"/>
        <h3 className="text-lg font-bold text-red-900">Statute of Limitations Watch</h3>
        <p className="text-red-700 max-w-lg mx-auto text-sm">Critical dates for filing complaints. Missing these dates will result in malpractice liability. Dates are calculated based on cause of action and jurisdiction.</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <TableContainer>
            <TableHeader>
            <TableHead>Expiration Date</TableHead>
            <TableHead>Potential Matter</TableHead>
            <TableHead>Cause of Action</TableHead>
            <TableHead>Jurisdiction</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
            {solData.map((row) => (
                <TableRow key={row.id} className={row.critical ? 'bg-red-50/50' : ''}>
                    <TableCell className={`font-bold ${row.critical ? 'text-red-700' : 'text-slate-700'}`}>{row.date}</TableCell>
                    <TableCell className="font-medium text-slate-900">{row.matter}</TableCell>
                    <TableCell>{row.cause}</TableCell>
                    <TableCell>{row.jurisdiction}</TableCell>
                    <TableCell>
                        <span className={`${row.critical ? 'text-red-600 font-bold' : 'text-slate-500'} flex items-center`}>
                            {row.critical && <AlertTriangle className="h-3 w-3 mr-1"/>}
                            {row.daysLeft} Days
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => openEdit(row)} className="text-slate-400 hover:text-blue-600"><Edit2 size={14}/></button>
                            <button onClick={() => handleDelete(row.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                    </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {solData.map((row) => (
            <div key={row.id} className={`p-4 rounded-lg border shadow-sm ${row.critical ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-lg font-bold ${row.critical ? 'text-red-700' : 'text-slate-700'}`}>{row.date}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${row.critical ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                        {row.daysLeft} Days Left
                    </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{row.matter}</h4>
                <p className="text-xs text-slate-600 mb-3">{row.cause}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-2 border-slate-200/50">
                    <span className="flex items-center"><MapPin className="h-3 w-3 mr-1"/> {row.jurisdiction}</span>
                    <div className="flex gap-3">
                         <button onClick={() => openEdit(row)} className="text-blue-600 font-bold">Edit</button>
                         <button onClick={() => handleDelete(row.id)} className="text-red-600 font-bold">Delete</button>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Track Statute of Limitations">
          <div className="p-6 space-y-4">
              <Input label="Expiration Date" type="date" value={currentSOL?.date || ''} onChange={e => setCurrentSOL({...currentSOL, date: e.target.value})} />
              <Input label="Potential Matter" value={currentSOL?.matter || ''} onChange={e => setCurrentSOL({...currentSOL, matter: e.target.value})} />
              <Input label="Cause of Action" value={currentSOL?.cause || ''} onChange={e => setCurrentSOL({...currentSOL, cause: e.target.value})} />
              <Input label="Jurisdiction (Rule)" value={currentSOL?.jurisdiction || ''} onChange={e => setCurrentSOL({...currentSOL, jurisdiction: e.target.value})} />
              <div className="flex justify-end pt-4">
                  <Button variant="danger" onClick={handleSave}>Set Watch Alert</Button>
              </div>
          </div>
      </Modal>

      <div className="absolute bottom-2 right-2 opacity-0 group-hover/container:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none z-20">
        CAL-05
      </div>
    </div>
  );
};
