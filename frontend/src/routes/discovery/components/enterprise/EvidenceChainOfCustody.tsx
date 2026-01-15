/**
 * @module enterprise/Discovery/EvidenceChainOfCustody
 * @category Enterprise Evidence Management
 * @description Chain of custody tracking for evidence with handling logs and authentication records
 */

import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button/Button';
import { useTheme } from "@/hooks/useTheme";
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Fingerprint,
  History,
  Link as LinkIcon,
  Lock,
  MapPin,
  Package,
  Plus,
  QrCode,
  Search,
  Shield,
  Unlock,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface EvidenceItem {
  id: string;
  evidenceNumber: string;
  description: string;
  type: 'physical' | 'digital' | 'document' | 'multimedia';
  category: 'document' | 'weapon' | 'substance' | 'electronic' | 'biological' | 'other';
  status: 'collected' | 'stored' | 'analyzed' | 'court' | 'returned' | 'destroyed';
  location: string;
  collectedDate: Date;
  collectedBy: string;
  collectionLocation: string;
  caseNumber: string;
  sealed: boolean;
  tamperEvident: boolean;
  photographed: boolean;
  fingerprinted: boolean;
  chainIntegrity: 'intact' | 'questioned' | 'broken';
}

export interface CustodyTransfer {
  id: string;
  evidenceId: string;
  fromPerson: string;
  fromRole: string;
  toPerson: string;
  toRole: string;
  transferDate: Date;
  fromLocation: string;
  toLocation: string;
  purpose: string;
  condition: 'good' | 'damaged' | 'tampered';
  sealIntact: boolean;
  signature: string;
  witnessName?: string;
  witnessSignature?: string;
  notes?: string;
}

export interface HandlingLog {
  id: string;
  evidenceId: string;
  action: 'collected' | 'transferred' | 'examined' | 'photographed' | 'tested' | 'stored' | 'retrieved' | 'returned';
  performedBy: string;
  timestamp: Date;
  location: string;
  duration?: number; // in minutes
  purpose: string;
  observations?: string;
  witnessPresent: boolean;
  witnessName?: string;
}

// Type alias for audit log entries (same as HandlingLog)
export type AuditLogEntry = HandlingLog;

export interface AuthenticationRecord {
  id: string;
  evidenceId: string;
  authenticatedBy: string;
  authenticationType: 'visual' | 'scientific' | 'expert' | 'witness' | 'documentation';
  authenticatedDate: Date;
  method: string;
  result: 'authenticated' | 'pending' | 'failed';
  certificationNumber?: string;
  notes?: string;
}

export interface EvidenceChainOfCustodyProps {
  caseId?: string;
  evidenceId?: string;
  onNavigate?: (view: string, id?: string) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EvidenceChainOfCustody: React.FC<EvidenceChainOfCustodyProps> = ({
  evidenceId,
  className
}) => {
  const { theme } = useTheme();

  // State for data
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [custodyTransfers, setTransfers] = useState<CustodyTransfer[]>([]);
  const [handlingLogs, setAuditLogs] = useState<HandlingLog[]>([]);
  const [, setIsLoading] = useState(false);

  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transfers' | 'handling' | 'authentication'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Load evidence items
        const items = await DataService.discovery.getEvidence();
        setEvidenceItems(items as unknown as EvidenceItem[]);

        // If evidenceId provided, find it and load its data
        if (evidenceId) {
          const found = items.find((i: { id: string }) => i.id === evidenceId);
          if (found) {
            const evidenceItem = found as unknown as EvidenceItem;
            setSelectedEvidence(evidenceItem);

            // Load transfers and logs for selected evidence
            try {
              const [transfersData, logsData] = await Promise.all([
                DataService.discovery.getTransfers?.(evidenceId) || Promise.resolve([]),
                DataService.discovery.getAuditLogs?.(evidenceId) || Promise.resolve([])
              ]);

              setTransfers(transfersData as CustodyTransfer[]);
              setAuditLogs(logsData as AuditLogEntry[]);
            } catch (fetchError) {
              console.error('Failed to load evidence details:', fetchError);
              // Continue with empty arrays - UI will show empty states
            }
          }
        }
      } catch (err) {
        console.error('Failed to load evidence data', err);
        setEvidenceItems([]); // Show empty state on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [evidenceId]);

  // Filter evidence items
  const filteredEvidence = evidenceItems.filter(item =>
    !searchQuery ||
    item.evidenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.caseNumber && item.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusIcon = (status: EvidenceItem['status']) => {
    switch (status) {
      case 'collected':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'stored':
        return <Lock className="h-4 w-4 text-emerald-600" />;
      case 'analyzed':
        return <Eye className="h-4 w-4 text-purple-600" />;
      case 'court':
        return <Shield className="h-4 w-4 text-amber-600" />;
      case 'returned':
        return <Unlock className="h-4 w-4 text-gray-600" />;
      case 'destroyed':
        return <AlertTriangle className="h-4 w-4 text-rose-600" />;
    }
  };

  const getStatusColor = (status: EvidenceItem['status']) => {
    switch (status) {
      case 'collected':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'stored':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'analyzed':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      case 'court':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
      case 'returned':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
      case 'destroyed':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400';
    }
  };

  const getIntegrityColor = (integrity: EvidenceItem['chainIntegrity']) => {
    switch (integrity) {
      case 'intact':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'questioned':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
      case 'broken':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn('text-2xl font-bold flex items-center gap-2', theme.text.primary)}>
            <LinkIcon className="h-7 w-7 text-blue-600" />
            Chain of Custody
          </h2>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            Track evidence handling, transfers, and authentication
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={QrCode}>
            Generate Barcode
          </Button>
          <Button variant="secondary" icon={Download}>
            Export Chain
          </Button>
          <Button variant="primary" icon={Plus}>
            Log Evidence
          </Button>
        </div>
      </div>

      {/* Search */}
      {!selectedEvidence && (
        <div className="relative max-w-md">
          <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4', theme.text.tertiary)} />
          <input
            type="text"
            placeholder="Search by evidence number, description, or case..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg border',
              theme.surface.input,
              theme.border.default
            )}
          />
        </div>
      )}

      {/* Evidence List or Detail View */}
      {!selectedEvidence ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEvidence.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-6 rounded-lg border cursor-pointer hover:shadow-md transition-all',
                theme.surface.default,
                theme.border.default
              )}
              onClick={() => setSelectedEvidence(item)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30')}>
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={cn('font-semibold font-mono', theme.text.primary)}>
                      {item.evidenceNumber}
                    </h3>
                    <p className={cn('text-xs', theme.text.tertiary)}>
                      {item.caseNumber}
                    </p>
                  </div>
                </div>
                <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(item.status))}>
                  {getStatusIcon(item.status)}
                  {item.status}
                </span>
              </div>

              <p className={cn('text-sm mb-4', theme.text.secondary)}>
                {item.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className={cn('text-xs mb-1', theme.text.tertiary)}>Type</p>
                  <p className={cn('font-medium capitalize', theme.text.primary)}>{item.type}</p>
                </div>
                <div>
                  <p className={cn('text-xs mb-1', theme.text.tertiary)}>Category</p>
                  <p className={cn('font-medium capitalize', theme.text.primary)}>{item.category}</p>
                </div>
                <div>
                  <p className={cn('text-xs mb-1', theme.text.tertiary)}>Collected</p>
                  <p className={cn('font-medium', theme.text.primary)}>
                    {item.collectedDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className={cn('text-xs mb-1', theme.text.tertiary)}>Chain Integrity</p>
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', getIntegrityColor(item.chainIntegrity))}>
                    {item.chainIntegrity}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {item.sealed && <Shield className="h-4 w-4 text-emerald-600" aria-label="Sealed" />}
                {item.tamperEvident && <Lock className="h-4 w-4 text-blue-600" aria-label="Tamper Evident" />}
                {item.photographed && <Camera className="h-4 w-4 text-purple-600" aria-label="Photographed" />}
                {item.fingerprinted && <Fingerprint className="h-4 w-4 text-amber-600" aria-label="Fingerprinted" />}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Evidence Detail Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className={cn('text-sm hover:underline', theme.text.secondary)}
                >
                  ← Back to List
                </button>
              </div>
              <div className="flex items-center gap-4">
                <h3 className={cn('text-xl font-bold font-mono', theme.text.primary)}>
                  {selectedEvidence.evidenceNumber}
                </h3>
                <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium', getStatusColor(selectedEvidence.status))}>
                  {getStatusIcon(selectedEvidence.status)}
                  {selectedEvidence.status}
                </span>
                <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium', getIntegrityColor(selectedEvidence.chainIntegrity))}>
                  <CheckCircle2 className="h-4 w-4" />
                  Chain {selectedEvidence.chainIntegrity}
                </span>
              </div>
              <p className={cn('text-sm mt-2', theme.text.secondary)}>
                {selectedEvidence.description}
              </p>
            </div>
          </div>

          {/* Evidence Details Card */}
          <div className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}>
            <h4 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
              Evidence Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className={cn('text-xs font-medium mb-1', theme.text.tertiary)}>Case Number</p>
                <p className={cn('text-sm font-medium', theme.text.primary)}>{selectedEvidence.caseNumber}</p>
              </div>
              <div>
                <p className={cn('text-xs font-medium mb-1', theme.text.tertiary)}>Type / Category</p>
                <p className={cn('text-sm font-medium capitalize', theme.text.primary)}>
                  {selectedEvidence.type} / {selectedEvidence.category}
                </p>
              </div>
              <div>
                <p className={cn('text-xs font-medium mb-1', theme.text.tertiary)}>Current Location</p>
                <p className={cn('text-sm font-medium', theme.text.primary)}>{selectedEvidence.location}</p>
              </div>
              <div>
                <p className={cn('text-xs font-medium mb-1', theme.text.tertiary)}>Collected By</p>
                <p className={cn('text-sm font-medium', theme.text.primary)}>{selectedEvidence.collectedBy}</p>
              </div>
              <div>
                <p className={cn('text-xs font-medium mb-1', theme.text.tertiary)}>Collection Date</p>
                <p className={cn('text-sm font-medium', theme.text.primary)}>
                  {selectedEvidence.collectedDate.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={cn('text-xs font-medium mb-1', theme.text.tertiary)}>Collection Location</p>
                <p className={cn('text-sm font-medium', theme.text.primary)}>{selectedEvidence.collectionLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {selectedEvidence.sealed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <span className={cn('text-sm', theme.text.secondary)}>
                  {selectedEvidence.sealed ? 'Sealed' : 'Not Sealed'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedEvidence.tamperEvident ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <span className={cn('text-sm', theme.text.secondary)}>
                  {selectedEvidence.tamperEvident ? 'Tamper-Evident' : 'No Tamper Protection'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedEvidence.photographed && <Camera className="h-5 w-5 text-purple-600" />}
                <span className={cn('text-sm', theme.text.secondary)}>
                  {selectedEvidence.photographed ? 'Photographed' : 'Not Photographed'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedEvidence.fingerprinted && <Fingerprint className="h-5 w-5 text-amber-600" />}
                <span className={cn('text-sm', theme.text.secondary)}>
                  {selectedEvidence.fingerprinted ? 'Fingerprinted' : 'Not Fingerprinted'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={cn('border-b', theme.border.default)}>
            <nav className="flex gap-6">
              {[
                { id: 'transfers', label: 'Custody Transfers', icon: ArrowRight },
                { id: 'handling', label: 'Handling Log', icon: History },
                { id: 'authentication', label: 'Authentication', icon: Fingerprint }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'transfers' | 'handling' | 'authentication')}
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
            {activeTab === 'transfers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className={cn('text-lg font-semibold', theme.text.primary)}>
                    Custody Transfer History
                  </h4>
                  <Button variant="primary" size="sm" icon={Plus}>
                    Record Transfer
                  </Button>
                </div>

                {custodyTransfers
                  .filter(t => selectedEvidence && t.evidenceId === selectedEvidence.id)
                  .sort((a, b) => b.transferDate.getTime() - a.transferDate.getTime())
                  .map((transfer, index, array) => (
                    <motion.div
                      key={transfer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn('p-6 rounded-lg border', theme.surface.default, theme.border.default)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn('p-2 rounded-full bg-blue-100 dark:bg-blue-900/30')}>
                            <ArrowRight className="h-5 w-5 text-blue-600" />
                          </div>
                          {index < array.length - 1 && (
                            <div style={{ backgroundColor: 'var(--color-border)', minHeight: '40px' }} className="w-px h-full mt-2" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className={cn('font-semibold', theme.text.primary)}>
                                Transfer #{array.length - index}
                              </p>
                              <p className={cn('text-sm', theme.text.tertiary)}>
                                {transfer.transferDate.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {transfer.sealIntact ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Seal Intact
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-900/20">
                                  <AlertTriangle className="h-3 w-3" />
                                  Seal Broken
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className={cn('text-xs font-medium mb-1', theme.text.tertiary)}>From</p>
                              <p className={cn('text-sm font-medium', theme.text.primary)}>{transfer.fromPerson}</p>
                              <p className={cn('text-xs', theme.text.tertiary)}>{transfer.fromRole}</p>
                              <p className={cn('text-xs', theme.text.tertiary)}>
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {transfer.fromLocation}
                              </p>
                            </div>
                            <div>
                              <p className={cn('text-xs font-medium mb-1', theme.text.tertiary)}>To</p>
                              <p className={cn('text-sm font-medium', theme.text.primary)}>{transfer.toPerson}</p>
                              <p className={cn('text-xs', theme.text.tertiary)}>{transfer.toRole}</p>
                              <p className={cn('text-xs', theme.text.tertiary)}>
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {transfer.toLocation}
                              </p>
                            </div>
                          </div>

                          <div className={cn('p-3 rounded bg-gray-50 dark:bg-gray-800/50')}>
                            <p className={cn('text-sm', theme.text.secondary)}>
                              <strong>Purpose:</strong> {transfer.purpose}
                            </p>
                            <p className={cn('text-sm mt-1', theme.text.secondary)}>
                              <strong>Condition:</strong> <span className="capitalize">{transfer.condition}</span>
                            </p>
                            {transfer.witnessName && (
                              <p className={cn('text-sm mt-1', theme.text.secondary)}>
                                <strong>Witness:</strong> {transfer.witnessName}
                              </p>
                            )}
                            {transfer.notes && (
                              <p className={cn('text-sm mt-2 italic', theme.text.tertiary)}>
                                {transfer.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {activeTab === 'handling' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className={cn('text-lg font-semibold', theme.text.primary)}>
                    Handling Log
                  </h4>
                  <Button variant="primary" size="sm" icon={Plus}>
                    Log Activity
                  </Button>
                </div>

                {handlingLogs
                  .filter(log => selectedEvidence && log.evidenceId === selectedEvidence.id)
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded bg-purple-100 dark:bg-purple-900/30')}>
                          <Clock className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className={cn('font-semibold capitalize', theme.text.primary)}>
                                {log.action}
                              </p>
                              <p className={cn('text-xs', theme.text.tertiary)}>
                                {log.timestamp.toLocaleString()}
                              </p>
                            </div>
                            {log.duration && (
                              <span className={cn('text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700', theme.text.secondary)}>
                                {log.duration} min
                              </span>
                            )}
                          </div>
                          <p className={cn('text-sm mb-1', theme.text.secondary)}>
                            <strong>Performed by:</strong> {log.performedBy}
                          </p>
                          <p className={cn('text-sm mb-1', theme.text.secondary)}>
                            <strong>Location:</strong> {log.location}
                          </p>
                          <p className={cn('text-sm mb-1', theme.text.secondary)}>
                            <strong>Purpose:</strong> {log.purpose}
                          </p>
                          {log.observations && (
                            <p className={cn('text-sm mt-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20', theme.text.secondary)}>
                              <strong>Observations:</strong> {log.observations}
                            </p>
                          )}
                          {log.witnessPresent && (
                            <p className={cn('text-xs mt-2 flex items-center gap-1', theme.text.tertiary)}>
                              <User className="h-3 w-3" />
                              Witness: {log.witnessName || 'Present'}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {activeTab === 'authentication' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn('p-12 rounded-lg border text-center', theme.surface.default, theme.border.default)}
              >
                <Fingerprint className={cn('h-16 w-16 mx-auto mb-4 opacity-20', theme.text.primary)} />
                <h4 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
                  Authentication Records
                </h4>
                <p className={cn('text-sm', theme.text.secondary)}>
                  Evidence authentication and verification records coming soon
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceChainOfCustody;
