import React, { useState, useCallback } from 'react';
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Form,
  Space,
  Drawer,
  List,
  Tag,
  Alert,
  message,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'parallel' | 'wait' | 'notification' | 'script' | 'end';
  name: string;
  description?: string;
  config?: Record<string, any>;
  position: { x: number; y: number };
  nextNodeId?: string;
  branches?: Array<{ condition: string; nextNodeId: string; label: string }>;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  status: 'draft' | 'active' | 'archived';
}

interface WorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflow: WorkflowDefinition) => void;
  onTest?: (workflow: WorkflowDefinition) => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ workflowId, onSave, onTest }) => {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>({
    id: workflowId || `workflow-${Date.now()}`,
    name: 'New Workflow',
    description: '',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        name: 'Start',
        position: { x: 100, y: 100 },
      },
    ],
    status: 'draft',
  });

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [configDrawerVisible, setConfigDrawerVisible] = useState(false);
  const [nodeLibraryVisible, setNodeLibraryVisible] = useState(false);

  const nodeTypes = [
    {
      type: 'start',
      label: 'Start',
      icon: <PlayCircleOutlined />,
      description: 'Entry point of the workflow',
      color: '#52c41a',
    },
    {
      type: 'task',
      label: 'Task',
      icon: <NodeIndexOutlined />,
      description: 'Manual task requiring user action',
      color: '#1890ff',
    },
    {
      type: 'decision',
      label: 'Decision',
      icon: <NodeIndexOutlined />,
      description: 'Conditional branching based on criteria',
      color: '#faad14',
    },
    {
      type: 'parallel',
      label: 'Parallel',
      icon: <NodeIndexOutlined />,
      description: 'Execute multiple branches in parallel',
      color: '#722ed1',
    },
    {
      type: 'wait',
      label: 'Wait',
      icon: <NodeIndexOutlined />,
      description: 'Pause workflow until event or time',
      color: '#eb2f96',
    },
    {
      type: 'notification',
      label: 'Notification',
      icon: <NodeIndexOutlined />,
      description: 'Send notification to users',
      color: '#13c2c2',
    },
    {
      type: 'script',
      label: 'Script',
      icon: <NodeIndexOutlined />,
      description: 'Execute custom script',
      color: '#fa8c16',
    },
    {
      type: 'end',
      label: 'End',
      icon: <NodeIndexOutlined />,
      description: 'Workflow completion',
      color: '#f5222d',
    },
  ];

  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: { x: 100 + workflow.nodes.length * 50, y: 200 + workflow.nodes.length * 50 },
      config: {},
    };

    setWorkflow({
      ...workflow,
      nodes: [...workflow.nodes, newNode],
    });

    setNodeLibraryVisible(false);
    message.success(`${type} node added`);
  };

  const deleteNode = (nodeId: string) => {
    setWorkflow({
      ...workflow,
      nodes: workflow.nodes.filter((n) => n.id !== nodeId),
    });
    setSelectedNode(null);
    setConfigDrawerVisible(false);
    message.success('Node deleted');
  };

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflow({
      ...workflow,
      nodes: workflow.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    });
  };

  const handleSave = () => {
    // Validation
    if (workflow.nodes.length === 0) {
      message.error('Workflow must have at least one node');
      return;
    }

    const hasStart = workflow.nodes.some((n) => n.type === 'start');
    const hasEnd = workflow.nodes.some((n) => n.type === 'end');

    if (!hasStart) {
      message.error('Workflow must have a start node');
      return;
    }

    if (!hasEnd) {
      message.warning('Workflow should have an end node');
    }

    if (onSave) {
      onSave(workflow);
      message.success('Workflow saved successfully');
    }
  };

  const handleTest = () => {
    if (onTest) {
      onTest(workflow);
      message.info('Testing workflow...');
    }
  };

  const renderNodeConfig = (node: WorkflowNode) => {
    switch (node.type) {
      case 'task':
        return (
          <>
            <Form.Item label="Assignee Type">
              <Select
                value={node.config?.assigneeType || 'user'}
                onChange={(value) => updateNode(node.id, { config: { ...node.config, assigneeType: value } })}
              >
                <Option value="user">Specific User</Option>
                <Option value="role">Role-based</Option>
                <Option value="dynamic">Dynamic</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Due In (Days)">
              <Input
                type="number"
                value={node.config?.dueInDays || 7}
                onChange={(e) =>
                  updateNode(node.id, { config: { ...node.config, dueInDays: parseInt(e.target.value) } })
                }
              />
            </Form.Item>
            <Form.Item label="Priority">
              <Select
                value={node.config?.priority || 'medium'}
                onChange={(value) => updateNode(node.id, { config: { ...node.config, priority: value } })}
              >
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="urgent">Urgent</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 'decision':
        return (
          <>
            <Form.Item label="Decision Variable">
              <Input
                value={node.config?.decisionVariable || ''}
                onChange={(e) =>
                  updateNode(node.id, { config: { ...node.config, decisionVariable: e.target.value } })
                }
                placeholder="e.g., caseValue"
              />
            </Form.Item>
            <Alert
              message="Decision Branches"
              description="Define conditions for each branch in the workflow"
              type="info"
              style={{ marginBottom: 12 }}
            />
          </>
        );

      case 'wait':
        return (
          <>
            <Form.Item label="Wait Type">
              <Select
                value={node.config?.waitType || 'time'}
                onChange={(value) => updateNode(node.id, { config: { ...node.config, waitType: value } })}
              >
                <Option value="time">Time Duration</Option>
                <Option value="event">External Event</Option>
                <Option value="condition">Condition</Option>
              </Select>
            </Form.Item>
            {node.config?.waitType === 'time' && (
              <Form.Item label="Duration (milliseconds)">
                <Input
                  type="number"
                  value={node.config?.waitDuration || 3600000}
                  onChange={(e) =>
                    updateNode(node.id, { config: { ...node.config, waitDuration: parseInt(e.target.value) } })
                  }
                />
              </Form.Item>
            )}
          </>
        );

      case 'notification':
        return (
          <>
            <Form.Item label="Notification Channel">
              <Select
                value={node.config?.channel || 'email'}
                onChange={(value) => updateNode(node.id, { config: { ...node.config, channel: value } })}
              >
                <Option value="email">Email</Option>
                <Option value="sms">SMS</Option>
                <Option value="push">Push Notification</Option>
                <Option value="in-app">In-App</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Template">
              <Input
                value={node.config?.notificationTemplate || ''}
                onChange={(e) =>
                  updateNode(node.id, { config: { ...node.config, notificationTemplate: e.target.value } })
                }
                placeholder="Template name or ID"
              />
            </Form.Item>
          </>
        );

      case 'script':
        return (
          <>
            <Form.Item label="Script Language">
              <Select
                value={node.config?.scriptLanguage || 'javascript'}
                onChange={(value) =>
                  updateNode(node.id, { config: { ...node.config, scriptLanguage: value } })
                }
              >
                <Option value="javascript">JavaScript</Option>
                <Option value="python">Python</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Script Code">
              <TextArea
                rows={6}
                value={node.config?.scriptCode || ''}
                onChange={(e) =>
                  updateNode(node.id, { config: { ...node.config, scriptCode: e.target.value } })
                }
                placeholder="Enter script code..."
              />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="workflow-builder">
      <Card
        title={
          <Input
            value={workflow.name}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
            bordered={false}
            style={{ fontWeight: 'bold', fontSize: 18 }}
          />
        }
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => setNodeLibraryVisible(true)}>
              Add Node
            </Button>
            <Button icon={<PlayCircleOutlined />} onClick={handleTest}>
              Test
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <TextArea
            rows={2}
            value={workflow.description}
            onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
            placeholder="Workflow description..."
          />
        </div>

        <Alert
          message="Workflow Canvas"
          description="Click on nodes to configure them. Drag to rearrange. This is a simplified visual representation - full drag-and-drop functionality would require a library like React Flow."
          type="info"
          style={{ marginBottom: 16 }}
        />

        <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 16, minHeight: 400 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {workflow.nodes.map((node, index) => {
              const nodeType = nodeTypes.find((nt) => nt.type === node.type);
              return (
                <Card
                  key={node.id}
                  size="small"
                  hoverable
                  onClick={() => {
                    setSelectedNode(node);
                    setConfigDrawerVisible(true);
                  }}
                  style={{
                    borderLeft: `4px solid ${nodeType?.color || '#ccc'}`,
                    cursor: 'pointer',
                  }}
                  extra={
                    node.type !== 'start' && (
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                      />
                    )
                  }
                >
                  <Space>
                    {nodeType?.icon}
                    <strong>{node.name}</strong>
                    <Tag color={nodeType?.color}>{node.type}</Tag>
                  </Space>
                  {node.description && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{node.description}</div>
                  )}
                </Card>
              );
            })}
          </Space>
        </div>
      </Card>

      {/* Node Library Drawer */}
      <Drawer
        title="Node Library"
        placement="right"
        width={400}
        onClose={() => setNodeLibraryVisible(false)}
        open={nodeLibraryVisible}
      >
        <List
          dataSource={nodeTypes}
          renderItem={(nodeType) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => addNode(nodeType.type as WorkflowNode['type'])}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: nodeType.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {nodeType.icon}
                  </div>
                }
                title={nodeType.label}
                description={nodeType.description}
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* Node Configuration Drawer */}
      <Drawer
        title={
          <Space>
            <SettingOutlined />
            <span>Configure Node</span>
          </Space>
        }
        placement="right"
        width={500}
        onClose={() => setConfigDrawerVisible(false)}
        open={configDrawerVisible}
      >
        {selectedNode && (
          <Form layout="vertical">
            <Form.Item label="Node Name">
              <Input
                value={selectedNode.name}
                onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Description">
              <TextArea
                rows={3}
                value={selectedNode.description || ''}
                onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
              />
            </Form.Item>

            {renderNodeConfig(selectedNode)}

            <Form.Item label="Next Node">
              <Select
                value={selectedNode.nextNodeId}
                onChange={(value) => updateNode(selectedNode.id, { nextNodeId: value })}
                allowClear
                placeholder="Select next node"
              >
                {workflow.nodes
                  .filter((n) => n.id !== selectedNode.id)
                  .map((n) => (
                    <Option key={n.id} value={n.id}>
                      {n.name} ({n.type})
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Form>
        )}
      </Drawer>

      <style jsx>{`
        .workflow-builder {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default WorkflowBuilder;
