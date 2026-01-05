
import React, { useState } from 'react';
import { MapPin, User, Clock, Plus, Trash2, Edit2, Gavel } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { Modal } from '../common/Modal.tsx';
import { Input } from '../common/Inputs.tsx';

export const CalendarHearings: React.FC = () => {
  const [hearings, setHearings] = useState([
    { id: '1', title: 'Case Management Conference', case: 'Martinez v. TechCorp', time: '09:00 AM', location: 'Dept 504, SF Superior', judge: 'Hon. S. Miller' },
    { id: '2', title: 'Motion Summary Judgment', case: 'State v. GreenEnergy', time: '01:30 PM', location: 'Courtroom 4B, NV District', judge: 'Hon. A. Wright' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHearing, setCurrentHearing] = useState<any>(null);

  const handleDelete = (id: string) => setHearings(hearings.filter(h => h.id !== id));

  const handleSave = () => {
      if (currentHearing.id) {
          setHearings(hearings.map(h => h.id === currentHearing.id ? currentHearing : h));
      } else {
          setHearings([...hearings, { ...currentHearing, id: Date.now().toString() }]);
      }
      setIsModalOpen(false);
  };

  const openNew = () => {
      setCurrentHearing({ title: '', case: '', time: '', location: '', judge: '' });
      setIsModalOpen(true);
  };

  const openEdit = (h: any) => {
      setCurrentHearing(h);
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 relative group/container h-full">
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-lg">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Gavel className="h-5 w-5 text-rose-600"/> Hearing Docket</h3>
          <Button size="sm" variant="primary" icon={Plus} onClick={openNew}>Schedule Hearing</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hearings.map(h => (
          <div key={h.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group relative">
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(h)} className="p-1.5 hover:bg-slate-100 rounded text-blue-600"><Edit2 size={12}/></button>
                <button onClick={() => handleDelete(h.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 size={12}/></button>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200">Hearing</span>
              <span className="text-slate-500 text-xs font-mono flex items-center"><Clock className="h-3 w-3 mr-1"/> {h.time}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-lg">{h.title}</h4>
            <p className="text-blue-600 font-medium text-sm mb-4">{h.case}</p>
            
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="h-4 w-4 mr-2 text-slate-400"/>
                {h.location}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <User className="h-4 w-4 mr-2 text-slate-400"/>
                {h.judge}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentHearing?.id ? "Edit Hearing" : "Schedule Hearing"}>
          <div className="p-6 space-y-4">
              <Input label="Hearing Type/Title" value={currentHearing?.title || ''} onChange={e => setCurrentHearing({...currentHearing, title: e.target.value})} autoFocus/>
              <Input label="Case Reference" value={currentHearing?.case || ''} onChange={e => setCurrentHearing({...currentHearing, case: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                  <Input type="time" label="Time" value={currentHearing?.time || ''} onChange={e => setCurrentHearing({...currentHearing, time: e.target.value})} />
                  <Input label="Location / Dept" value={currentHearing?.location || ''} onChange={e => setCurrentHearing({...currentHearing, location: e.target.value})} />
              </div>
              <Input label="Presiding Judge" value={currentHearing?.judge || ''} onChange={e => setCurrentHearing({...currentHearing, judge: e.target.value})} />
              <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>Save Hearing</Button>
              </div>
          </div>
      </Modal>

      <div className="absolute bottom-2 right-2 opacity-0 group-hover/container:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none z-20">
        CAL-04
      </div>
    </div>
  );
};
