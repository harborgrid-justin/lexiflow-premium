/**
 * @module enterprise/Discovery/ProductionManager
 * @category Enterprise eDiscovery
 * @description Production set management with Bates numbering, redaction tracking, and production history
 */

import { Production as APIProduction } from '@/lib/frontend-api';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { useTheme } from '@/theme';
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/shared/lib/cn';
import { motion } from 'framer-motion';
import {
  Archive,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Hash,
  History,
  Package,
  Plus,
  Search,
  Send
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface BatesRange {
  prefix: string;
  startNumber: number;
  endNumber: number;
  totalDocuments: number;
}

export interface Redaction {
  id: string;
  documentId: string;
  batesNumber: string;
  pageNumber: number;
  reason: 'privileged' | 'confidential' | 'pii' | 'trade-secret' | 'other';
  coordinates?: { x: number; y: number; width: number; height: number };
  appliedBy: string;
  appliedDate: Date;
  verified: boolean;
}

export interface Production {
  id: string;
  name: string;
  productionNumber: string;
  recipientParty: string;
  status: 'draft' | 'ready' | 'produced' | 'supplemented' | 'superseded';
  createdDate: Date;
  producedDate?: Date;
  batesRange: BatesRange;
  documentCount: number;
  redactionCount: number;
  format: 'native' | 'pdf' | 'tiff' | 'mixed';
  media: 'electronic' | 'hard-copy' | 'both';
  deliveryMethod: 'email' | 'ftp' | 'physical-media' | 'litigation-platform';
  loadFileIncluded: boolean;
  metadata: {
    createdBy: string;
    reviewedBy?: string;
    approvedBy?: string;
  };
  notes?: string;
}

export interface ProductionHistory {
  id: string;
  productionId: string;
  action: 'created' | 'modified' | 'produced' | 'supplemented' | 'superseded' | 'recalled';
  performedBy: string;
  timestamp: Date;
  changes?: string;
  notes?: string;
}

export interface ProductionManagerProps {
  caseId?: string;
  onNavigate?: (view: string, id?: string) => void;
  className?: string;
}




// ============================================================================
// COMPONENT
// ============================================================================

export const ProductionManager: React.FC<ProductionManagerProps> = ({
  className,
  caseId = 'default-case'
}) => {
  const { theme } = useTheme();
  const [productions, setProductions] = useState<Production[]>([]);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBatesGenerator, setShowBatesGenerator] = useState(false);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductions = async () => {
      setLoading(true);
      try {
        const data = await DataService.productions.getAll({ caseId });
        setProductions((data as APIProduction[]).map((p: APIProduction) => {
          let status: Production['status'] = 'draft';
          if (p.status === 'ready' || p.status === 'produced') {
            status = p.status;
          }

          return {
            id: p.id,
            name: p.name,
            productionNumber: p.productionNumber || 'N/A',
            recipientParty: p.producedTo || 'Unknown',
            status,
            createdDate: new Date(p.createdAt || Date.now()),
            producedDate: p.productionDate ? new Date(p.productionDate) : undefined,
            batesRange: {
              prefix: p.beginBatesNumber?.split('-')[0] || 'UNK',
              startNumber: parseInt(p.beginBatesNumber?.split('-')[1] || '0'),
              endNumber: parseInt(p.endBatesNumber?.split('-')[1] || '0'),
              totalDocuments: p.documentCount || 0
            },
            documentCount: p.documentCount || 0,
            redactionCount: 0,
            format: (p.format === 'native' || p.format === 'pdf' || p.format === 'tiff') ? p.format : 'mixed',
            media: 'electronic',
            deliveryMethod: 'litigation-platform',
            loadFileIncluded: true,
            metadata: {
              createdBy: 'System',
              ...(p.metadata as Record<string, string> || {})
            },
            notes: p.notes
          };
        }));
      } catch (error) {
        console.error('Failed to fetch productions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductions();
  }, [caseId]);

  // Filter productions
  const filteredProductions = productions.filter(prod =>
    !searchQuery ||
    prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.productionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.recipientParty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: Production['status']) => {
    switch (status) {
      case 'produced':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-amber-600" />;
      case 'supplemented':
        return <Plus className="h-4 w-4 text-purple-600" />;
      case 'superseded':
        return <Archive className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Production['status']) => {
    switch (status) {
      case 'produced':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'ready':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
      case 'supplemented':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      case 'superseded':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatBatesRange = (range: BatesRange) => {
    const paddedStart = String(range.startNumber).padStart(7, '0');
    const paddedEnd = String(range.endNumber).padStart(7, '0');
    return `${range.prefix}-${paddedStart} to ${range.prefix}-${paddedEnd}`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn('text-2xl font-bold flex items-center gap-2', theme.text.primary)}>
            <Package className="h-7 w-7 text-purple-600" />
            Production Manager
          </h2>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            Manage production sets with Bates numbering and redaction tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Hash} onClick={() => setShowBatesGenerator(true)}>
            Bates Generator
          </Button>
          <Button variant="secondary" icon={Download}>
            Export Log
          </Button>
          <Button variant="primary" icon={Plus}>
            New Production
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Productions',
            value: productions.length,
            icon: Package,
            color: 'text-purple-600',
            bg: 'bg-purple-100 dark:bg-purple-900/30'
          },
          {
            label: 'Documents Produced',
            value: productions.reduce((sum, p) => sum + p.documentCount, 0),
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
          },
          {
            label: 'Total Redactions',
            value: productions.reduce((sum, p) => sum + p.redactionCount, 0),
            icon: EyeOff,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/30'
          },
          {
            label: 'Ready to Produce',
            value: productions.filter(p => p.status === 'ready').length,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30'
          }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-xs font-medium mb-1', theme.text.secondary)}>{stat.label}</p>
                <p className={cn('text-2xl font-bold', stat.color)}>{stat.value.toLocaleString()}</p>
              </div>
              <div className={cn('p-3 rounded-lg', stat.bg)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4', theme.text.tertiary)} />
          <input
            type="text"
            placeholder="Search productions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg border',
              theme.surface.input,
              theme.border.default
            )}
          />
        </div>
        <Button variant="secondary" icon={Filter}>
          Filters
        </Button>
      </div>

      {/* Productions List */}
      <div className="space-y-4">
        {filteredProductions.length > 0 ? filteredProductions.map((production) => (
          <motion.div
            key={production.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-6 rounded-lg border cursor-pointer transition-all',
              theme.surface.default,
              theme.border.default,
              selectedProduction?.id === production.id
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'hover:shadow-md'
            )}
            onClick={() => setSelectedProduction(production)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
                    {production.name}
                  </h3>
                  <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(production.status))}>
                    {getStatusIcon(production.status)}
                    {production.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className={cn('text-xs font-medium mb-1', theme.text.secondary)}>
                      Production Number
                    </p>
                    <p className={cn('text-sm font-mono', theme.text.primary)}>
                      {production.productionNumber}
                    </p>
                  </div>
                  <div>
                    <p className={cn('text-xs font-medium mb-1', theme.text.secondary)}>
                      Bates Range
                    </p>
                    <p className={cn('text-sm font-mono', theme.text.primary)}>
                      {formatBatesRange(production.batesRange)}
                    </p>
                  </div>
                  <div>
                    <p className={cn('text-xs font-medium mb-1', theme.text.secondary)}>
                      Documents
                    </p>
                    <p className={cn('text-sm font-medium', theme.text.primary)}>
                      {production.documentCount.toLocaleString()} docs
                      {production.redactionCount > 0 && (
                        <span className={cn('ml-2 text-xs', theme.text.tertiary)}>
                          ({production.redactionCount} redactions)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className={cn('text-xs font-medium mb-1', theme.text.secondary)}>
                      Recipient
                    </p>
                    <p className={cn('text-sm', theme.text.primary)}>
                      {production.recipientParty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className={cn('h-4 w-4', theme.text.tertiary)} />
                    <span className={cn(theme.text.secondary)}>
                      Format: <span className={cn('capitalize', theme.text.primary)}>{production.format}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Send className={cn('h-4 w-4', theme.text.tertiary)} />
                    <span className={cn(theme.text.secondary)}>
                      Via: <span className={cn('capitalize', theme.text.primary)}>{production.deliveryMethod.replace('-', ' ')}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className={cn('h-4 w-4', theme.text.tertiary)} />
                    <span className={cn(theme.text.secondary)}>
                      {production.producedDate
                        ? `Produced: ${production.producedDate.toLocaleDateString()}`
                        : `Created: ${production.createdDate.toLocaleDateString()}`
                      }
                    </span>
                  </div>
                </div>

                {production.notes && (
                  <div className={cn('mt-3 p-3 rounded bg-blue-50 dark:bg-blue-900/20')}>
                    <p className={cn('text-sm', theme.text.secondary)}>
                      <strong>Notes:</strong> {production.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  className={cn('p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700', theme.text.secondary)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  className={cn('p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700', theme.text.secondary)}
                  title="Edit Production"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className={cn('p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700', theme.text.secondary)}
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {production.status === 'ready' && (
                  <Button variant="primary" size="sm" icon={Send}>
                    Produce
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className={cn('p-12 text-center rounded-lg border border-dashed', theme.border.default)}>
            <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No productions found</p>
            <p className="text-sm mt-1">Create a new production set to get started</p>
            <Button variant="primary" className="mt-4" icon={Plus}>
              New Production
            </Button>
          </div>
        )}
      </div>

      {/* Production History */}
      {
        selectedProduction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}
          >
            <div className="flex items-center gap-2 mb-4">
              <History className={cn('h-5 w-5', theme.text.secondary)} />
              <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
                Production History - {selectedProduction.productionNumber}
              </h3>
            </div>

            <div className="space-y-3">
              <div className={cn('p-4 text-center', theme.text.secondary)}>
                Production history not available
              </div>
            </div>
          </motion.div>
        )
      }

      {/* Empty State */}
      {
        filteredProductions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn('p-12 rounded-lg border text-center', theme.surface.default, theme.border.default)}
          >
            <Package className={cn('h-16 w-16 mx-auto mb-4 opacity-20', theme.text.primary)} />
            <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
              No Productions Found
            </h3>
            <p className={cn('text-sm', theme.text.secondary)}>
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first production set to get started'
              }
            </p>
          </motion.div>
        )
      }

      {/* Bates Generator Modal (placeholder) */}
      {
        showBatesGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowBatesGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={cn('p-6 rounded-lg max-w-md w-full m-4', theme.surface.default)}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
                Bates Number Generator
              </h3>
              <p className={cn('text-sm mb-4', theme.text.secondary)}>
                Configure Bates numbering settings for your production.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowBatesGenerator(false)}>
                  Cancel
                </Button>
                <Button variant="primary">
                  Generate
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )
      }
    </div >
  );
};

export default ProductionManager;
