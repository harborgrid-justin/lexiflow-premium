
import React, { useState } from 'react';
import { Card } from '../common/Card.tsx';
import { ToggleRight, ToggleLeft, FlaskConical } from 'lucide-react';

export const FeatureFlags: React.FC = () => {
    const [flags, setFlags] = useState([
        { id: 'beta_ui', name: 'New UI Layout (Beta)', enabled: false, desc: 'Enables the React 18 concurrent layout engine.' },
        { id: 'ai_draft', name: 'AI Drafting Assistant', enabled: true, desc: 'Gemini-powered legal drafting.' },
        { id: 'dark_mode', name: 'Dark Mode Support', enabled: true, desc: 'Allow users to toggle dark theme.' },
        { id: 'audit_v2', name: 'Enhanced Audit Logs', enabled: false, desc: 'Granular field-level tracking.' },
    ]);

    const toggleFlag = (index: number) => {
        const newFlags = [...flags];
        newFlags[index].enabled = !newFlags[index].enabled;
        setFlags(newFlags);
    };

    return (
        <Card title="Feature Flags & Experiments" action={<div className="text-xs text-slate-500 flex items-center"><FlaskConical className="h-3 w-3 mr-1"/> Dev Environment</div>}>
            <div className="divide-y divide-slate-100">
                {flags.map((flag, i) => (
                    <div key={flag.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div>
                            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                {flag.name} 
                                <span className="font-mono text-[10px] text-slate-400 font-normal bg-slate-100 px-1 rounded">{flag.id}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{flag.desc}</p>
                        </div>
                        <button onClick={() => toggleFlag(i)} className={`transition-colors ${flag.enabled ? 'text-blue-600' : 'text-slate-300'}`}>
                            {flag.enabled ? <ToggleRight className="h-8 w-8"/> : <ToggleLeft className="h-8 w-8"/>}
                        </button>
                    </div>
                ))}
            </div>
        </Card>
    );
};
