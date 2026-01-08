import React, { useState, useEffect } from 'react';
import { WorkflowExecution, ExecutionStatus, StepHistory } from './types';

/**
 * WorkflowMonitor Component
 * Real-time monitoring of workflow executions
 */
export const WorkflowMonitor: React.FC<{ workflowId?: string }> = ({ workflowId }) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadExecutions();

    // Auto-refresh every 5 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(loadExecutions, 5000);
      return () => clearInterval(interval);
    }
  }, [workflowId, autoRefresh]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch(`/api/workflows/${workflowId}/executions`);
      // setExecutions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load executions:', error);
      setLoading(false);
    }
  };

  const handlePauseExecution = async (executionId: string) => {
    try {
      // await fetch(`/api/executions/${executionId}/pause`, { method: 'POST' });
      loadExecutions();
    } catch (error) {
      console.error('Failed to pause execution:', error);
    }
  };

  const handleResumeExecution = async (executionId: string) => {
    try {
      // await fetch(`/api/executions/${executionId}/resume`, { method: 'POST' });
      loadExecutions();
    } catch (error) {
      console.error('Failed to resume execution:', error);
    }
  };

  const handleCancelExecution = async (executionId: string) => {
    if (confirm('Are you sure you want to cancel this execution?')) {
      try {
        // await fetch(`/api/executions/${executionId}/cancel`, { method: 'POST' });
        loadExecutions();
      } catch (error) {
        console.error('Failed to cancel execution:', error);
      }
    }
  };

  const getStatusColor = (status: ExecutionStatus) => {
    const colors = {
      [ExecutionStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [ExecutionStatus.RUNNING]: 'bg-blue-100 text-blue-800',
      [ExecutionStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
      [ExecutionStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [ExecutionStatus.FAILED]: 'bg-red-100 text-red-800',
      [ExecutionStatus.CANCELLED]: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Executions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage workflow execution status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={loadExecutions}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Execution List */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Executions</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading executions...
              </div>
            ) : executions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No executions found
              </div>
            ) : (
              executions.map((execution) => (
                <div
                  key={execution.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedExecution?.id === execution.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedExecution(execution)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(execution.startedAt || '').toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-900">
                      Step {execution.currentStepNumber + 1} of {execution.totalSteps}
                    </div>
                    {execution.durationSeconds && (
                      <div className="text-gray-500">
                        Duration: {formatDuration(execution.durationSeconds)}
                      </div>
                    )}
                  </div>
                  {execution.errorMessage && (
                    <div className="mt-2 text-xs text-red-600 truncate">
                      {execution.errorMessage}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Execution Details */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg">
          {!selectedExecution ? (
            <div className="p-12 text-center text-gray-500">
              Select an execution to view details
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Execution Details
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedExecution.status)}`}>
                        {selectedExecution.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      ID: {selectedExecution.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedExecution.status === ExecutionStatus.RUNNING && (
                      <>
                        <button
                          className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded"
                          onClick={() => handlePauseExecution(selectedExecution.id)}
                        >
                          Pause
                        </button>
                        <button
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          onClick={() => handleCancelExecution(selectedExecution.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {selectedExecution.status === ExecutionStatus.PAUSED && (
                      <button
                        className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                        onClick={() => handleResumeExecution(selectedExecution.id)}
                      >
                        Resume
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Progress</div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedExecution.currentStepNumber + 1} / {selectedExecution.totalSteps} steps
                    </div>
                  </div>
                  {selectedExecution.startedAt && (
                    <div>
                      <div className="text-xs text-gray-500">Started</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(selectedExecution.startedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {selectedExecution.durationSeconds && (
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDuration(selectedExecution.durationSeconds)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${(selectedExecution.currentStepNumber / selectedExecution.totalSteps) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Step History */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Step History</h4>
                {selectedExecution.stepHistory && selectedExecution.stepHistory.length > 0 ? (
                  <div className="space-y-4">
                    {selectedExecution.stepHistory.map((step, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{step.stepName}</div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            step.status === 'completed' ? 'bg-green-100 text-green-800' :
                            step.status === 'failed' ? 'bg-red-100 text-red-800' :
                            step.status === 'skipped' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Started: {new Date(step.startedAt).toLocaleString()}</div>
                          {step.completedAt && (
                            <div>Completed: {new Date(step.completedAt).toLocaleString()}</div>
                          )}
                        </div>
                        {step.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            {step.error}
                          </div>
                        )}
                        {step.output && (
                          <div className="mt-2">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                                View Output
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No step history available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowMonitor;
