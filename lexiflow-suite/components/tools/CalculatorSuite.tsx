
import React, { useState } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Calendar, DollarSign, Percent } from 'lucide-react';
import { Tabs } from '../common/Tabs.tsx';

export const CalculatorSuite: React.FC = () => {
    const [tab, setTab] = useState('Interest');

    return (
        <div className="space-y-6">
            <Tabs tabs={['Interest', 'DateDiff', 'Settlement']} activeTab={tab} onChange={setTab} />
            
            {tab === 'Interest' && (
                <Card title="Pre-Judgment Interest Calculator">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Principal Amount</label>
                            <div className="relative">
                                <DollarSign className="absolute left-2 top-2 h-4 w-4 text-slate-400"/>
                                <input className="w-full pl-8 p-2 border rounded text-sm" placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Interest Rate (%)</label>
                            <div className="relative">
                                <Percent className="absolute left-2 top-2 h-4 w-4 text-slate-400"/>
                                <input className="w-full pl-8 p-2 border rounded text-sm" placeholder="10" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                            <input type="date" className="w-full p-2 border rounded text-sm"/>
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                            <input type="date" className="w-full p-2 border rounded text-sm"/>
                        </div>
                    </div>
                    <div className="bg-slate-100 p-4 rounded text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold">Total Interest</p>
                        <p className="text-3xl font-mono font-bold text-slate-900">$0.00</p>
                    </div>
                </Card>
            )}
            
            {tab === 'DateDiff' && (
                <Card title="Date Calculator (Business Days)">
                    <div className="space-y-4">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                                <input type="date" className="w-full p-2 border rounded text-sm"/>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Add/Subtract</label>
                                <div className="flex border rounded overflow-hidden">
                                    <input className="w-full p-2 text-sm outline-none" placeholder="Days"/>
                                    <select className="bg-slate-50 border-l p-2 text-sm text-slate-600"><option>Business Days</option><option>Calendar Days</option></select>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full" variant="primary">Calculate</Button>
                    </div>
                </Card>
            )}

             {tab === 'Settlement' && (
                <Card title="Settlement Value Probability">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">Weighted average calculation based on outcome scenarios.</p>
                        {['Win (Summary Judgment)', 'Win (Trial)', 'Loss'].map(scenario => (
                            <div key={scenario} className="flex gap-2 items-center">
                                <span className="w-40 text-xs font-bold text-slate-700">{scenario}</span>
                                <input className="w-20 p-1 border rounded text-xs" placeholder="Prob %"/>
                                <input className="flex-1 p-1 border rounded text-xs" placeholder="Value $"/>
                            </div>
                        ))}
                         <div className="bg-green-50 p-4 rounded text-center border border-green-100">
                            <p className="text-xs text-green-700 uppercase font-bold">Expected Value</p>
                            <p className="text-2xl font-mono font-bold text-green-800">$0.00</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
