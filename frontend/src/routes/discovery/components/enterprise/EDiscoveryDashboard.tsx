/**
 * @module enterprise/Discovery/EDiscoveryDashboard
 * @category Enterprise eDiscovery
 * @description Comprehensive eDiscovery dashboard with custodian management,
 * collection tracking, processing status, and review metrics
 */

import { analyticsApi } from '@/lib/frontend-api';
import { KPICard } from '@/routes/dashboard/components/enterprise/KPICard';
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button/Button';
import { useTheme } from "@/hooks/useTheme";
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileText,
  Filter,
  FolderOpen,
  Search,
  Settings,
  Upload,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface Custodian {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  status: 'active' | 'hold' | 'released' | 'interviewed';
  dataSources: number;
  documentsCollected: number;
  lastActivity: Date;
}

export interface Collection {
  id: string;
  name: string;
  custodian: string;
  sourceType: 'email' | 'file_share' | 'database' | 'mobile' | 'cloud';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalItems: number;
  collectedItems: number;
  startDate: Date;
  completedDate?: Date;
  size: number; // in MB
}

export interface ProcessingStatus {
  id: string;
  collectionId: string;
  stage: 'deduplication' | 'extraction' | 'ocr' | 'indexing' | 'analysis';
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  itemsProcessed: number;
  totalItems: number;
  startTime: Date;
  endTime?: Date;
  errors?: string[];
}

export interface ReviewMetrics {
  totalDocuments: number;
  reviewed: number;
  privileged: number;
  responsive: number;
  nonResponsive: number;
  needsReview: number;
  flagged: number;
  avgReviewTime: number; // in seconds
  reviewers: number;
}

export interface ProcessingStage {
  phase: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  documentsProcessed: number;
  totalDocuments: number;
}

export interface EDiscoveryDashboardProps {
  caseId?: string;
  onNavigate?: (view: string, id?: string) => void;
  className?: string;
}





// ============================================================================
// COMPONENT
// ============================================================================

export const EDiscoveryDashboard: React.FC<EDiscoveryDashboardProps> = ({
  className,
  caseId = 'default-case'
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'custodians' | 'collections' | 'processing'>('overview');

  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [processingProgress, setProcessingProgress] = useState<ProcessingStage[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [custodiansData, collectionsData, analyticsData] = await Promise.all([
          DataService.custodians.getAll({ caseId }),
          DataService.esiSources.getAll({ caseId }),
          analyticsApi.discoveryAnalytics.getReviewMetrics(caseId)
        ]) as [Custodian[], Record<string, unknown>[], Record<string, unknown>];

        setCustodians(custodiansData.map((c: Custodian) => {
          let status: Custodian['status'] = 'active';
          const s = ((c as unknown as Record<string, unknown>).status as string || 'active').toLowerCase();
          if (s === 'on hold') status = 'hold';
          else if (s === 'released') status = 'released';
          else if (s === 'interviewed') status = 'interviewed';

          return {
            id: c.id,
            name: c.name,
            email: c.email,
            department: c.department,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            title: (c as unknown as Record<string, any>).role || c.title || 'Unknown',
            status,
            dataSources: 0,
            documentsCollected: 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lastActivity: new Date((c as unknown as Record<string, any>).updatedAt || new Date())
          };
        }));

        setCollections(collectionsData.map(c => {
          const item = c as { id: string; collectionName: string; custodians: string[]; status: string;[key: string]: unknown };
          let status: Collection['status'] = 'pending';
          if (['pending', 'in_progress', 'completed', 'failed'].includes(item.status)) {
            status = item.status as Collection['status'];
          }

          return {
            id: item.id,
            name: item.collectionName,
            custodian: item.custodians.join(', '),
            sourceType: 'email',
            status,
            totalItems: item.totalItems || 0,
            collectedItems: item.collectedItems || 0,
            startDate: new Date(item.createdAt as string),
            completedDate: item.completedAt ? new Date(item.completedAt as string) : undefined,
            size: item.actualSize ? parseFloat(item.actualSize as string) : 0
          } as Collection;
        }));

        if (analyticsData && analyticsData.overview) {
          const overview = analyticsData.overview as Record<string, number>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const team = analyticsData.team as Record<string, any>;
          setMetrics({
            totalDocuments: overview.totalDocuments || 0,
            reviewed: overview.reviewedDocuments || 0,
            privileged: overview.privilegedDocuments || 0,
            responsive: overview.responsiveDocuments || 0,
            nonResponsive: (overview.totalDocuments || 0) - (overview.responsiveDocuments || 0),
            needsReview: (overview.totalDocuments || 0) - (overview.reviewedDocuments || 0),
            flagged: 0,
            avgReviewTime: team?.averageReviewRate || 0,
            reviewers: team?.reviewers || []
          });
        }

        if (analyticsData && analyticsData.progress) {
          setProcessingProgress(analyticsData.progress as ProcessingStage[]);
        }
      } catch (error) {
        console.error('Failed to fetch discovery data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId]);

  // Calculate metrics
  const totalCustodians = custodians.length;
  const activeCustodians = custodians.filter(c => c.status === 'active' || c.status === 'hold').length;
  const totalCollections = collections.length;
  const activeCollections = collections.filter(c => c.status === 'in_progress').length;
  const reviewProgress = metrics && metrics.totalDocuments > 0 ? Math.round((metrics.reviewed / metrics.totalDocuments) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'hold':
      case 'in_progress':
      case 'processing':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
      case 'queued':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
      case 'failed':
      case 'error':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn('text-2xl font-bold', theme.text.primary)}>
            eDiscovery Dashboard
          </h2>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            Comprehensive discovery management and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Download}>
            Export Report
          </Button>
          <Button variant="primary" icon={Upload}>
            Import Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Custodians"
          value={totalCustodians}
          icon={Users}
          trend="neutral"
          trendValue={`${activeCustodians} active`}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <KPICard
          title="Active Collections"
          value={activeCollections}
          icon={Database}
          trend="up"
          trendValue={`${totalCollections} total`}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
        />
        <KPICard
          title="Documents Collected"
          value={custodians.reduce((sum, c) => sum + c.documentsCollected, 0)}
          icon={FileText}
          trend="up"
          trendValue="+2,340 today"
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <KPICard
          title="Review Progress"
          value={reviewProgress}
          suffix="%"
          icon={Activity}
          trend="up"
          trendValue="+12% this week"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Tabs */}
      <div className={cn('border-b', theme.border.default)}>
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'custodians', label: 'Custodians', icon: Users },
            { id: 'collections', label: 'Collections', icon: Database },
            { id: 'processing', label: 'Processing', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'custodians' | 'collections' | 'processing')}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : cn('border-transparent', theme.text.secondary, 'hover:text-gray-900 dark:hover:text-gray-100')
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Review Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
                  Review Metrics
                </h3>
                <BarChart3 className={cn('h-5 w-5', theme.text.secondary)} />
              </div>
              <div className="space-y-3">
                {metrics ? [
                  { label: 'Reviewed', value: metrics.reviewed, color: 'bg-emerald-500' },
                  { label: 'Needs Review', value: metrics.needsReview, color: 'bg-amber-500' },
                  { label: 'Privileged', value: metrics.privileged, color: 'bg-blue-500' },
                  { label: 'Responsive', value: metrics.responsive, color: 'bg-purple-500' },
                  { label: 'Non-Responsive', value: metrics.nonResponsive, color: 'bg-gray-400' }
                ].map((item) => {
                  const percentage = metrics.totalDocuments > 0 ? Math.round((item.value / metrics.totalDocuments) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn('text-sm', theme.text.secondary)}>{item.label}</span>
                        <span className={cn('text-sm font-medium', theme.text.primary)}>
                          {item.value.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div className={cn('h-2 rounded-full', theme.background)}>
                        <div
                          className={cn('h-2 rounded-full', item.color)}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className={cn('text-center py-4', theme.text.secondary)}>No metrics available</div>
                )}
              </div>
            </motion.div>

            {/* Processing Pipeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
                  Processing Pipeline
                </h3>
                <Settings className={cn('h-5 w-5', theme.text.secondary)} />
              </div>
              <div className="space-y-4">
                {processingProgress.length > 0 ? processingProgress.map((item, idx) => (
                  <div key={item.phase}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        {item.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-600 animate-spin" />}
                        {item.status === 'not_started' && <Clock className="h-4 w-4 text-gray-400" />}
                        <span className={cn('text-sm font-medium', theme.text.primary)}>
                          {item.phase}
                        </span>
                      </div>
                      <span className={cn('text-sm', theme.text.secondary)}>
                        {item.progress}%
                      </span>
                    </div>
                    <div className={cn('h-2 rounded-full bg-gray-200 dark:bg-gray-700')}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={cn(
                          'h-2 rounded-full',
                          item.status === 'completed' ? 'bg-emerald-500' :
                            item.status === 'in_progress' ? 'bg-blue-500' :
                              'bg-gray-400'
                        )}
                      />
                    </div>
                  </div>
                )) : (
                  <div className={cn('text-center py-4', theme.text.secondary)}>No processing data available</div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'custodians' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4', theme.text.tertiary)} />
                <input
                  type="text"
                  placeholder="Search custodians..."
                  className={cn(
                    'w-full pl-10 pr-4 py-2 rounded-lg border',
                    theme.surface.input,
                    theme.border.default
                  )}
                />
              </div>
              <Button variant="primary" icon={Users}>
                Add Custodian
              </Button>
            </div>

            <div className={cn('rounded-lg border overflow-hidden', theme.border.default)}>
              <table className="w-full">
                <thead className={cn('border-b', theme.background, theme.border.default)}>
                  <tr>
                    <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                      Custodian
                    </th>
                    <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                      Department
                    </th>
                    <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                      Status
                    </th>
                    <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                      Data Sources
                    </th>
                    <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                      Documents
                    </th>
                    <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className={cn('divide-y', theme.surface.default, theme.border.default)}>
                  {custodians.length > 0 ? custodians.map((custodian) => (
                    <tr
                      key={custodian.id}
                      className={cn('hover:bg-gray-50 dark:hover:bg-gray-800/50')}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={cn('h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold')}>
                            {custodian.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-4">
                            <div className={cn('text-sm font-medium', theme.text.primary)}>
                              {custodian.name}
                            </div>
                            <div className={cn('text-sm', theme.text.tertiary)}>
                              {custodian.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn('text-sm', theme.text.primary)}>{custodian.department}</div>
                        <div className={cn('text-sm', theme.text.tertiary)}>{custodian.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(custodian.status))}>
                          {custodian.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('text-sm', theme.text.primary)}>{custodian.dataSources}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('text-sm font-medium', theme.text.primary)}>
                          {custodian.documentsCollected.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('text-sm', theme.text.secondary)}>
                          {custodian.lastActivity.toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className={cn('px-6 py-12 text-center', theme.text.secondary)}>
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-lg font-medium">No custodians found</p>
                          <p className="text-sm mt-1">Add a custodian to get started</p>
                          <Button variant="primary" className="mt-4" icon={Users}>
                            Add Custodian
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'collections' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="secondary" icon={Filter}>
                  Filter
                </Button>
              </div>
              <Button variant="primary" icon={Database}>
                New Collection
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {collections.length > 0 ? collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default, 'hover:shadow-md transition-shadow')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30')}>
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className={cn('font-semibold', theme.text.primary)}>{collection.name}</h4>
                        <p className={cn('text-sm', theme.text.tertiary)}>{collection.custodian}</p>
                      </div>
                    </div>
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(collection.status))}>
                      {collection.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn(theme.text.secondary)}>Progress</span>
                      <span className={cn('font-medium', theme.text.primary)}>
                        {collection.collectedItems.toLocaleString()} / {collection.totalItems.toLocaleString()}
                      </span>
                    </div>
                    <div className={cn('h-2 rounded-full bg-gray-200 dark:bg-gray-700')}>
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${collection.totalItems > 0 ? (collection.collectedItems / collection.totalItems) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className={cn('text-xs', theme.text.tertiary)}>Type</p>
                        <p className={cn('text-sm font-medium capitalize', theme.text.primary)}>
                          {collection.sourceType.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className={cn('text-xs', theme.text.tertiary)}>Size</p>
                        <p className={cn('text-sm font-medium', theme.text.primary)}>
                          {(collection.size / 1024).toFixed(1)} GB
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className={cn('col-span-full p-12 text-center rounded-lg border border-dashed', theme.border.default)}>
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No collections found</p>
                  <p className="text-sm mt-1">Start a new collection to gather data</p>
                  <Button variant="primary" className="mt-4" icon={Database}>
                    New Collection
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn('p-8 rounded-lg border text-center', theme.surface.default, theme.border.default)}
          >
            <Settings className={cn('h-16 w-16 mx-auto mb-4 opacity-20', theme.text.primary)} />
            <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
              Processing Status
            </h3>
            <p className={cn('text-sm', theme.text.secondary)}>
              Detailed processing pipeline coming soon
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EDiscoveryDashboard;
