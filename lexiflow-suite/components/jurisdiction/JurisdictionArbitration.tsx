
import React from 'react';
import { Gavel, CheckCircle } from 'lucide-react';
import { Card } from '../common/Card.tsx';

export const JurisdictionArbitration: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2" title="ADR Providers">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-1">AAA</h4>
            <p className="text-xs text-slate-500 uppercase tracking-wide">American Arbitration Association</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-green-500"/> Commercial Rules</li>
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-green-500"/> Employment Rules</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-white">
            <h4 className="font-bold text-lg text-slate-900 mb-1">JAMS</h4>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Judicial Arbitration and Mediation</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-green-500"/> Comprehensive Rules</li>
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-green-500"/> International Rules</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Panel Selection">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Manage preferred arbitrators and strike lists.</p>
          <div className="bg-slate-50 p-3 rounded text-sm font-medium">
            <span className="block text-xs text-slate-400 uppercase mb-1">Pending Selection</span>
            TechCorp v. StartUp Inc (AAA Case #4492)
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">View Arbitrator Profiles</button>
        </div>
      </Card>
    </div>
  );
};
