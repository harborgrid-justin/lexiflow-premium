import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Steps, Tooltip, Alert, Spin } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'failed' | 'skipped' | 'blocked';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  assignee?: string;
  errorMessage?: string;
}

interface WorkflowInstance {
  id: string;
  workflowName: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStepId?: string;
  currentStepName?: string;
  startedAt?: string;
  completedAt?: string;
  executionTimeMs?: number;
  completedSteps: number;
  totalSteps: number;
  executionHistory?: WorkflowStep[];
}

interface CaseWorkflowProps {
  caseId: string;
  onWorkflowAction?: (action: string, workflowId: string) => void;
}

const CaseWorkflow: React.FC<CaseWorkflowProps> = ({ caseId, onWorkflowAction }) => {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, [caseId]);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with actual API
      // const response = await caseWorkflowService.getWorkflowsByCaseId(caseId);
      const mockWorkflows: WorkflowInstance[] = [
        {
          id: 'wf-1',
          workflowName: 'Case Initiation Workflow',
          status: 'active',
          currentStepId: 'step-2',
          currentStepName: 'Document Review',
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completedSteps: 2,
          totalSteps: 5,
          executionHistory: [
            {
              id: 'step-1',
              name: 'Initial Assessment',
              type: 'task',
              status: 'completed',
              startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
              duration: 43200000,
              assignee: 'John Doe',
            },
            {
              id: 'step-2',
              name: 'Document Review',
              type: 'task',
              status: 'in_progress',
              startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              assignee: 'Jane Smith',
            },
            {
              id: 'step-3',
              name: 'Legal Analysis',
              type: 'task',
              status: 'pending',
            },
            {
              id: 'step-4',
              name: 'Client Notification',
              type: 'notification',
              status: 'pending',
            },
            {
              id: 'step-5',
              name: 'Complete',
              type: 'end',
              status: 'pending',
            },
          ],
        },
      ];
      setWorkflows(mockWorkflows);
      if (mockWorkflows.length > 0) {
        setSelectedWorkflow(mockWorkflows[0]);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: WorkflowInstance['status']) => {
    const colors = {
      draft: 'default',
      active: 'processing',
      paused: 'warning',
      completed: 'success',
      failed: 'error',
      cancelled: 'default',
    };
    return colors[status] || 'default';
  };

  const getStepStatus = (stepStatus: WorkflowStep['status']) => {
    const statusMap = {
      pending: 'wait',
      ready: 'wait',
      in_progress: 'process',
      completed: 'finish',
      failed: 'error',
      skipped: 'finish',
      blocked: 'wait',
    };
    return statusMap[stepStatus] || 'wait';
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') return <CheckCircleOutlined />;
    if (step.status === 'failed') return <CloseCircleOutlined />;
    if (step.status === 'in_progress') return <PlayCircleOutlined />;
    if (step.status === 'blocked') return <ClockCircleOutlined />;
    return <InfoCircleOutlined />;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleWorkflowAction = (action: string, workflowId: string) => {
    if (onWorkflowAction) {
      onWorkflowAction(action, workflowId);
    }
    // Reload workflows after action
    setTimeout(() => loadWorkflows(), 1000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="case-workflow">
      <Card
        title="Active Workflows"
        extra={
          <Button type="primary" onClick={() => handleWorkflowAction('start', 'new')}>
            Start New Workflow
          </Button>
        }
      >
        {workflows.length === 0 ? (
          <Alert
            message="No Active Workflows"
            description="There are no workflows running for this case."
            type="info"
            showIcon
          />
        ) : (
          workflows.map((workflow) => (
            <Card
              key={workflow.id}
              style={{ marginBottom: 16 }}
              type="inner"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>{workflow.workflowName}</span>
                  <Badge status={getStatusColor(workflow.status) as any} text={workflow.status} />
                </div>
              }
              extra={
                <div style={{ display: 'flex', gap: 8 }}>
                  {workflow.status === 'active' && (
                    <Button
                      size="small"
                      icon={<PauseCircleOutlined />}
                      onClick={() => handleWorkflowAction('pause', workflow.id)}
                    >
                      Pause
                    </Button>
                  )}
                  {workflow.status === 'paused' && (
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleWorkflowAction('resume', workflow.id)}
                    >
                      Resume
                    </Button>
                  )}
                  <Button
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleWorkflowAction('cancel', workflow.id)}
                  >
                    Cancel
                  </Button>
                </div>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>
                    <strong>Progress:</strong> {workflow.completedSteps} / {workflow.totalSteps} steps
                  </span>
                  <span>
                    <strong>Duration:</strong> {formatDuration(workflow.executionTimeMs)}
                  </span>
                </div>
                {workflow.currentStepName && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Current Step:</strong> {workflow.currentStepName}
                  </div>
                )}
              </div>

              <Steps
                current={workflow.completedSteps}
                size="small"
                items={
                  workflow.executionHistory?.map((step) => ({
                    title: step.name,
                    status: getStepStatus(step.status),
                    icon: getStepIcon(step),
                    description: (
                      <div style={{ fontSize: 12 }}>
                        {step.assignee && <div>Assignee: {step.assignee}</div>}
                        {step.status === 'completed' && step.duration && (
                          <div>Duration: {formatDuration(step.duration)}</div>
                        )}
                        {step.status === 'failed' && step.errorMessage && (
                          <div style={{ color: 'red' }}>Error: {step.errorMessage}</div>
                        )}
                      </div>
                    ),
                  })) || []
                }
              />

              {workflow.status === 'failed' && (
                <Alert
                  message="Workflow Failed"
                  description="This workflow encountered an error and failed to complete."
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}

              {workflow.status === 'completed' && (
                <Alert
                  message="Workflow Completed"
                  description={`Successfully completed on ${new Date(workflow.completedAt!).toLocaleString()}`}
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          ))
        )}
      </Card>

      <style jsx>{`
        .case-workflow {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CaseWorkflow;
