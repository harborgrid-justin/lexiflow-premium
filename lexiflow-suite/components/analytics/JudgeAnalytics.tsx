
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Gavel } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { JudgeProfile } from '../../types.ts';

interface JudgeAnalyticsProps {
  judge: JudgeProfile;
  stats: any[];
}

export const JudgeAnalytics: React.FC<JudgeAnalyticsProps> = ({ judge, stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-slate-100 p-4 rounded-full"><Gavel className="h-8 w-8 text-slate-700"/></div>
          <div>
            <h3 className="font-bold text-lg">{judge.name}</h3>
            <p className="text-sm text-slate-500">{judge.court}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded border border-blue-100">
            <p className="text-xs text-blue-600 uppercase font-bold">Avg. Time to Trial</p>
            <p className="text-xl font-bold text-slate-900">{judge.avgCaseDuration} Days</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Tendencies</h4>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              {judge.tendencies.map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>
      </Card>
      <Card className="lg:col-span-2" title="Motion Grant Rates">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false}/>
              <XAxis type="number" domain={[0, 100]} hide/>
              <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 12}}/>
              <Tooltip cursor={{fill: 'transparent'}}/>
              <Legend />
              <Bar dataKey="grant" name="Granted %" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20}/>
              <Bar dataKey="deny" name="Denied %" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
