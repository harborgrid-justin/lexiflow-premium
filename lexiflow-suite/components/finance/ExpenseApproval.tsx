
import React from 'react';
import { Check, X } from 'lucide-react';

export const ExpenseApproval: React.FC = () => (
    <div className="space-y-4">
        {[1,2].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                <div>
                    <h4 className="font-bold text-sm">Travel to NYC Deposition</h4>
                    <p className="text-xs text-slate-500">Submitted by James Doe • $1,240.50</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={16}/></button>
                    <button className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={16}/></button>
                </div>
            </div>
        ))}
    </div>
);
