
import React, { useState } from 'react';
import { Card } from '../common/Card.tsx';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const DeadlineCalculator: React.FC = () => {
    const [triggerDate, setTriggerDate] = useState('');
    const [rule, setRule] = useState('FRCP');
    const [calculatedDates, setCalculatedDates] = useState<any[]>([]);

    const calculate = () => {
        if(!triggerDate) return;
        const base = new Date(triggerDate);
        
        setCalculatedDates([
            { label: 'Opposition Due (14 Days)', date: new Date(base.getTime() + 14*86400000).toLocaleDateString() },
            { label: 'Reply Due (21 Days)', date: new Date(base.getTime() + 21*86400000).toLocaleDateString() },
            { label: 'Discovery Cutoff (180 Days)', date: new Date(base.getTime() + 180*86400000).toLocaleDateString() },
        ]);
    };

    return (
        <div className="max-w-xl mx-auto">
            <Card title="Deadline Calculator">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trigger Date</label>
                            <input type="date" className="w-full border rounded p-2 text-sm" value={triggerDate} onChange={e => setTriggerDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rule Set</label>
                            <select className="w-full border rounded p-2 text-sm" value={rule} onChange={e => setRule(e.target.value)}>
                                <option value="FRCP">Federal Rules (FRCP)</option>
                                <option value="CA_CIV">California Civil Procedure</option>
                                <option value="NY_SUP">New York Supreme</option>
                            </select>
                        </div>
                    </div>
                    <Button className="w-full" onClick={calculate}>Calculate Deadlines</Button>
                    
                    {calculatedDates.length > 0 && (
                        <div className="mt-6 border-t pt-4 space-y-2">
                            {calculatedDates.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                    <div className="flex items-center text-blue-700 font-bold">
                                        <ArrowRight size={14} className="mr-2"/>
                                        {item.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
