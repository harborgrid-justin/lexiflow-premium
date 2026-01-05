
import React from 'react';
import { Card } from '../common/Card.tsx';
import { ToggleLeft, ToggleRight, Settings } from 'lucide-react';

export const WorkflowConfig: React.FC = () => {
  return (
    <Card title="Workflow Automation Settings">
      <div className="space-y-4">
        {[
          { label: 'Auto-assign tasks based on role', enabled: true },
          { label: 'Enforce dependency locking', enabled: true },
          { label: 'Notify on SLA breach (Email)', enabled: true },
          { label: 'Require approval for budget items', enabled: false },
          { label: 'Archive completed workflows after 30 days', enabled: false },
        ].map((setting, i) => (
          <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0">
            <span className="text-sm font-medium text-slate-700">{setting.label}</span>
            <button className={`text-2xl ${setting.enabled ? 'text-blue-600' : 'text-slate-300'}`}>
              {setting.enabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
            </button>
          </div>
        ))}
        
        <div className="pt-4 mt-4 border-t border-slate-100">
            <button className="flex items-center text-sm text-slate-500 hover:text-blue-600 font-medium">
                <Settings className="h-4 w-4 mr-2" /> Advanced Configuration
            </button>
        </div>
      </div>
    </Card>
  );
};
