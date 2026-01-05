/**
 * Processing.tsx
 * Processing Queue Management for E-Discovery
 * Manage document processing jobs and workflows
 */

import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { DISCOVERY_QUERY_KEYS, DiscoveryRepository } from '@/services/data/repositories/DiscoveryRepository';
import type { ProcessingJob } from '@/types/discovery-enhanced';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle2, Clock, Pause, Play, RotateCcw, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

interface ProcessingProps {
  caseId?: string;
}

export const Processing: React.FC<ProcessingProps> = ({ caseId }) => {
  const { theme } = useTheme();
  const notify = useNotify();

  // Access Discovery Repository
  const discoveryRepo = DataService.discovery as unknown as DiscoveryRepository;

  // Fetch Processing Jobs
  const { data: jobs = [], isLoading } = useQuery<ProcessingJob[]>(
    caseId ? DISCOVERY_QUERY_KEYS.processing.byCase(caseId) : DISCOVERY_QUERY_KEYS.processing.all(),
    async () => {
      return discoveryRepo.getProcessingJobs(caseId);
    }
  );

  // Update Job Mutation (Pause/Resume/Retry)
  const { mutate: updateJob } = useMutation(
    async ({ id, data }: { id: string; data: Partial<ProcessingJob> }) => {
      return discoveryRepo.updateProcessingJob(id, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(
          caseId ? DISCOVERY_QUERY_KEYS.processing.byCase(caseId) : DISCOVERY_QUERY_KEYS.processing.all()
        );
      },
      onError: (error) => {
        console.error('Failed to update job:', error);
        notify.error('Failed to update job');
      }
    }
  );

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
      case 'failed': return 'error';
      case 'paused': return 'warning';
      case 'queued': return 'neutral';
    }
  };

  const getPriorityVariant = (priority: ProcessingJob['priority']) => {
    switch (priority) {
      case 'urgent': return 'error';
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

  const handlePauseResume = (job: ProcessingJob) => {
    const newStatus = job.status === 'processing' ? 'paused' : 'processing';
    updateJob({ id: job.id, data: { status: newStatus } });
    notify.success(`Job ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
  };

  const handleRetry = (job: ProcessingJob) => {
    updateJob({ id: job.id, data: { status: 'queued', errors: undefined } });
    notify.success('Job queued for retry');
  };

  const stats = {
    total: jobs.length,
    processing: jobs.filter(j => j.status === 'processing').length,
    queued: jobs.filter(j => j.status === 'queued').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    totalDocs: jobs.reduce((acc, job) => acc + job.processedDocuments, 0)
  };

  if (isLoading) {
    return <LazyLoader />;
  }

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
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Zap className={cn("h-12 w-12 mb-4", theme.text.tertiary)} />
                    <h3 className={cn("text-lg font-medium", theme.text.primary)}>No Processing Jobs</h3>
                    <p className={cn("text-sm max-w-sm mt-2", theme.text.secondary)}>
                      There are no active processing jobs at the moment.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
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
                          onClick={() => handlePauseResume(job)}
                        >
                          {job.status === 'processing' ? 'Pause' : 'Resume'}
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={RotateCcw}
                          onClick={() => handleRetry(job)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">Details</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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
