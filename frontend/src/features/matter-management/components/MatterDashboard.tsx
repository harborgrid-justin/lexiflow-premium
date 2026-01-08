import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FolderOpen,
  Search,
  Filter,
  Plus,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Matter,
  MatterStatus,
  MatterType,
  MatterPriority,
  MatterWithDetails,
} from '../types';

interface MatterDashboardProps {
  onMatterSelect?: (matterId: string) => void;
  onCreateMatter?: () => void;
}

export const MatterDashboard: React.FC<MatterDashboardProps> = ({
  onMatterSelect,
  onCreateMatter,
}) => {
  const [matters, setMatters] = useState<MatterWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Statistics
  const [statistics, setStatistics] = useState({
    totalMatters: 0,
    activeMatters: 0,
    onHoldMatters: 0,
    closedMatters: 0,
    totalValue: 0,
    averageMatterAge: 0,
  });

  useEffect(() => {
    loadMatters();
    loadStatistics();
  }, [statusFilter, typeFilter, priorityFilter, searchQuery]);

  const loadMatters = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch('/api/matters', { ... });
      // const data = await response.json();
      // setMatters(data.matters);

      // Mock data for demonstration
      setMatters([
        {
          id: '1',
          matterNumber: 'MAT-2026-0001',
          title: 'Smith v. Johnson - Contract Dispute',
          description: 'Breach of contract dispute',
          status: MatterStatus.ACTIVE,
          matterType: MatterType.LITIGATION,
          priority: MatterPriority.HIGH,
          clientName: 'Smith Corp',
          leadAttorneyName: 'Jane Doe',
          practiceArea: 'Commercial Litigation',
          estimatedValue: 500000,
          openedDate: new Date('2026-01-01'),
          conflictCheckCompleted: true,
          createdBy: 'user-1',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-08'),
          caseCount: 1,
          activeDeadlines: 3,
          conflictStatus: 'cleared' as const,
          relatedMattersCount: 0,
        },
      ]);
    } catch (error) {
      console.error('Failed to load matters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // API call would go here
      setStatistics({
        totalMatters: 45,
        activeMatters: 32,
        onHoldMatters: 5,
        closedMatters: 8,
        totalValue: 12500000,
        averageMatterAge: 127,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const getStatusBadgeColor = (status: MatterStatus) => {
    switch (status) {
      case MatterStatus.ACTIVE:
        return 'bg-green-500';
      case MatterStatus.PENDING:
        return 'bg-yellow-500';
      case MatterStatus.ON_HOLD:
        return 'bg-orange-500';
      case MatterStatus.CLOSED:
        return 'bg-gray-500';
      case MatterStatus.ARCHIVED:
        return 'bg-gray-400';
      case MatterStatus.INTAKE:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBadgeColor = (priority: MatterPriority) => {
    switch (priority) {
      case MatterPriority.URGENT:
        return 'bg-red-500';
      case MatterPriority.HIGH:
        return 'bg-orange-500';
      case MatterPriority.MEDIUM:
        return 'bg-yellow-500';
      case MatterPriority.LOW:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matter Management</h1>
          <p className="text-muted-foreground">
            Manage and track all legal matters
          </p>
        </div>
        <Button onClick={onCreateMatter}>
          <Plus className="mr-2 h-4 w-4" />
          New Matter
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matters</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalMatters}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.activeMatters} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all active matters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Matter Age
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.averageMatterAge} days
            </div>
            <p className="text-xs text-muted-foreground">
              For active matters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.onHoldMatters}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter matters by status, type, and priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search matters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={MatterStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={MatterStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={MatterStatus.ON_HOLD}>On Hold</SelectItem>
                <SelectItem value={MatterStatus.CLOSED}>Closed</SelectItem>
                <SelectItem value={MatterStatus.INTAKE}>Intake</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={MatterType.LITIGATION}>Litigation</SelectItem>
                <SelectItem value={MatterType.TRANSACTIONAL}>
                  Transactional
                </SelectItem>
                <SelectItem value={MatterType.ADVISORY}>Advisory</SelectItem>
                <SelectItem value={MatterType.CORPORATE}>Corporate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value={MatterPriority.URGENT}>Urgent</SelectItem>
                <SelectItem value={MatterPriority.HIGH}>High</SelectItem>
                <SelectItem value={MatterPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={MatterPriority.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Matters</CardTitle>
          <CardDescription>
            {matters.length} matter{matters.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matter Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Attorney</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Deadlines</TableHead>
                <TableHead>Conflicts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Loading matters...
                  </TableCell>
                </TableRow>
              ) : matters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No matters found
                  </TableCell>
                </TableRow>
              ) : (
                matters.map((matter) => (
                  <TableRow
                    key={matter.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onMatterSelect?.(matter.id)}
                  >
                    <TableCell className="font-medium">
                      {matter.matterNumber}
                    </TableCell>
                    <TableCell>{matter.title}</TableCell>
                    <TableCell>{matter.clientName || '-'}</TableCell>
                    <TableCell>{matter.leadAttorneyName || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(matter.status)}>
                        {matter.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadgeColor(matter.priority)}>
                        {matter.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(matter.estimatedValue)}</TableCell>
                    <TableCell>
                      {matter.activeDeadlines ? (
                        <span className="text-orange-600 font-medium">
                          {matter.activeDeadlines} active
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {matter.conflictStatus === 'cleared' && (
                        <Badge className="bg-green-500">Cleared</Badge>
                      )}
                      {matter.conflictStatus === 'pending' && (
                        <Badge className="bg-yellow-500">Pending</Badge>
                      )}
                      {matter.conflictStatus === 'issues' && (
                        <Badge className="bg-red-500">Issues</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatterDashboard;
