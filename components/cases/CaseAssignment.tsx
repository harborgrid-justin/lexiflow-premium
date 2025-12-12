import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Select,
  Progress,
  Tag,
  Avatar,
  Tooltip,
  Alert,
  Space,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';

const { Option } = Select;

interface AttorneyProfile {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  caseLoad: number;
  maxCaseLoad: number;
  experienceYears: number;
  successRate: number;
  practiceAreas: string[];
  jurisdiction: string[];
  performance: {
    averageResolutionTime: number;
    clientSatisfaction: number;
    winRate: number;
  };
  availability: {
    isAvailable: boolean;
    nextAvailableDate?: string;
  };
}

interface AssignmentScore {
  attorneyId: string;
  attorneyName: string;
  totalScore: number;
  breakdown: {
    specializationScore: number;
    workloadScore: number;
    experienceScore: number;
    performanceScore: number;
    availabilityScore: number;
    jurisdictionScore: number;
  };
  recommended: boolean;
  reason: string;
}

interface CaseAssignmentProps {
  caseId: string;
  caseType: string;
  jurisdiction?: string;
  onAssignmentComplete?: (attorneyId: string) => void;
}

const CaseAssignment: React.FC<CaseAssignmentProps> = ({
  caseId,
  caseType,
  jurisdiction,
  onAssignmentComplete,
}) => {
  const [attorneys, setAttorneys] = useState<AttorneyProfile[]>([]);
  const [assignmentScores, setAssignmentScores] = useState<AssignmentScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedAttorney, setSelectedAttorney] = useState<string | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'smart' | 'manual' | 'round-robin'>('smart');

  useEffect(() => {
    loadAttorneys();
  }, []);

  useEffect(() => {
    if (attorneys.length > 0 && assignmentMode === 'smart') {
      calculateAssignmentScores();
    }
  }, [attorneys, assignmentMode, caseType, jurisdiction]);

  const loadAttorneys = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with actual API
      // const response = await caseAssignmentService.getAvailableAttorneys();
      const mockAttorneys: AttorneyProfile[] = [
        {
          id: 'att-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          specializations: ['Civil Litigation', 'Contract Law'],
          caseLoad: 12,
          maxCaseLoad: 20,
          experienceYears: 15,
          successRate: 0.92,
          practiceAreas: ['Civil', 'Corporate'],
          jurisdiction: ['California', 'Federal'],
          performance: {
            averageResolutionTime: 180,
            clientSatisfaction: 0.95,
            winRate: 0.88,
          },
          availability: {
            isAvailable: true,
          },
        },
        {
          id: 'att-2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          specializations: ['Family Law', 'Divorce'],
          caseLoad: 8,
          maxCaseLoad: 15,
          experienceYears: 10,
          successRate: 0.89,
          practiceAreas: ['Family', 'Civil'],
          jurisdiction: ['California'],
          performance: {
            averageResolutionTime: 150,
            clientSatisfaction: 0.93,
            winRate: 0.85,
          },
          availability: {
            isAvailable: true,
          },
        },
        {
          id: 'att-3',
          name: 'Robert Johnson',
          email: 'robert.j@example.com',
          specializations: ['Criminal Defense', 'DUI'],
          caseLoad: 18,
          maxCaseLoad: 20,
          experienceYears: 20,
          successRate: 0.94,
          practiceAreas: ['Criminal'],
          jurisdiction: ['California', 'Nevada'],
          performance: {
            averageResolutionTime: 200,
            clientSatisfaction: 0.91,
            winRate: 0.90,
          },
          availability: {
            isAvailable: false,
            nextAvailableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      ];
      setAttorneys(mockAttorneys);
    } catch (error) {
      console.error('Error loading attorneys:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAssignmentScores = async () => {
    try {
      // TODO: Integrate with actual API
      // const response = await caseAssignmentService.calculateScores(caseId, criteria);
      const mockScores: AssignmentScore[] = attorneys.map((attorney, index) => ({
        attorneyId: attorney.id,
        attorneyName: attorney.name,
        totalScore: [95, 87, 72][index] || 60,
        breakdown: {
          specializationScore: [90, 75, 60][index] || 50,
          workloadScore: [85, 95, 55][index] || 60,
          experienceScore: [95, 80, 100][index] || 70,
          performanceScore: [92, 89, 94][index] || 80,
          availabilityScore: [100, 100, 10][index] || 50,
          jurisdictionScore: [100, 100, 100][index] || 80,
        },
        recommended: index < 3,
        reason: [
          'Strong specialization match, Optimal workload capacity, Highly experienced',
          'Good match, Excellent availability, Strong performance',
          'Experienced attorney, but currently at capacity',
        ][index] || 'Adequate match',
      }));
      setAssignmentScores(mockScores);
    } catch (error) {
      console.error('Error calculating scores:', error);
    }
  };

  const handleAssignment = async () => {
    if (!selectedAttorney) return;

    try {
      // TODO: Integrate with actual API
      // await caseAssignmentService.assignCase(caseId, selectedAttorney);
      if (onAssignmentComplete) {
        onAssignmentComplete(selectedAttorney);
      }
      setAssignModalVisible(false);
      Modal.success({
        title: 'Case Assigned Successfully',
        content: `Case has been assigned to ${attorneys.find((a) => a.id === selectedAttorney)?.name}`,
      });
    } catch (error) {
      console.error('Error assigning case:', error);
      Modal.error({
        title: 'Assignment Failed',
        content: 'Failed to assign the case. Please try again.',
      });
    }
  };

  const columns = [
    {
      title: 'Attorney',
      dataIndex: 'attorneyName',
      key: 'attorney',
      render: (name: string, record: AssignmentScore) => {
        const attorney = attorneys.find((a) => a.id === record.attorneyId);
        return (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <div>{name}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{attorney?.email}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Match Score',
      dataIndex: 'totalScore',
      key: 'score',
      sorter: (a: AssignmentScore, b: AssignmentScore) => b.totalScore - a.totalScore,
      render: (score: number, record: AssignmentScore) => (
        <div>
          <Progress
            percent={score}
            size="small"
            status={score >= 80 ? 'success' : score >= 60 ? 'normal' : 'exception'}
          />
          {record.recommended && (
            <Tag color="gold" style={{ marginTop: 4 }}>
              <TrophyOutlined /> Recommended
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Workload',
      key: 'workload',
      render: (_: any, record: AssignmentScore) => {
        const attorney = attorneys.find((a) => a.id === record.attorneyId);
        if (!attorney) return '-';
        const percentage = (attorney.caseLoad / attorney.maxCaseLoad) * 100;
        return (
          <Tooltip title={`${attorney.caseLoad} / ${attorney.maxCaseLoad} cases`}>
            <Progress
              percent={percentage}
              size="small"
              status={percentage > 90 ? 'exception' : percentage > 75 ? 'normal' : 'success'}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Experience',
      key: 'experience',
      render: (_: any, record: AssignmentScore) => {
        const attorney = attorneys.find((a) => a.id === record.attorneyId);
        if (!attorney) return '-';
        return (
          <div>
            <div>{attorney.experienceYears} years</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              Win Rate: {(attorney.performance.winRate * 100).toFixed(0)}%
            </div>
          </div>
        );
      },
    },
    {
      title: 'Availability',
      key: 'availability',
      render: (_: any, record: AssignmentScore) => {
        const attorney = attorneys.find((a) => a.id === record.attorneyId);
        if (!attorney) return '-';
        return attorney.availability.isAvailable ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Available
          </Tag>
        ) : (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            {attorney.availability.nextAvailableDate
              ? `Available ${new Date(attorney.availability.nextAvailableDate).toLocaleDateString()}`
              : 'Unavailable'}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: AssignmentScore) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedAttorney(record.attorneyId);
            setAssignModalVisible(true);
          }}
        >
          Assign
        </Button>
      ),
    },
  ];

  return (
    <div className="case-assignment">
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Attorney Assignment</span>
          </Space>
        }
        extra={
          <Select value={assignmentMode} onChange={setAssignmentMode} style={{ width: 150 }}>
            <Option value="smart">Smart Match</Option>
            <Option value="manual">Manual</Option>
            <Option value="round-robin">Round Robin</Option>
          </Select>
        }
      >
        {assignmentMode === 'smart' && assignmentScores.length > 0 && (
          <Alert
            message="Smart Assignment Recommendations"
            description="Attorneys are ranked based on specialization, workload, experience, performance, and availability."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Available Attorneys"
                value={attorneys.filter((a) => a.availability.isAvailable).length}
                suffix={`/ ${attorneys.length}`}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Average Workload"
                value={
                  attorneys.length > 0
                    ? Math.round(
                        (attorneys.reduce((sum, a) => sum + (a.caseLoad / a.maxCaseLoad) * 100, 0) /
                          attorneys.length)
                      )
                    : 0
                }
                suffix="%"
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Recommended Matches"
                value={assignmentScores.filter((s) => s.recommended).length}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Overloaded"
                value={attorneys.filter((a) => (a.caseLoad / a.maxCaseLoad) > 0.9).length}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={assignmentScores}
          loading={loading}
          rowKey="attorneyId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Confirm Assignment"
        open={assignModalVisible}
        onOk={handleAssignment}
        onCancel={() => setAssignModalVisible(false)}
        okText="Assign Case"
      >
        {selectedAttorney && (
          <div>
            <p>
              Are you sure you want to assign this case to{' '}
              <strong>{attorneys.find((a) => a.id === selectedAttorney)?.name}</strong>?
            </p>
            {assignmentScores.find((s) => s.attorneyId === selectedAttorney)?.reason && (
              <Alert
                message="Match Reason"
                description={assignmentScores.find((s) => s.attorneyId === selectedAttorney)?.reason}
                type="info"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>

      <style jsx>{`
        .case-assignment {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CaseAssignment;
