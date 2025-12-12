import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Database,
  Calendar,
} from 'lucide-react';

interface RetentionPolicy {
  id: string;
  dataCategory: string;
  retentionPeriod: string;
  description: string;
  legalBasis: string;
  autoDelete: boolean;
  requiresApproval: boolean;
}

interface RetentionSchedule {
  id: string;
  entityType: string;
  entityId: string;
  retentionEndDate: string;
  deletionScheduledDate?: string;
  legalHoldApplied: boolean;
  approvedForDeletion: boolean;
}

interface RetentionReport {
  totalRecords: number;
  scheduledForDeletion: number;
  onLegalHold: number;
  pendingApproval: number;
  deletedThisMonth: number;
  complianceScore: number;
}

export default function DataRetentionManager() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [schedules, setSchedules] = useState<RetentionSchedule[]>([]);
  const [report, setReport] = useState<RetentionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // In production, fetch from API
      const mockPolicies: RetentionPolicy[] = [
        {
          id: '1',
          dataCategory: 'LEGAL_DOCUMENTS',
          retentionPeriod: '7_YEARS',
          description: 'Legal documents and court filings',
          legalBasis: 'ABA Model Rules, state bar requirements',
          autoDelete: false,
          requiresApproval: true,
        },
        {
          id: '2',
          dataCategory: 'BILLING_RECORDS',
          retentionPeriod: '7_YEARS',
          description: 'Billing and financial records',
          legalBasis: 'IRS requirements, SOX compliance',
          autoDelete: false,
          requiresApproval: true,
        },
        {
          id: '3',
          dataCategory: 'AUDIT_LOGS',
          retentionPeriod: '7_YEARS',
          description: 'Security and compliance audit logs',
          legalBasis: 'SOX, HIPAA, compliance requirements',
          autoDelete: false,
          requiresApproval: false,
        },
        {
          id: '4',
          dataCategory: 'SYSTEM_LOGS',
          retentionPeriod: '90_DAYS',
          description: 'System operation and debug logs',
          legalBasis: 'Internal policy',
          autoDelete: true,
          requiresApproval: false,
        },
      ];

      setPolicies(mockPolicies);

      const mockReport: RetentionReport = {
        totalRecords: 125430,
        scheduledForDeletion: 342,
        onLegalHold: 58,
        pendingApproval: 127,
        deletedThisMonth: 1245,
        complianceScore: 94,
      };

      setReport(mockReport);
    } catch (error) {
      console.error('Error loading retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRetentionPeriodLabel = (period: string): string => {
    const labels: Record<string, string> = {
      '30_DAYS': '30 Days',
      '90_DAYS': '90 Days',
      '6_MONTHS': '6 Months',
      '1_YEAR': '1 Year',
      '3_YEARS': '3 Years',
      '7_YEARS': '7 Years',
      '10_YEARS': '10 Years',
      PERMANENT: 'Permanent',
    };
    return labels[period] || period;
  };

  const getComplianceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading retention policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Retention Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage data retention policies for compliance
        </p>
      </div>

      {/* Compliance Summary */}
      {report && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Under retention management</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceColor(report.complianceScore)}`}>
                {report.complianceScore}%
              </div>
              <Progress value={report.complianceScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Legal Hold</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.onLegalHold}</div>
              <p className="text-xs text-muted-foreground mt-1">Protected from deletion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled for Deletion</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.scheduledForDeletion}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved deletions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.pendingApproval}</div>
              <p className="text-xs text-muted-foreground mt-1">Require review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deleted This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.deletedThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">Per retention policies</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Retention Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Retention Policies</CardTitle>
              <CardDescription>Configure data retention policies by category</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Add Policy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Retention Policy</DialogTitle>
                  <DialogDescription>
                    Define a new data retention policy for compliance
                  </DialogDescription>
                </DialogHeader>
                {/* Policy form would go here */}
                <p className="text-sm text-muted-foreground">Policy creation form...</p>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Category</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Legal Basis</TableHead>
                <TableHead>Auto Delete</TableHead>
                <TableHead>Requires Approval</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{policy.dataCategory.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {policy.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {getRetentionPeriodLabel(policy.retentionPeriod)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {policy.legalBasis}
                  </TableCell>
                  <TableCell>
                    {policy.autoDelete ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {policy.requiresApproval ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="secondary">Not Required</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts */}
      {report && report.pendingApproval > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {report.pendingApproval} items pending deletion approval. Review them before
            the retention period expires.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
