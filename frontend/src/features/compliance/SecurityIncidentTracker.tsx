import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface SecurityIncident {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  detectedAt: string;
  resolvedAt: string | null;
  recordsAffected: number;
  assignedTo: string;
  description: string;
}

export default function SecurityIncidentTracker() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/compliance/security-incidents?status=${filter}`);
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status: string) => {
    const styles = {
      detected: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      contained: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Incident Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor and manage security incidents</p>
        </div>
        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Report Incident
        </button>
      </div>

      <div className="flex gap-2 bg-white p-4 rounded-lg shadow-md border border-gray-200">
        {['all', 'detected', 'investigating', 'contained', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-lg shadow-md border-l-4 border-gray-200 p-6 hover:shadow-lg transition"
              style={{
                borderLeftColor: incident.severity === 'critical' ? '#DC2626' : incident.severity === 'high' ? '#EA580C' : '#3B82F6'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-6 h-6 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{incident.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded ${getSeverityBadge(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusBadge(incident.status)}`}>
                    {incident.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium capitalize">{incident.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Detected:</span>
                  <p className="font-medium">{new Date(incident.detectedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Records Affected:</span>
                  <p className="font-medium text-red-600">{incident.recordsAffected}</p>
                </div>
                <div>
                  <span className="text-gray-600">Assigned To:</span>
                  <p className="font-medium">{incident.assignedTo || 'Unassigned'}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  View Details
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
