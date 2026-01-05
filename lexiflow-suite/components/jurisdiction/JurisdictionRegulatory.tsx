
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Scale, AlertTriangle, FileText } from 'lucide-react';

export const JurisdictionRegulatory: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Administrative Bodies">
        <div className="space-y-4">
          <div className="flex items-start p-3 border rounded-lg bg-slate-50">
            <Scale className="h-6 w-6 text-blue-600 mr-3 mt-1"/>
            <div>
              <h4 className="font-bold text-slate-900">Federal Trade Commission (FTC)</h4>
              <p className="text-sm text-slate-500">Antitrust reviews & Consumer protection.</p>
              <div className="mt-2 text-xs font-mono bg-white border px-2 py-1 rounded inline-block">Ref: 15 U.S.C. § 41</div>
            </div>
          </div>
          <div className="flex items-start p-3 border rounded-lg bg-slate-50">
            <Scale className="h-6 w-6 text-green-600 mr-3 mt-1"/>
            <div>
              <h4 className="font-bold text-slate-900">Securities & Exchange Commission (SEC)</h4>
              <p className="text-sm text-slate-500">Capital markets oversight & enforcement.</p>
              <div className="mt-2 text-xs font-mono bg-white border px-2 py-1 rounded inline-block">Ref: Sarbanes-Oxley</div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Recent Regulatory Actions">
        <div className="space-y-4">
          <div className="flex items-center text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-100">
            <AlertTriangle className="h-4 w-4 mr-2"/>
            <span>FTC Proposed Rule on Non-Competes (Pending)</span>
          </div>
          <div className="flex items-center text-sm text-blue-700 bg-blue-50 p-3 rounded border border-blue-100">
            <FileText className="h-4 w-4 mr-2"/>
            <span>SEC Climate Disclosure Guidelines (Adopted)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
