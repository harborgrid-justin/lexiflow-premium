import React, { useState, useEffect } from 'react';
import caseService from '../../services/caseService';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  hourlyRate?: number;
  assignedDate?: Date;
  isActive: boolean;
}

interface WorkloadMetrics {
  userId: string;
  userName?: string;
  totalCases: number;
  activeCases: number;
  leadCases: number;
  supportCases: number;
  averageHoursPerCase: number;
  estimatedWorkload: number;
  capacity: number;
  utilization: number;
}

interface CaseTeamProps {
  caseId: string;
}

export const CaseTeam: React.FC<CaseTeamProps> = ({ caseId }) => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [workload, setWorkload] = useState<WorkloadMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWorkload, setShowWorkload] = useState(false);

  useEffect(() => {
    loadTeam();
    loadWorkload();
  }, [caseId]);

  const loadTeam = async () => {
    try {
      const data = await caseService.getCaseTeam(caseId);
      setTeam(data);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkload = async () => {
    try {
      const data = await caseService.getCaseTeamWorkload(caseId);
      setWorkload(data);
    } catch (error) {
      console.error('Failed to load workload:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Lead Attorney':
      case 'Lead Counsel':
        return 'bg-purple-100 text-purple-800';
      case 'Co-Counsel':
      case 'Associate':
        return 'bg-blue-100 text-blue-800';
      case 'Paralegal':
        return 'bg-green-100 text-green-800';
      case 'Legal Assistant':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    if (utilization >= 50) return 'text-green-600';
    return 'text-blue-600';
  };

  const getUtilizationBarColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 70) return 'bg-yellow-500';
    if (utilization >= 50) return 'bg-green-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Case Team</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowWorkload(!showWorkload)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showWorkload
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showWorkload ? 'Hide Workload' : 'Show Workload'}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Member
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {team.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No team members assigned to this case yet.</p>
          </div>
        ) : (
          team.map((member) => {
            const memberWorkload = workload.find(w => w.userId === member.userId);

            return (
              <div
                key={member.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                  {member.isActive ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Active
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Inactive</span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${member.email}`} className="hover:text-blue-600">
                        {member.email}
                      </a>
                    </div>
                  )}

                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${member.phone}`} className="hover:text-blue-600">
                        {member.phone}
                      </a>
                    </div>
                  )}

                  {member.assignedDate && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Assigned: {new Date(member.assignedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Workload Metrics */}
                {showWorkload && memberWorkload && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Utilization</span>
                        <span className={`font-semibold ${getUtilizationColor(memberWorkload.utilization)}`}>
                          {memberWorkload.utilization}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getUtilizationBarColor(memberWorkload.utilization)}`}
                          style={{ width: `${Math.min(memberWorkload.utilization, 100)}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                        <div>
                          <div className="font-medium text-gray-900">{memberWorkload.totalCases}</div>
                          <div>Total Cases</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{memberWorkload.leadCases}</div>
                          <div>Lead Cases</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{memberWorkload.activeCases}</div>
                          <div>Active</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{memberWorkload.supportCases}</div>
                          <div>Support</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CaseTeam;
