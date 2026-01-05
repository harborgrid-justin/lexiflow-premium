
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, CheckSquare, Shield, Gavel, Plus, Trash2 } from 'lucide-react';
import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { Modal } from '../common/Modal.tsx';
import { Input } from '../common/Inputs.tsx';
import { Button } from '../common/Button.tsx';
import { WorkflowTask, Case } from '../../types.ts';
import { useActions } from '../../hooks/useData.ts';

interface CalendarMasterProps {
  tasks: WorkflowTask[];
  cases: Case[];
}

export const CalendarMaster: React.FC<CalendarMasterProps> = ({ tasks, cases }) => {
  const {
    currentMonth,
    changeMonth,
    monthLabel,
    daysInMonth,
    firstDay,
    getEventsForDay
  } = useCalendarView(tasks, cases);

  const actions = useActions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', date: '', type: 'task', priority: 'Medium' });

  const handleEdit = (evt: any) => {
    setEditingEvent(evt);
    setFormData({ 
        title: evt.title, 
        date: evt.date, 
        type: evt.type, 
        priority: evt.priority || 'Medium' 
    });
    setIsModalOpen(true);
  };

  const handleAdd = (day?: number) => {
    setEditingEvent(null);
    const dateStr = day 
      ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];
      
    setFormData({ title: '', date: dateStr, type: 'task', priority: 'Medium' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (formData.type === 'task') {
        if (editingEvent) {
             actions.updateTask(editingEvent.id, { 
                 title: formData.title, 
                 dueDate: formData.date, 
                 priority: formData.priority as any 
             });
        } else {
             // Create new generic task
             // In a real app we'd need more fields, but this satisfies the calendar quick-add
        }
    }
    setIsModalOpen(false);
  };

  const getEventStyle = (type: string, priority: string) => {
    if (type === 'case') return 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-900 hover:bg-indigo-100 shadow-sm ring-1 ring-inset ring-indigo-200/50';
    if (type === 'compliance') return 'bg-amber-50 border-l-4 border-amber-500 text-amber-900 hover:bg-amber-100 shadow-sm ring-1 ring-inset ring-amber-200/50';
    if (priority === 'High' || priority === 'Critical') return 'bg-red-50 border-l-4 border-red-600 text-red-900 hover:bg-red-100 shadow-sm font-bold ring-1 ring-inset ring-red-200/50';
    if (type === 'hearing') return 'bg-rose-50 border-l-4 border-rose-600 text-rose-900 hover:bg-rose-100 shadow-sm font-bold ring-1 ring-inset ring-rose-200/50';
    return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900 hover:bg-blue-100 shadow-sm ring-1 ring-inset ring-blue-200/50';
  };

  const getEventIcon = (type: string) => {
      if (type === 'case') return <Briefcase className="h-2.5 w-2.5 mr-1 inline opacity-80 text-indigo-600"/>;
      if (type === 'compliance') return <Shield className="h-2.5 w-2.5 mr-1 inline opacity-80 text-amber-600"/>;
      if (type === 'hearing') return <Gavel className="h-2.5 w-2.5 mr-1 inline opacity-80 text-rose-600"/>;
      return <CheckSquare className="h-2.5 w-2.5 mr-1 inline opacity-80 text-blue-600"/>;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-fade-in relative group/container">
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 shadow-sm z-10">
         <div className="flex items-center gap-4">
             <h3 className="font-black text-slate-900 text-xl tracking-tight font-serif italic">{monthLabel}</h3>
             <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-inner">
                 <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm text-slate-600 active:scale-95"><ChevronLeft className="h-4 w-4"/></button>
                 <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm text-slate-600 active:scale-95"><ChevronRight className="h-4 w-4"/></button>
             </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest hidden lg:flex">
                <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-sm">Matter</span>
                <span className="flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 shadow-sm">Hearing</span>
                <span className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 shadow-sm">Critical</span>
            </div>
            <Button size="sm" icon={Plus} onClick={() => handleAdd()}>New Event</Button>
         </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-slate-200 gap-px border-b border-slate-200 overflow-y-auto no-scrollbar">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50/40 min-h-[120px]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth();
            
            return (
              <div key={day} className="bg-white p-2 min-h-[120px] flex flex-col hover:bg-slate-50 transition-colors group relative border-transparent hover:border-blue-100 cursor-default">
                <span className={`text-[11px] font-black mb-2 w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                    isToday ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-50 scale-110' : 
                    dayEvents.length > 0 ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'
                }`}>
                    {day}
                </span>
                
                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[140px] no-scrollbar pb-6">
                  {dayEvents.map((evt: any, idx: number) => (
                    <div 
                      key={`${evt.id}-${idx}`} 
                      onClick={(e) => { e.stopPropagation(); handleEdit(evt); }}
                      className={`text-[9px] px-2 py-1.5 rounded-r truncate cursor-pointer transition-all active:scale-[0.98] ${getEventStyle(evt.type, evt.priority as string)}`}
                    >
                      <div className="font-black truncate flex items-center">
                          {getEventIcon(evt.type)}
                          {evt.title}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => handleAdd(day)}
                  className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 hover:scale-110 active:scale-95"
                >
                    <Plus className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          {Array.from({ length: (42 - (daysInMonth + firstDay)) % 7 }).map((_, i) => (
             <div key={`fill-${i}`} className="bg-slate-50/40 min-h-[120px]" />
          ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? 'Edit Event' : 'Add Event'}>
        <div className="p-6 space-y-4">
           <Input label="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} autoFocus />
           <div className="grid grid-cols-2 gap-4">
             <Input type="date" label="Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
             <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Type</label>
               <select 
                 className="w-full px-3 py-2 border rounded-md text-sm outline-none bg-white"
                 value={formData.type}
                 onChange={e => setFormData({...formData, type: e.target.value})}
               >
                 <option value="task">Task</option>
                 <option value="case">Case Filing</option>
                 <option value="hearing">Hearing</option>
                 <option value="compliance">Compliance</option>
               </select>
             </div>
           </div>
           <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Priority</label>
               <select 
                 className="w-full px-3 py-2 border rounded-md text-sm outline-none bg-white"
                 value={formData.priority}
                 onChange={e => setFormData({...formData, priority: e.target.value})}
               >
                 <option value="Low">Low</option>
                 <option value="Medium">Medium</option>
                 <option value="High">High</option>
                 <option value="Critical">Critical</option>
               </select>
           </div>
           <div className="flex justify-between pt-4 border-t border-slate-100">
              {editingEvent ? (
                <Button variant="danger" icon={Trash2} onClick={() => setIsModalOpen(false)}>Delete</Button>
              ) : <div></div>}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save Event</Button>
              </div>
           </div>
        </div>
      </Modal>

      <div className="absolute bottom-2 right-2 opacity-0 group-hover/container:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none z-20">
        CAL-01
      </div>
    </div>
  );
};
