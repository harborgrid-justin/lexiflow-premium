
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Users } from 'lucide-react';
import { OpposingCounselProfile } from '../../types.ts';

interface CounselAnalyticsProps {
  counsel: OpposingCounselProfile;
}

export const CounselAnalytics: React.FC<CounselAnalyticsProps> = ({ counsel }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <div className="flex justify-between items-start mb-4">
          <div><h3 className="font-bold text-lg">{counsel.name}</h3><p className="text-sm text-slate-500">{counsel.firm}</p></div>
          <Users className="h-6 w-6 text-indigo-500"/>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-4 bg-slate-50 rounded">
            <p className="text-3xl font-bold text-indigo-600">{counsel.settlementRate}%</p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Settlement Rate</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded">
            <p className="text-3xl font-bold text-amber-600">{counsel.trialRate}%</p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Trial Rate</p>
          </div>
        </div>
      </Card>
      <Card title="Negotiation Strategy">
        <p className="text-sm text-slate-600 mb-4">Firm tends to settle 12% above calculated case value when pressed on discovery.</p>
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden relative mt-8">
          <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-slate-400 z-10"></div>
          <div className="bg-green-500 h-full w-[62%]"></div>
          <span className="absolute top-5 left-[50%] -translate-x-1/2 text-xs text-slate-500">Fair Value</span>
          <span className="absolute top-5 left-[62%] -translate-x-1/2 text-xs text-green-600 font-bold">Settlement Avg</span>
        </div>
      </Card>
    </div>
  );
};
