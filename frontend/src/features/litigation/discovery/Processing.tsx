/**
 * Processing.tsx
 * Processing Queue Management for E-Discovery
 * Manage document processing jobs and workflows
 */

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, AlertCircle, CheckCircle2, Clock, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table/Table';
import { useTheme } from '@/providers/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { cn } from '@/utils/cn';
import type { ProcessingJob } from '@/types/discovery-enhanced';

export const Processing: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();

  // Mock data - in production, this would come from API
  const [jobs, setJobs] = useState<ProcessingJob[]>([
    {
      id: 'PROC-001',
      caseId: 'C-2024-001',
      jobName: 'Executive Email Processing',
      collectionId: 'COL-001',
      status: 'completed',
      priority: 'high',
      progress: 100,
      totalDocuments: 15420,
      processedDocuments: 15420,
      failedDocuments: 0,
      processingSteps: {
        deduplication: 'completed',
        textExtraction: 'completed',
        metadata: 'completed',
        threading: 'completed'
      },
      startedAt: '2024-01-15T15:00:00Z',
      completedAt: '2024-01-15T18:45:00Z',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'PROC-002',
      caseId: 'C-2024-001',
      jobName: 'SharePoint Document Processing',
      collectionId: 'COL-002',
      status: 'processing',
      priority: 'normal',
      progress: 45,
      totalDocuments: 5695,
      processedDocuments: 2562,
      failedDocuments: 12,
      processingSteps: {
        deduplication: 'completed',
        textExtraction: 'processing',
        metadata: 'pending',
        threading: 'pending'
      },
      startedAt: '2024-01-20T14:30:00Z',
      estimatedCompletion: '2024-01-20T20:00:00Z',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: 'PROC-003',
      caseId: 'C-2024-001',
      jobName: 'Forensic Image Processing',
      collectionId: 'COL-003',
      status: 'queued',
      priority: 'urgent',
      progress: 0,
      totalDocuments: 0,
      processedDocuments: 0,
      failedDocuments: 0,
      processingSteps: {
        deduplication: 'pending',
        textExtraction: 'pending',
        metadata: 'pending',
        threading: 'pending'
      },
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    },
    {
      id: 'PROC-004',
      caseId: 'C-2024-001',
      jobName: 'Legacy System Migration',
      collectionId: 'COL-004',
      status: 'failed',
      priority: 'low',
      progress: 23,
      totalDocuments: 3200,
      processedDocuments: 736,
      failedDocuments: 245,
      processingSteps: {
        deduplication: 'completed',
        textExtraction: 'failed',
        metadata: 'pending',
        threading: 'pending'
      },
      startedAt: '2024-01-19T10:00:00Z',
      errors: ['Text extraction failed for 245 PDF files', 'OCR timeout errors'],
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19'
    }
  ]);

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'processing': return <Zap className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'queued': return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'failed': return 'danger';
      case 'paused': return 'warning';
      case 'queued': return 'neutral';
    }
  };

  const getPriorityVariant = (priority: ProcessingJob['priority']) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'neutral';
    }
  };

  const getStepIcon = (stepStatus: 'pending' | 'completed' | 'failed' | 'processing') => {
    switch (stepStatus) {
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-red-600" />;
      case 'processing': return <Clock className="h-3 w-3 text-blue-600" />;
      case 'pending': return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const handlePauseResume = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const newStatus = job.status === 'processing' ? 'paused' : 'processing';
        notify.success(`Job ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
        return { ...job, status: newStatus };
      }
      return job;
    }));
  };

  const handleRetry = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId && job.status === 'failed') {
        notify.success('Job queued for retry');
        return { ...job, status: 'queued', errors: undefined };
      }
      return job;
    }));
  };

  const stats = {
    total: jobs.length,
    processing: jobs.filter(j => j.status === 'processing').length,
    queued: jobs.filter(j => j.status === 'queued').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    totalDocs: jobs.reduce((acc, job) => acc + job.processedDocuments, 0)
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Total Jobs</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.total}</p>
            </div>
            <TrendingUp className={cn("h-8 w-8", theme.text.tertiary)} />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Processing</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.processing}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Queued</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.queued}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Completed</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Processed</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.totalDocs.toLocaleString()}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Processing Queue Table */}
      <div className={cn("rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="p-4 border-b">
          <h3 className={cn("font-bold text-lg", theme.text.primary)}>Processing Queue</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage document processing jobs and workflows</p>
        </div>

        <TableContainer>
          <TableHeader>
            <TableHead>Job Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Processing Steps</TableHead>
            <TableHead>Actions</TableHead>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div>
                    <div className={cn("font-medium", theme.text.primary)}>{job.jobName}</div>
                    <div className={cn("text-xs", theme.text.tertiary)}>{job.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(job.priority)} size="sm">
                    {job.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(job.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(job.status)}
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className={cn("w-32 h-2 rounded-full", theme.surface.highlight)}>
                      <div
                        className={cn("h-2 rounded-full transition-all",
                          job.status === 'failed' ? 'bg-red-600' : 'bg-blue-600'
                        )}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className={cn("text-xs", theme.text.tertiary)}>{job.progress}%</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {job.processedDocuments.toLocaleString()} / {job.totalDocuments.toLocaleString()}
                    </div>
                    {job.failedDocuments > 0 && (
                      <div className="text-xs text-red-600">{job.failedDocuments} failed</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      {getStepIcon(job.processingSteps.deduplication)}
                      <span>Dedup</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStepIcon(job.processingSteps.textExtraction)}
                      <span>Text</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStepIcon(job.processingSteps.metadata)}
                      <span>Metadata</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStepIcon(job.processingSteps.threading)}
                      <span>Thread</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(job.status === 'processing' || job.status === 'paused') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={job.status === 'processing' ? Pause : Play}
                        onClick={() => handlePauseResume(job.id)}
                      >
                        {job.status === 'processing' ? 'Pause' : 'Resume'}
                      </Button>
                    )}
                    {job.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={RotateCcw}
                        onClick={() => handleRetry(job.id)}
                      >
                        Retry
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">Details</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </div>

      {/* Error Details */}
      {jobs.some(j => j.errors && j.errors.length > 0) && (
        <div className={cn("p-4 rounded-lg border border-red-200 bg-red-50")}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-sm mb-2">Processing Errors</h4>
              {jobs.filter(j => j.errors).map(job => (
                <div key={job.id} className="mb-2">
                  <div className="text-sm font-medium text-red-800">{job.jobName}:</div>
                  <ul className="list-disc list-inside text-xs text-red-700 ml-2">
                    {job.errors?.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Processing;
