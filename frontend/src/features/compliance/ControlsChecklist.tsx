import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ComplianceControl {
  id: string;
  controlId: string;
  name: string;
  framework: string;
  category: string;
  status: string;
  severity: string;
  description: string;
  implementationDetails: string;
  evidence: any[];
  nextReviewDate: string;
}

export default function ControlsChecklist() {
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchControls();
  }, [selectedFramework, selectedStatus]);

  const fetchControls = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/compliance/controls?framework=${selectedFramework}&status=${selectedStatus}`);
      const data = await response.json();
      setControls(data);
    } catch (error) {
      console.error('Failed to fetch controls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'non_compliant': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'needs_review': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      compliant: 'bg-green-100 text-green-800',
      non_compliant: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      needs_review: 'bg-orange-100 text-orange-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-blue-600 text-white',
    };
    return styles[severity as keyof typeof styles] || 'bg-gray-600 text-white';
  };

  const groupedControls = controls.reduce((acc, control) => {
    if (!acc[control.category]) {
      acc[control.category] = [];
    }
    acc[control.category].push(control);
    return acc;
  }, {} as Record<string, ComplianceControl[]>);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Controls Checklist</h1>
        <p className="text-gray-600 mt-1">Track and manage compliance control implementation</p>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <select
          value={selectedFramework}
          onChange={(e) => setSelectedFramework(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Frameworks</option>
          <option value="SOC2">SOC 2</option>
          <option value="HIPAA">HIPAA</option>
          <option value="GDPR">GDPR</option>
          <option value="ISO27001">ISO 27001</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="compliant">Compliant</option>
          <option value="non_compliant">Non-Compliant</option>
          <option value="in_progress">In Progress</option>
          <option value="needs_review">Needs Review</option>
        </select>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          Object.entries(groupedControls).map(([category, categoryControls]) => (
            <div key={category} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                <p className="text-sm text-gray-600">{categoryControls.length} controls</p>
              </div>
              <div className="divide-y divide-gray-200">
                {categoryControls.map((control) => (
                  <div key={control.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(control.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-gray-600">{control.controlId}</span>
                            <h3 className="font-semibold text-gray-900">{control.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{control.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityBadge(control.severity)}`}>
                          {control.severity}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(control.status)}`}>
                          {control.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {control.implementationDetails && (
                      <div className="ml-8 mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Implementation:</span> {control.implementationDetails}
                        </p>
                      </div>
                    )}

                    <div className="ml-8 mt-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Evidence: <span className="font-medium">{control.evidence?.length || 0} items</span>
                        </span>
                        <span className="text-gray-600">
                          Next Review: <span className="font-medium">{new Date(control.nextReviewDate).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          Update
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300">
                          Test
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
