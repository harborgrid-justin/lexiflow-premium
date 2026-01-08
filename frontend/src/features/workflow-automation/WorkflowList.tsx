import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowStatus } from './types';

/**
 * WorkflowList Component
 * Displays list of workflows with filtering and search
 */
export const WorkflowList: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status?: WorkflowStatus;
    search?: string;
    category?: string;
  }>({});

  useEffect(() => {
    loadWorkflows();
  }, [filter]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch('/api/workflows', { params: filter });
      // setWorkflows(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (workflowId: string, active: boolean) => {
    try {
      // API call to update workflow status
      // await fetch(`/api/workflows/${workflowId}`, { method: 'PATCH', body: { active } });
      loadWorkflows();
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  };

  const handleDelete = async (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        // API call to delete workflow
        // await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' });
        loadWorkflows();
      } catch (error) {
        console.error('Failed to delete workflow:', error);
      }
    }
  };

  const getStatusColor = (status: WorkflowStatus) => {
    const colors = {
      [WorkflowStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [WorkflowStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [WorkflowStatus.INACTIVE]: 'bg-yellow-100 text-yellow-800',
      [WorkflowStatus.ARCHIVED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and monitor your automated workflows
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search workflows..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-2"
          value={filter.search || ''}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
        <select
          className="rounded-md border border-gray-300 px-4 py-2"
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value as WorkflowStatus })}
        >
          <option value="">All Statuses</option>
          <option value={WorkflowStatus.ACTIVE}>Active</option>
          <option value={WorkflowStatus.DRAFT}>Draft</option>
          <option value={WorkflowStatus.INACTIVE}>Inactive</option>
          <option value={WorkflowStatus.ARCHIVED}>Archived</option>
        </select>
        <button
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          onClick={() => window.location.href = '/workflows/new'}
        >
          Create Workflow
        </button>
      </div>

      {/* Workflow List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading workflows...</p>
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No workflows found</p>
          <button
            className="mt-4 text-blue-600 hover:text-blue-700"
            onClick={() => window.location.href = '/workflows/templates'}
          >
            Browse Templates
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                    {workflow.active && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Active
                      </span>
                    )}
                  </div>
                  {workflow.description && (
                    <p className="mt-2 text-sm text-gray-600">{workflow.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                    <span>Trigger: {workflow.trigger}</span>
                    <span>Executions: {workflow.executionCount}</span>
                    {workflow.successRate !== undefined && (
                      <span>Success Rate: {workflow.successRate.toFixed(1)}%</span>
                    )}
                    {workflow.avgExecutionTime !== undefined && (
                      <span>Avg Time: {workflow.avgExecutionTime.toFixed(1)}s</span>
                    )}
                  </div>
                  {workflow.tags && workflow.tags.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {workflow.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    onClick={() => window.location.href = `/workflows/${workflow.id}`}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                    onClick={() => window.location.href = `/workflows/${workflow.id}/executions`}
                  >
                    Monitor
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded ${
                      workflow.active
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    onClick={() => handleStatusChange(workflow.id, !workflow.active)}
                  >
                    {workflow.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    onClick={() => handleDelete(workflow.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowList;
