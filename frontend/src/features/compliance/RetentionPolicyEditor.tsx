import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Archive, Lock } from 'lucide-react';

interface RetentionRule {
  id: string;
  name: string;
  resourceType: string;
  retentionPeriodDays: number;
  action: string;
  status: string;
  priority: number;
  autoExecute: boolean;
  nextExecutionDate: string;
  resourcesAffected: number;
}

export default function RetentionPolicyEditor() {
  const [rules, setRules] = useState<RetentionRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/retention-rules');
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Failed to fetch retention rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'archive': return <Archive className="w-5 h-5 text-blue-600" />;
      case 'delete': return <Trash2 className="w-5 h-5 text-red-600" />;
      case 'anonymize': return <Lock className="w-5 h-5 text-purple-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Retention Policies</h1>
          <p className="text-gray-600 mt-1">Manage automated data retention and deletion rules</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          New Retention Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getActionIcon(rule.action)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                    <p className="text-sm text-gray-600">{rule.resourceType}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {rule.status}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Retention Period:</span>
                  <span className="font-medium">{rule.retentionPeriodDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Action:</span>
                  <span className="font-medium capitalize">{rule.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto Execute:</span>
                  <span className="font-medium">{rule.autoExecute ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resources Affected:</span>
                  <span className="font-medium">{rule.resourcesAffected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Execution:</span>
                  <span className="font-medium">{new Date(rule.nextExecutionDate).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  Edit Rule
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                  Execute Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
