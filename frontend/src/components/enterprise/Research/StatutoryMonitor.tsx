/**
 * @module enterprise/Research/StatutoryMonitor
 * @category Enterprise Research
 * @description Legislative tracking, regulatory updates, and alert management system
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  ExternalLink,
  Plus,
  Settings,
  Bookmark,
  Mail,
  Download,
  FileText,
  Scale,
  Building,
  Gavel,
  ChevronRight,
  Star,
  Eye,
  Activity,
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type UpdateType = 'bill' | 'regulation' | 'ruling' | 'amendment';
export type UpdateStatus = 'proposed' | 'active' | 'enacted' | 'expired';
export type AlertPriority = 'high' | 'medium' | 'low';

export interface LegislativeUpdate {
  id: string;
  title: string;
  description: string;
  type: UpdateType;
  status: UpdateStatus;
  jurisdiction: string;
  chamber?: 'house' | 'senate' | 'both';
  billNumber?: string;
  sponsor?: string;
  introducedDate: Date;
  lastActionDate: Date;
  effectiveDate?: Date;
  summary: string;
  impact: string;
  tags: string[];
  relatedLaws?: string[];
  tracking: boolean;
  priority: AlertPriority;
  url?: string;
}

export interface RegulatoryAlert {
  id: string;
  agency: string;
  title: string;
  type: 'proposed' | 'final' | 'interim';
  published: Date;
  commentDeadline?: Date;
  effectiveDate?: Date;
  jurisdiction: string;
  summary: string;
  impact: string;
  federalRegisterNumber?: string;
  cfr?: string;
  read: boolean;
  bookmarked: boolean;
}

export interface MonitoringRule {
  id: string;
  name: string;
  keywords: string[];
  jurisdictions: string[];
  types: UpdateType[];
  alertMethod: 'email' | 'dashboard' | 'both';
  frequency: 'immediate' | 'daily' | 'weekly';
  active: boolean;
  createdAt: Date;
}

export interface StatutoryMonitorProps {
  updates?: LegislativeUpdate[];
  alerts?: RegulatoryAlert[];
  rules?: MonitoringRule[];
  onTrackUpdate?: (updateId: string, track: boolean) => void;
  onCreateRule?: (rule: Partial<MonitoringRule>) => void;
  onMarkRead?: (alertId: string) => void;
  onExport?: (updateIds: string[]) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const StatutoryMonitor: React.FC<StatutoryMonitorProps> = ({
  updates: initialUpdates = [],
  alerts: initialAlerts = [],
  rules: initialRules = [],
  onTrackUpdate,
  onCreateRule,
  onMarkRead,
  onExport,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'updates' | 'alerts' | 'tracking'>('updates');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<UpdateType | 'all'>('all');
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>('all');
  const [selectedUpdate, setSelectedUpdate] = useState<LegislativeUpdate | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<RegulatoryAlert | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);

  // Mock data for demonstration
  const [updates] = useState<LegislativeUpdate[]>(
    initialUpdates.length > 0
      ? initialUpdates
      : [
          {
            id: '1',
            title: 'Privacy Protection and Data Security Act',
            description: 'Comprehensive data privacy legislation requiring enhanced security measures',
            type: 'bill',
            status: 'proposed',
            jurisdiction: 'Federal',
            chamber: 'senate',
            billNumber: 'S. 2847',
            sponsor: 'Sen. Smith',
            introducedDate: new Date('2024-01-15'),
            lastActionDate: new Date('2024-01-20'),
            summary:
              'This bill establishes comprehensive data privacy protections, requiring businesses to implement enhanced security measures and provide consumers with greater control over their personal information.',
            impact:
              'High impact on technology companies, data brokers, and businesses handling consumer data. May require significant compliance investments.',
            tags: ['privacy', 'data security', 'consumer protection', 'technology'],
            tracking: true,
            priority: 'high',
            url: 'https://example.com/bill/s2847',
          },
          {
            id: '2',
            title: 'Employment Classification Amendment',
            description: 'Updates to worker classification standards for gig economy',
            type: 'amendment',
            status: 'active',
            jurisdiction: 'California',
            billNumber: 'AB 5',
            introducedDate: new Date('2024-01-10'),
            lastActionDate: new Date('2024-01-18'),
            effectiveDate: new Date('2024-07-01'),
            summary:
              'Amends existing employment classification law to provide clearer standards for independent contractor status in the gig economy.',
            impact:
              'Significant impact on gig economy platforms and companies using independent contractors.',
            tags: ['employment', 'gig economy', 'labor law', 'classification'],
            tracking: true,
            priority: 'high',
          },
          {
            id: '3',
            title: 'Environmental Compliance Regulation Updates',
            description: 'New EPA standards for industrial emissions',
            type: 'regulation',
            status: 'enacted',
            jurisdiction: 'Federal',
            introducedDate: new Date('2023-12-01'),
            lastActionDate: new Date('2024-01-15'),
            effectiveDate: new Date('2024-03-01'),
            summary:
              'EPA issues final rule updating emissions standards for industrial facilities.',
            impact:
              'Moderate impact on manufacturing and industrial sectors. Compliance required by March 2024.',
            tags: ['environmental', 'EPA', 'emissions', 'compliance'],
            tracking: false,
            priority: 'medium',
          },
        ]
  );

  const [alerts] = useState<RegulatoryAlert[]>(
    initialAlerts.length > 0
      ? initialAlerts
      : [
          {
            id: '1',
            agency: 'SEC',
            title: 'Proposed Amendments to Cybersecurity Disclosure Rules',
            type: 'proposed',
            published: new Date('2024-01-12'),
            commentDeadline: new Date('2024-02-28'),
            jurisdiction: 'Federal',
            summary:
              'The Securities and Exchange Commission proposes amendments to enhance cybersecurity incident disclosure requirements for public companies.',
            impact:
              'Public companies will need to disclose material cybersecurity incidents within 4 business days.',
            federalRegisterNumber: '2024-00123',
            cfr: '17 CFR 229.106',
            read: false,
            bookmarked: true,
          },
          {
            id: '2',
            agency: 'FTC',
            title: 'Final Rule on Consumer Privacy Protection',
            type: 'final',
            published: new Date('2024-01-08'),
            effectiveDate: new Date('2024-06-01'),
            jurisdiction: 'Federal',
            summary:
              'Federal Trade Commission issues final rule on consumer privacy protections and data security requirements.',
            impact:
              'All businesses collecting consumer data must implement new privacy safeguards and disclosure requirements.',
            federalRegisterNumber: '2024-00089',
            read: true,
            bookmarked: false,
          },
        ]
  );

  const [rules] = useState<MonitoringRule[]>(
    initialRules.length > 0
      ? initialRules
      : [
          {
            id: '1',
            name: 'Privacy & Data Security Tracking',
            keywords: ['privacy', 'data security', 'GDPR', 'CCPA'],
            jurisdictions: ['Federal', 'California'],
            types: ['bill', 'regulation'],
            alertMethod: 'both',
            frequency: 'immediate',
            active: true,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: '2',
            name: 'Employment Law Updates',
            keywords: ['employment', 'labor', 'discrimination', 'wage'],
            jurisdictions: ['Federal', 'New York', 'California'],
            types: ['bill', 'regulation', 'ruling'],
            alertMethod: 'email',
            frequency: 'daily',
            active: true,
            createdAt: new Date('2024-01-05'),
          },
        ]
  );

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      searchQuery === '' ||
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || update.type === filterType;
    const matchesJurisdiction =
      filterJurisdiction === 'all' || update.jurisdiction === filterJurisdiction;
    return matchesSearch && matchesType && matchesJurisdiction;
  });

  const getTypeIcon = (type: UpdateType) => {
    switch (type) {
      case 'bill':
        return <FileText className="h-5 w-5" />;
      case 'regulation':
        return <BookOpen className="h-5 w-5" />;
      case 'ruling':
        return <Gavel className="h-5 w-5" />;
      case 'amendment':
        return <Scale className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: UpdateType) => {
    switch (type) {
      case 'bill':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'regulation':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'ruling':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'amendment':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    }
  };

  const getStatusColor = (status: UpdateStatus) => {
    switch (status) {
      case 'proposed':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'active':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'enacted':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'expired':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Statutory Monitor
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Track legislative updates, regulations, and legal developments
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRuleDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <Plus className="h-4 w-4" />
              New Alert Rule
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Bell className="h-4 w-4" />
              Manage Alerts
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-4 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {updates.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Updates</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {alerts.filter((a) => !a.read).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Unread Alerts</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {updates.filter((u) => u.tracking).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Tracking</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {rules.filter((r) => r.active).length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Alert Rules</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('updates')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'updates'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Legislative Updates
            </div>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Regulatory Alerts ({alerts.filter((a) => !a.read).length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'tracking'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Alert Rules ({rules.filter((r) => r.active).length})
            </div>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legislation, regulations, alerts..."
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as UpdateType | 'all')}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="bill">Bills</option>
            <option value="regulation">Regulations</option>
            <option value="ruling">Rulings</option>
            <option value="amendment">Amendments</option>
          </select>
          <select
            value={filterJurisdiction}
            onChange={(e) => setFilterJurisdiction(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">All Jurisdictions</option>
            <option value="Federal">Federal</option>
            <option value="California">California</option>
            <option value="New York">New York</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'updates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {filteredUpdates.map((update) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedUpdate(update)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${getTypeColor(update.type)}`}>
                        {getTypeIcon(update.type)}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {update.title}
                          </h3>
                          {update.tracking && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                          {update.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                          {update.billNumber && (
                            <span className="font-medium">{update.billNumber}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {update.jurisdiction}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last action: {update.lastActionDate.toLocaleDateString()}
                          </span>
                          {update.effectiveDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Effective: {update.effectiveDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(update.status)}`}
                      >
                        {update.status}
                      </span>
                      <div className={`flex items-center gap-1 text-xs font-medium ${getPriorityColor(update.priority)}`}>
                        <AlertCircle className="h-3 w-3" />
                        {update.priority} priority
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1">
                    {update.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Impact:</strong> {update.impact}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrackUpdate?.(update.id, !update.tracking);
                        }}
                        className={`rounded-md px-3 py-1 text-xs font-medium ${
                          update.tracking
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {update.tracking ? 'Tracking' : 'Track'}
                      </button>
                      {update.url && (
                        <a
                          href={update.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredUpdates.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    No Updates Found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? 'Try adjusting your search or filters.'
                      : 'No legislative updates match your criteria.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setSelectedAlert(alert);
                    if (!alert.read) onMarkRead?.(alert.id);
                  }}
                  className={`cursor-pointer rounded-lg border bg-white p-6 transition-all hover:shadow-md dark:bg-gray-800 ${
                    alert.read
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                        <Building className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {alert.agency}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              alert.type === 'proposed'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : alert.type === 'final'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}
                          >
                            {alert.type}
                          </span>
                          {!alert.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                          )}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {alert.title}
                        </h3>
                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                          {alert.summary}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Published: {alert.published.toLocaleDateString()}
                          </span>
                          {alert.commentDeadline && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <AlertCircle className="h-3 w-3" />
                              Comments due: {alert.commentDeadline.toLocaleDateString()}
                            </span>
                          )}
                          {alert.effectiveDate && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Effective: {alert.effectiveDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle bookmark
                      }}
                      className="rounded p-1 text-gray-400 hover:text-yellow-500"
                    >
                      <Bookmark
                        className={`h-5 w-5 ${alert.bookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`}
                      />
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-3 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Impact:</strong> {alert.impact}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {rules.map((rule) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {rule.name}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            rule.active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}
                        >
                          {rule.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="mb-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Tag className="h-4 w-4" />
                          <span>Keywords:</span>
                          <div className="flex flex-wrap gap-1">
                            {rule.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>Jurisdictions:</span>
                          <span>{rule.jurisdictions.join(', ')}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FileText className="h-4 w-4" />
                          <span>Types:</span>
                          <span className="capitalize">{rule.types.join(', ')}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Bell className="h-4 w-4" />
                          <span>
                            {rule.alertMethod} • {rule.frequency}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Created {rule.createdAt.toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                        Edit
                      </button>
                      <button className="rounded-md border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20">
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {rules.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
                  <Settings className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    No Alert Rules
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Create alert rules to automatically track legislative and regulatory updates.
                  </p>
                  <button
                    onClick={() => setShowRuleDialog(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Alert Rule
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StatutoryMonitor;
