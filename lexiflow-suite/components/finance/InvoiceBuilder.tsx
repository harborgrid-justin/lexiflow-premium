
import React, { useState } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Plus, Trash2, Download, Send, RefreshCw } from 'lucide-react';
import { Input } from '../common/Inputs.tsx';

export const InvoiceBuilder: React.FC = () => {
  const [items, setItems] = useState([
    { id: 1, desc: 'Legal Research - Motion to Dismiss', hours: 2.5, rate: 450 },
    { id: 2, desc: 'Client Conference Call', hours: 0.5, rate: 450 },
    { id: 3, desc: 'Filing Fee (Advanced Cost)', hours: 1, rate: 45, flat: true },
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), desc: '', hours: 0, rate: 0, flat: false }]);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.flat ? item.rate : item.hours * item.rate), 0);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Editor */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm p-8 overflow-y-auto">
            <div className="flex justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">INVOICE</h1>
                    <p className="text-slate-500">#INV-2024-001</p>
                </div>
                <div className="text-right">
                    <div className="font-bold text-slate-900">LexiFlow LLP</div>
                    <div className="text-sm text-slate-500">123 Legal Ave, NY</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bill To</label>
                    <select className="w-full p-2 border rounded bg-slate-50 text-sm">
                        <option>TechCorp Industries</option>
                        <option>OmniGlobal Inc.</option>
                    </select>
                </div>
                <div className="text-right">
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
                     <div className="text-sm font-medium">Oct 24, 2023</div>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-slate-800">
                        <th className="text-left py-2 text-xs uppercase font-bold text-slate-600">Description</th>
                        <th className="text-right py-2 text-xs uppercase font-bold text-slate-600 w-20">Hrs/Qty</th>
                        <th className="text-right py-2 text-xs uppercase font-bold text-slate-600 w-24">Rate</th>
                        <th className="text-right py-2 text-xs uppercase font-bold text-slate-600 w-24">Amount</th>
                        <th className="w-8"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-100 group">
                            <td className="py-2">
                                <input className="w-full outline-none text-sm bg-transparent" defaultValue={item.desc} placeholder="Enter description..."/>
                            </td>
                            <td className="py-2 text-right">
                                <input className="w-full text-right outline-none text-sm bg-transparent" defaultValue={item.hours} type="number"/>
                            </td>
                            <td className="py-2 text-right">
                                <input className="w-full text-right outline-none text-sm bg-transparent" defaultValue={item.rate} type="number"/>
                            </td>
                            <td className="py-2 text-right font-mono text-sm">
                                ${(item.flat ? item.rate : item.hours * item.rate).toFixed(2)}
                            </td>
                            <td className="py-2 text-center">
                                <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setItems(items.filter(i => i.id !== item.id))}>
                                    <Trash2 size={14}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-start">
                <Button size="sm" variant="ghost" icon={Plus} onClick={addItem}>Add Line Item</Button>
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-mono">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                        <span className="text-slate-500">Tax (0%)</span>
                        <span className="font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between py-4 text-lg font-bold text-slate-900">
                        <span>Total Due</span>
                        <span className="font-mono">${calculateTotal().toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 space-y-6">
            <Card title="Actions">
                <div className="space-y-3">
                    <Button className="w-full" variant="primary" icon={Send}>Send to Client</Button>
                    <Button className="w-full" variant="outline" icon={Download}>Download PDF</Button>
                    <Button className="w-full" variant="ghost" icon={RefreshCw}>Export LEDES 1998B</Button>
                </div>
            </Card>
            
            <Card title="Settings">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Due Date</label>
                        <select className="w-full border rounded p-2 text-sm bg-white">
                            <option>Net 30</option>
                            <option>Net 15</option>
                            <option>Due on Receipt</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-blue-600"/>
                        <span className="text-sm text-slate-700">Include Trust Balance</span>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};
