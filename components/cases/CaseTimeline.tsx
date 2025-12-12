import React, { useState, useEffect } from 'react';
import { Timeline, Card, Tag, Avatar, Input, Select, DatePicker, Button, Empty, Spin } from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description?: string;
  userId?: string;
  userName?: string;
  eventDate: string;
  metadata?: Record<string, any>;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

interface CaseTimelineProps {
  caseId: string;
  onEventClick?: (event: TimelineEvent) => void;
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ caseId, onEventClick }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  useEffect(() => {
    loadTimelineEvents();
  }, [caseId]);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, eventTypeFilter, dateRange]);

  const loadTimelineEvents = async () => {
    setLoading(true);
    try {
      // TODO: Integrate with actual API
      // const response = await caseTimelineService.getTimelineEvents(caseId);
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          eventType: 'CASE_CREATED',
          title: 'Case Created',
          description: 'Case was created in the system',
          userId: 'user-1',
          userName: 'John Doe',
          eventDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {},
        },
        {
          id: '2',
          eventType: 'STATUS_CHANGED',
          title: 'Case status changed to Active',
          description: 'Status updated from Open to Active',
          userId: 'user-1',
          userName: 'John Doe',
          eventDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          changes: [
            { field: 'status', oldValue: 'Open', newValue: 'Active' },
          ],
        },
        {
          id: '3',
          eventType: 'TEAM_MEMBER_ASSIGNED',
          title: 'Jane Smith assigned as Associate Attorney',
          description: 'Team member Jane Smith was assigned to the case',
          userId: 'user-1',
          userName: 'John Doe',
          eventDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { memberName: 'Jane Smith', role: 'Associate Attorney' },
        },
        {
          id: '4',
          eventType: 'DOCUMENT_UPLOADED',
          title: 'Document uploaded: Complaint.pdf',
          description: 'A new pleading document was uploaded',
          userId: 'user-2',
          userName: 'Jane Smith',
          eventDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { documentName: 'Complaint.pdf', documentType: 'pleading' },
        },
        {
          id: '5',
          eventType: 'MOTION_FILED',
          title: 'Motion filed: Motion to Dismiss',
          description: 'A motion to dismiss was filed',
          userId: 'user-1',
          userName: 'John Doe',
          eventDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { motionTitle: 'Motion to Dismiss', motionType: 'MTD' },
        },
        {
          id: '6',
          eventType: 'STATUS_CHANGED',
          title: 'Case status changed to Discovery',
          description: 'Status updated from Active to Discovery',
          userId: 'user-1',
          userName: 'John Doe',
          eventDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          changes: [
            { field: 'status', oldValue: 'Active', newValue: 'Discovery' },
          ],
        },
        {
          id: '7',
          eventType: 'COMMENT_ADDED',
          title: 'Comment added',
          description: 'Discovery phase progressing well, received initial documents',
          userId: 'user-2',
          userName: 'Jane Smith',
          eventDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '8',
          eventType: 'DEADLINE_SET',
          title: 'Deadline set for Discovery completion',
          description: 'Discovery must be completed by the deadline',
          userId: 'user-1',
          userName: 'John Doe',
          eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
        },
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading timeline events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(lowerSearch) ||
          event.description?.toLowerCase().includes(lowerSearch) ||
          event.userName?.toLowerCase().includes(lowerSearch),
      );
    }

    // Event type filter
    if (eventTypeFilter && eventTypeFilter !== 'all') {
      filtered = filtered.filter((event) => event.eventType === eventTypeFilter);
    }

    // Date range filter
    if (dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter((event) => {
        const eventDate = dayjs(event.eventDate);
        return eventDate.isAfter(start) && eventDate.isBefore(end.add(1, 'day'));
      });
    }

    setFilteredEvents(filtered);
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, React.ReactNode> = {
      CASE_CREATED: <FolderOpenOutlined />,
      STATUS_CHANGED: <ClockCircleOutlined />,
      TEAM_MEMBER_ASSIGNED: <TeamOutlined />,
      DOCUMENT_UPLOADED: <FileTextOutlined />,
      MOTION_FILED: <FileTextOutlined />,
      DEADLINE_SET: <CalendarOutlined />,
      COMMENT_ADDED: <UserOutlined />,
    };
    return icons[eventType] || <ClockCircleOutlined />;
  };

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      CASE_CREATED: 'blue',
      STATUS_CHANGED: 'green',
      TEAM_MEMBER_ASSIGNED: 'purple',
      DOCUMENT_UPLOADED: 'orange',
      MOTION_FILED: 'red',
      DEADLINE_SET: 'gold',
      COMMENT_ADDED: 'cyan',
    };
    return colors[eventType] || 'gray';
  };

  const eventTypes = Array.from(new Set(events.map((e) => e.eventType)));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="case-timeline">
      <Card
        title="Case Timeline"
        extra={
          <Button icon={<FilterOutlined />} onClick={() => {/* Show filter modal */}}>
            Filters
          </Button>
        }
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Search
              placeholder="Search timeline events..."
              style={{ flex: 1, minWidth: 200 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
            <Select
              style={{ width: 200 }}
              value={eventTypeFilter}
              onChange={setEventTypeFilter}
              placeholder="Event Type"
            >
              <Option value="all">All Event Types</Option>
              {eventTypes.map((type) => (
                <Option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              style={{ width: 300 }}
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <Empty description="No timeline events found" />
        ) : (
          <Timeline
            mode="left"
            items={filteredEvents.map((event) => ({
              dot: getEventIcon(event.eventType),
              color: getEventColor(event.eventType),
              children: (
                <Card
                  size="small"
                  hoverable
                  onClick={() => onEventClick?.(event)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Tag color={getEventColor(event.eventType)}>
                          {event.eventType.replace(/_/g, ' ')}
                        </Tag>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {dayjs(event.eventDate).fromNow()}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, marginBottom: 4 }}>{event.title}</h4>
                      {event.description && (
                        <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
                          {event.description}
                        </p>
                      )}
                      {event.changes && event.changes.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {event.changes.map((change, idx) => (
                            <div key={idx} style={{ fontSize: 12 }}>
                              <strong>{change.field}:</strong>{' '}
                              <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                {change.oldValue}
                              </span>{' '}
                              → <span style={{ color: '#1890ff' }}>{change.newValue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {event.userName && (
                        <div style={{ textAlign: 'right' }}>
                          <Avatar size="small" icon={<UserOutlined />} />
                          <div style={{ fontSize: 11, marginTop: 4 }}>{event.userName}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ),
            }))}
          />
        )}
      </Card>

      <style jsx>{`
        .case-timeline {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CaseTimeline;
