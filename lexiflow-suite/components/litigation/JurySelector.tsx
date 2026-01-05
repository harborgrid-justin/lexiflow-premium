
import React, { useState } from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { User, X, Check, HelpCircle, Users } from 'lucide-react';

interface Juror {
    seat: number;
    name: string;
    status: 'Seated' | 'Strike' | 'Excused' | 'Pool';
    notes: string;
    demographics: string;
}

export const JurySelector: React.FC = () => {
  const [jurors, setJurors] = useState<Juror[]>(
    Array.from({ length: 12 }, (_, i) => ({
      seat: i + 1,
      name: `Juror #${100 + i}`,
      status: 'Pool',
      notes: '',
      demographics: 'Unknown'
    }))
  );

  const updateStatus = (seat: number, status: Juror['status']) => {
      setJurors(jurors.map(j => j.seat === seat ? { ...j, status } : j));
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-lg">
            <h3 className="font-bold text-lg flex items-center gap-2"><Users className="h-5 w-5"/> Voir Dire / Jury Selection</h3>
            <div className="flex gap-4 text-sm">
                <span>Peremptory Strikes: <strong>3 Left</strong></span>
                <span>Cause Strikes: <strong>Unlimited</strong></span>
            </div>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
            {jurors.map(juror => (
                <div key={juror.seat} className={`relative p-3 rounded-lg border-2 transition-all ${
                    juror.status === 'Strike' ? 'bg-red-50 border-red-300 opacity-60' :
                    juror.status === 'Seated' ? 'bg-green-50 border-green-400' :
                    juror.status === 'Excused' ? 'bg-slate-100 border-slate-200' :
                    'bg-white border-slate-200 shadow-sm'
                }`}>
                    <div className="absolute top-2 right-2 text-xs font-bold text-slate-400">#{juror.seat}</div>
                    <div className="flex flex-col items-center py-2">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-2">
                            <User className="h-6 w-6 text-slate-500"/>
                        </div>
                        <span className="font-bold text-sm text-slate-800">{juror.name}</span>
                        <span className="text-[10px] text-slate-500">{juror.demographics}</span>
                    </div>
                    
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                        <button onClick={() => updateStatus(juror.seat, 'Strike')} className="p-1 hover:bg-red-100 text-red-600 rounded" title="Strike"><X size={14}/></button>
                        <button onClick={() => updateStatus(juror.seat, 'Excused')} className="p-1 hover:bg-slate-200 text-slate-600 rounded" title="Excused"><HelpCircle size={14}/></button>
                        <button onClick={() => updateStatus(juror.seat, 'Seated')} className="p-1 hover:bg-green-100 text-green-600 rounded" title="Seat"><Check size={14}/></button>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Juror Notes">
                <textarea className="w-full h-32 border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500" placeholder="General observations..."></textarea>
            </Card>
            <Card title="Demographics Analysis">
                <div className="h-32 bg-slate-50 rounded flex items-center justify-center text-slate-400 text-xs">
                    Charts Placeholder (Gender/Age Distribution)
                </div>
            </Card>
        </div>
    </div>
  );
};
