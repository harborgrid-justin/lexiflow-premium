
import React from 'react';
import { GripVertical, Plus, Type, CheckSquare, Calendar, Phone, Mail } from 'lucide-react';
import { Card } from '../common/Card.tsx';

export const FormBuilder: React.FC = () => {
  return (
    <div className="flex h-full gap-6">
        <div className="w-64 space-y-4">
            <Card title="Components">
                <div className="space-y-2">
                    {[
                        { icon: Type, label: 'Text Field' },
                        { icon: CheckSquare, label: 'Checkbox' },
                        { icon: Calendar, label: 'Date Picker' },
                        { icon: Phone, label: 'Phone Number' },
                        { icon: Mail, label: 'Email' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded cursor-move hover:border-blue-400 hover:shadow-sm transition-all">
                            <GripVertical size={14} className="text-slate-300"/>
                            <item.icon size={14} className="text-slate-500"/>
                            <span className="text-sm text-slate-700">{item.label}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>

        <div className="flex-1 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-slate-900 p-4 text-white">
                    <h2 className="text-lg font-bold">New Client Intake Form</h2>
                    <p className="text-sm opacity-70">Please fill out all required fields.</p>
                </div>
                <div className="p-6 space-y-6">
                    {/* Mock Drop Zone Items */}
                    <div className="group relative border border-transparent hover:border-blue-300 hover:bg-blue-50/50 p-2 rounded -mx-2 transition-colors">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input className="w-full border rounded p-2 text-sm bg-slate-50" disabled placeholder="Short text answer"/>
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm border rounded p-1 cursor-pointer">
                            <GripVertical size={14}/>
                        </div>
                    </div>
                    
                    <div className="group relative border border-transparent hover:border-blue-300 hover:bg-blue-50/50 p-2 rounded -mx-2 transition-colors">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Incident Date</label>
                        <div className="w-full border rounded p-2 text-sm bg-slate-50 flex justify-between text-slate-400">
                            <span>MM/DD/YYYY</span> <Calendar size={16}/>
                        </div>
                    </div>

                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                        <span className="flex items-center gap-2 text-sm"><Plus size={16}/> Drag components here</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm">Submit</button>
                </div>
            </div>
        </div>
    </div>
  );
};
