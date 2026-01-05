
import React, { useState } from 'react';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { Button } from '../common/Button.tsx';
import { Plus, X } from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { Input } from '../common/Inputs.tsx';
import { useData } from '../../hooks/useData.ts';

export const CalendarTeam: React.FC = () => {
  const staff = useData(s => s.staff);
  // Simulating schedule state locally since it's not in the main store
  const [scheduleData, setScheduleData] = useState<Record<string, number[]>>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });

  const getSchedule = (id: string) => {
      return scheduleData[id] || [1, 1, 1, 1, 1, 0, 0];
  };

  const toggleSlot = (memberId: string, dayIndex: number) => {
      const current = getSchedule(memberId);
      const updated = [...current];
      updated[dayIndex] = updated[dayIndex] ? 0 : 1;
      setScheduleData({ ...scheduleData, [memberId]: updated });
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden relative group/container">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Team Availability (This Week)</h3>
        <Button size="sm" variant="outline" icon={Plus} onClick={() => setIsModalOpen(true)}>Add Staff</Button>
      </div>
      <div className="p-6">
        <div className="hidden md:grid grid-cols-8 gap-4 mb-4 border-b border-slate-100 pb-2">
          <div className="col-span-1 font-semibold text-xs text-slate-500 uppercase">Team Member</div>
          {days.map(d => <div key={d} className="col-span-1 font-semibold text-xs text-slate-500 uppercase text-center">{d}</div>)}
        </div>
        
        <div className="space-y-6 md:space-y-6">
          {staff.map((member) => {
            const schedule = getSchedule(member.id);
            return (
            <div key={member.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center border-b md:border-b-0 border-slate-100 pb-4 md:pb-0 last:border-0 relative group">
              <div className="col-span-1 flex items-center gap-2 mb-2 md:mb-0 pl-4">
                <UserAvatar name={member.name} size="sm"/>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{member.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{member.role}</p>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-7 grid grid-cols-7 gap-2">
                {schedule.map((status, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => toggleSlot(member.id, i)}>
                        <span className="md:hidden text-[10px] text-slate-400 uppercase font-bold">{days[i].charAt(0)}</span>
                        <div className={`h-8 w-full rounded-md transition-colors ${status ? 'bg-green-100 border border-green-200 hover:bg-green-200' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'} flex items-center justify-center`}>
                            <span className={`text-[10px] md:text-xs font-medium ${status ? 'text-green-700' : 'text-slate-300'}`}>
                            {status ? 'OK' : '-'}
                            </span>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          )})}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Team Member">
          <div className="p-6 space-y-4">
              <Input label="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} autoFocus/>
              <Input label="Role" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} placeholder="e.g. Associate"/>
              <div className="flex justify-end pt-4">
                  <Button onClick={() => setIsModalOpen(false)}>Add to Schedule</Button>
              </div>
          </div>
      </Modal>

      <div className="absolute bottom-2 right-2 opacity-0 group-hover/container:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none z-20">
        CAL-03
      </div>
    </div>
  );
};
