/**
 * NewMatter Component (Default Export)
 * 
 * Unified matter/case creation and editing form combining general matter intake
 * with federal litigation case fields. Supports full CRUD operations.
 * 
 * Features:
 * - Tabbed interface: Intake, Court Info, Parties, Financial, Related Cases
 * - Real-time validation with error feedback
 * - Auto-save functionality
 * - Conflict checking
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Backend-first architecture via DataService
 * 
 * @optimization useMemo for expensive computations, useCallback for event handlers
 * @performance Lazy loading, proper dependency arrays, stale time configuration
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Save, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Building2,
  Users,
  DollarSign,
  Scale,
  Link2,
  Trash2,
  X
} from 'lucide-react';
import { DataService } from '@/services/data/dataService';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { queryClient } from '@/services/infrastructure/queryClient';
import { 
  Case, 
  Matter, 
  CaseStatus, 
  MatterStatus, 
  MatterPriority, 
  MatterType, 
  PracticeArea 
} from '@/types';
import { PATHS } from '@/config/paths.config';
import { Button } from '@/components/atoms/Button';
import { PageHeader } from '@/components/organisms/PageHeader';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { useTheme } from '@/providers/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { cn } from '@/utils/cn';

// Federal Case Type enum
export enum CaseType {
  CIVIL = 'Civil',
  CRIMINAL = 'Criminal',
  FAMILY = 'Family',
  BANKRUPTCY = 'Bankruptcy',
  IMMIGRATION = 'Immigration',
  INTELLECTUAL_PROPERTY = 'Intellectual Property',
  CORPORATE = 'Corporate',
  REAL_ESTATE = 'Real Estate',
  LABOR = 'Labor',
  ENVIRONMENTAL = 'Environmental',
  TAX = 'Tax',
}

interface NewMatterProps {
  /** Matter/Case ID for editing (omit for create mode) */
  id?: string;
  
  /** Callback when user navigates back */
  onBack?: () => void;
  
  /** Callback after successful save */
  onSaved?: (id: string) => void;
}

type TabId = 'intake' | 'court' | 'parties' | 'financial' | 'related';

interface FormData {
  // Core Information (aligned with CreateMatterDto & CreateCaseDto)
  title: string;
  caseNumber: string;
  matterNumber: string;
  description: string;
  type: MatterType | CaseType;
  status: MatterStatus | CaseStatus;
  priority: MatterPriority;
  practiceArea: PracticeArea | string;
  tags?: string[];
  
  // Client & Team (aligned with backend)
  clientName: string;
  clientId: string | null;
  clientEmail?: string;
  clientPhone?: string;
  responsibleAttorneyName: string;
  leadAttorneyId: string | null;
  originatingAttorneyName: string;
  originatingAttorneyId?: string | null;
  assignedTeamId?: string | null;
  
  // Court Information (Federal Litigation - CreateCaseDto fields)
  court: string;
  jurisdiction: string;
  venue?: string;
  judge: string | null;
  referredJudge: string | null;
  magistrateJudge: string | null;
  causeOfAction: string;
  natureOfSuit: string;
  natureOfSuitCode: string;
  juryDemand: 'None' | 'Plaintiff' | 'Defendant' | 'Both';
  
  // Opposing Party (CreateMatterDto fields)
  opposingPartyName?: string;
  opposingCounsel?: string;
  opposingCounselFirm?: string;
  
  // Dates (aligned with backend Date types)
  intakeDate: string;
  openedDate: string;
  filingDate: string;
  trialDate: string | null;
  dateTerminated: string | null;
  targetCloseDate?: string | null;
  closedDate?: string | null;
  statuteOfLimitations?: string | null;
  
  // Financial (aligned with CreateMatterDto decimal fields)
  billingType?: string; // Backend: billingarrangement
  estimatedValue: number;
  budgetAmount: number;
  hourlyRate: number;
  flatFee?: number;
  contingencyPercentage?: number;
  retainerAmount: number;
  
  // Conflict Check (CreateMatterDto fields)
  conflictCheckCompleted?: boolean;
  conflictCheckDate?: string | null;
  conflictCheckStatus?: string;
  conflictCheckNotes?: string;
  
  // Risk Management (CreateMatterDto fields)
  riskLevel?: string;
  riskNotes?: string;
  
  // Resources (CreateMatterDto & CreateCaseDto arrays)
  linkedCaseIds?: string[];
  linkedDocumentIds?: string[];
  relatedCases: Array<{ court: string; caseNumber: string; relationship?: string }>;
  
  // Notes & Metadata (CreateMatterDto fields)
  internalNotes?: string;
  customFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

const NewMatter: React.FC<NewMatterProps> = ({ id, onBack, onSaved }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const isEditMode = Boolean(id);
  
  const navigate = (path: string) => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = `#/${path}`;
    }
  };

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [activeTab, setActiveTab] = useState<TabId>('intake');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    caseNumber: '',
    matterNumber: '',
    description: '',
    type: CaseType.CIVIL,
    status: MatterStatus.INTAKE,
    priority: MatterPriority.MEDIUM,
    practiceArea: PracticeArea.CIVIL_LITIGATION,
    tags: [],
    clientName: '',
    clientId: null,
    clientEmail: '',
    clientPhone: '',
    responsibleAttorneyName: '',
    leadAttorneyId: null,
    originatingAttorneyName: '',
    originatingAttorneyId: null,
    assignedTeamId: null,
    court: '',
    jurisdiction: '',
    venue: '',
    judge: null,
    referredJudge: null,
    magistrateJudge: null,
    causeOfAction: '',
    natureOfSuit: '',
    natureOfSuitCode: '',
    juryDemand: 'None',
    opposingPartyName: '',
    opposingCounsel: '',
    opposingCounselFirm: '',
    intakeDate: new Date().toISOString().split('T')[0],
    openedDate: '',
    filingDate: new Date().toISOString().split('T')[0],
    trialDate: null,
    dateTerminated: null,
    targetCloseDate: null,
    closedDate: null,
    statuteOfLimitations: null,
    billingType: '',
    estimatedValue: 0,
    budgetAmount: 0,
    hourlyRate: 0,
    flatFee: 0,
    contingencyPercentage: 0,
    retainerAmount: 0,
    conflictCheckCompleted: false,
    conflictCheckDate: null,
    conflictCheckStatus: 'pending',
    conflictCheckNotes: '',
    riskLevel: '',
    riskNotes: '',
    linkedCaseIds: [],
    linkedDocumentIds: [],
    relatedCases: [],
    internalNotes: '',
    customFields: {},
    metadata: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictStatus, setConflictStatus] = useState<'pending' | 'clear' | 'conflict'>('pending');

  // ========================================
  // DATA FETCHING
  // ========================================
  
  // Load existing matters for conflict checking (with caching)
  const { data: existingMatters = [] } = useQuery<Matter[]>(
    queryKeys.cases.matters.all(),
    () => DataService.matters.getAll(),
    { staleTime: 60000 } // Cache for 60 seconds
  );

  // Load existing matter/case if editing
  const { isLoading, isError: loadError } = useQuery<Matter | Case | null>(
    id ? queryKeys.cases.matters.detail(id) : ['no-matter'],
    () => {
      if (!id) return Promise.resolve(null);
      return DataService.matters.getById(id).catch(() => DataService.cases.getById(id));
    },
    { 
      staleTime: 30000, // Cache for 30 seconds
      enabled: !!id // Only fetch if id exists
    },
    {
      enabled: !!id,
      onSuccess: (data) => {
        if (data) {
          loadFormData(data);
        }
      }
    }
  );

  // ========================================
  // MUTATIONS
  // ========================================
  
  const createMutation = useMutation(
    (data: Matter | Case) => DataService.matters.add(data as Matter),
    {
      onSuccess: (newItem) => {
        queryClient.invalidate(queryKeys.cases.matters.all());
        queryClient.invalidate(queryKeys.cases.all());
        notify.success('Matter created successfully');
        if (newItem && typeof newItem === 'object' && 'id' in newItem) {
          const itemId = newItem.id as string;
          if (onSaved) {
            onSaved(itemId);
          } else {
            navigate(`${PATHS.MATTERS}/${itemId}`);
          }
        } else {
          navigate(PATHS.MATTERS);
        }
      },
      onError: (error) => {
        notify.error(`Failed to create matter: ${error}`);
      }
    }
  );

  const updateMutation = useMutation(
    ({ itemId, data }: { itemId: string; data: Partial<Matter | Case> }) => 
      DataService.matters.update(itemId, data as Partial<Matter>),
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.cases.matters.all());
        queryClient.invalidate(queryKeys.cases.all());
        if (id) {
          queryClient.invalidate(queryKeys.cases.matters.detail(id));
        }
        notify.success('Matter updated successfully');
        navigate(PATHS.MATTERS);
      },
      onError: (error) => {
        notify.error(`Failed to update matter: ${error}`);
      }
    }
  );

  const deleteMutation = useMutation(
    (itemId: string) => DataService.matters.delete(itemId),
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.cases.matters.all());
        queryClient.invalidate(queryKeys.cases.all());
        notify.success('Matter deleted successfully');
        navigate(PATHS.MATTERS);
      },
      onError: (error) => {
        notify.error(`Failed to delete matter: ${error}`);
      }
    }
  );

  // ========================================
  // HELPERS
  // ========================================
  
  const loadFormData = (data: Matter | Case) => {
    setFormData({
      title: data.title || '',
      caseNumber: (data as Case).caseNumber || '',
      matterNumber: (data as Matter).matterNumber || '',
      description: data.description || '',
      type: data.type || CaseType.CIVIL,
      status: data.status,
      priority: (data as Matter).priority || MatterPriority.MEDIUM,
      practiceArea: ((data as Matter).practiceArea as PracticeArea) || PracticeArea.CIVIL_LITIGATION,
      tags: (data as Matter).tags || [],
      clientName: (data as Matter).clientName || '',
      clientId: (data as Case).clientId || null,
      clientEmail: (data as Matter).clientEmail,
      clientPhone: (data as Matter).clientPhone,
      responsibleAttorneyName: (data as Matter).responsibleAttorneyName || '',
      leadAttorneyId: (data as Case).leadAttorneyId || null,
      originatingAttorneyName: (data as Matter).originatingAttorneyName || '',
      originatingAttorneyId: (data as Matter).originatingAttorneyId || null,
      assignedTeamId: (data as Case).assignedTeamId || null,
      court: (data as Case).court || '',
      jurisdiction: (data as Case).jurisdiction || '',
      venue: (data as Matter).venue,
      judge: (data as Case).judge || null,
      referredJudge: (data as Case).referredJudge || null,
      magistrateJudge: (data as Case).magistrateJudge || null,
      causeOfAction: (data as Case).causeOfAction || '',
      natureOfSuit: (data as Case).natureOfSuit || '',
      natureOfSuitCode: (data as Case).natureOfSuitCode || '',
      juryDemand: ((data as Case).juryDemand as 'None' | 'Plaintiff' | 'Defendant' | 'Both') || 'None',
      opposingPartyName: (data as Matter).opposingPartyName,
      opposingCounsel: typeof (data as Matter).opposingCounsel === 'string' ? (data as Matter).opposingCounsel as string : '',
      opposingCounselFirm: (data as Matter).opposingCounselFirm,
      intakeDate: (data as Matter).intakeDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      openedDate: (data as Matter).openedDate?.split('T')[0] || '',
      filingDate: (data as Case).filingDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      trialDate: (data as Case).trialDate?.split('T')[0] || null,
      dateTerminated: (data as Case).dateTerminated?.split('T')[0] || null,
      targetCloseDate: (data as Matter).targetCloseDate?.split('T')[0] || null,
      closedDate: (data as Matter).closedDate?.split('T')[0] || null,
      statuteOfLimitations: (data as Matter).statute_of_limitations?.split('T')[0] || null,
      billingType: (data as Matter).billingType,
      estimatedValue: (data as Matter).estimatedValue || 0,
      budgetAmount: (data as Matter).budgetAmount || 0,
      hourlyRate: (data as Matter).hourlyRate || 0,
      flatFee: (data as Matter).flatFee || 0,
      contingencyPercentage: (data as Matter).contingencyPercentage || 0,
      retainerAmount: (data as Matter).retainerAmount || 0,
      conflictCheckCompleted: (data as Matter).conflictCheckCompleted || false,
      conflictCheckDate: (data as Matter).conflictCheckDate?.split('T')[0] || null,
      conflictCheckStatus: (data as Matter).conflictCheckStatus,
      conflictCheckNotes: (data as Matter).conflictCheckNotes,
      riskLevel: (data as Matter).riskLevel,
      riskNotes: (data as Matter).riskNotes,
      linkedCaseIds: (data as Matter).linkedCaseIds || [],
      linkedDocumentIds: (data as Matter).linkedDocumentIds || [],
      relatedCases: (data as Case).relatedCases || [],
      internalNotes: (data as Matter).internalNotes,
      customFields: (data as Matter).customFields || {},
      metadata: (data as Case).metadata || {},
    });
  };

  // Auto-generate matter/case number
  const generatedNumber = useMemo(() => {
    if (formData.matterNumber || formData.caseNumber) {
      return formData.matterNumber || formData.caseNumber;
    }
    const year = new Date().getFullYear();
    const count = existingMatters.length + 1;
    return `M${year}-${String(count).padStart(4, '0')}`;
  }, [existingMatters.length, formData.matterNumber, formData.caseNumber]);

  // Conflict checking
  useEffect(() => {
    if (!formData.clientName || formData.clientName.length < 3) {
      setConflictStatus('pending');
      return;
    }

    const hasConflict = existingMatters.some(m => 
      m.clientName?.toLowerCase() === formData.clientName?.toLowerCase() &&
      m.status === MatterStatus.ACTIVE &&
      m.id !== id
    );

    setConflictStatus(hasConflict ? 'conflict' : 'clear');
  }, [formData.clientName, existingMatters, id]);

  // Validate form - memoized to avoid recalculation
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.clientName?.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.responsibleAttorneyName?.trim()) {
      newErrors.responsibleAttorneyName = 'Responsible attorney is required';
    }

    if (conflictStatus === 'conflict') {
      newErrors.conflict = 'Conflict of interest detected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.title, formData.clientName, formData.responsibleAttorneyName, conflictStatus]);

  // ========================================
  // FORM HANDLERS
  // ========================================
  
  const handleChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      notify.error('Please fix validation errors');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        matterNumber: generatedNumber,
        caseNumber: generatedNumber,
        id: id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'current-user', // TODO: Get from auth
      } as Matter & Case;

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ itemId: id, data: dataToSave });
      } else {
        await createMutation.mutateAsync(dataToSave as Matter);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [id, deleteMutation]);

  const handleCancel = useCallback(() => {
    navigate(PATHS.MATTERS);
  }, [navigate]);

  const addRelatedCase = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      relatedCases: [...prev.relatedCases, { court: '', caseNumber: '', relationship: '' }]
    }));
  }, []);

  const removeRelatedCase = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedCases: prev.relatedCases.filter((_, i) => i !== index)
    }));
  }, []);

  const updateRelatedCase = useCallback((index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      relatedCases: prev.relatedCases.map((rc, i) => 
        i === index ? { ...rc, [field]: value } : rc
      )
    }));
  }, []);

  // ========================================
  // TABS CONFIGURATION
  // ========================================
  
  const tabs = [
    { id: 'intake', label: 'Intake & Basic Info', icon: FileText },
    { id: 'court', label: 'Court Information', icon: Scale },
    { id: 'parties', label: 'Parties & Team', icon: Users },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'related', label: 'Related Cases', icon: Link2 },
  ] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className={cn("h-full flex flex-col", theme.background)}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <Breadcrumbs 
          items={[
            { label: 'Matter Management', onClick: handleCancel },
            { label: isEditMode ? 'Edit Matter' : 'New Matter' }
          ]}
        />

        <div className="mt-4">
          <PageHeader
            title={isEditMode ? 'Edit Matter' : 'New Matter'}
            subtitle="Federal litigation case and matter management"
            actions={
              <div className="flex items-center gap-3">
                {isEditMode && (
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={saving || deleting}
                    icon={Trash2}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={saving || deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={saving || deleting || conflictStatus === 'conflict'}
                  icon={Save}
                >
                  {saving ? 'Saving...' : isEditMode ? 'Update' : 'Create Matter'}
                </Button>
              </div>
            }
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Global Errors */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Conflict Warning */}
          {conflictStatus === 'conflict' && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">⚠️ Conflict of Interest Detected - Review Required</span>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            {/* INTAKE TAB */}
            {activeTab === 'intake' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Intake & Basic Information
                </h2>

                {/* Matter/Case Number */}
                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Matter/Case Number
                  </label>
                  <input
                    id="number"
                    type="text"
                    value={generatedNumber}
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Auto-generated
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={cn(
                      "w-full px-4 py-2 border rounded-lg",
                      errors.title
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    )}
                    placeholder="e.g., Smith v. Johnson Contract Dispute"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.title}</p>
                  )}
                </div>

                {/* Client Name */}
                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Client Name *
                  </label>
                  <div className="relative">
                    <input
                      id="clientName"
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg",
                        errors.clientName
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      )}
                      placeholder="Client or party name"
                    />
                    {formData.clientName && formData.clientName.length >= 3 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {conflictStatus === 'clear' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : conflictStatus === 'conflict' ? (
                          <AlertCircle className="w-5 h-5 text-rose-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.clientName}</p>
                  )}
                  {conflictStatus === 'clear' && formData.clientName.length >= 3 && (
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">✓ No conflicts found</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    placeholder="Brief description of the matter..."
                  />
                </div>

                {/* Type, Status, Priority */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Type
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    >
                      {Object.entries(CaseType).map(([key, value]) => (
                        <option key={key} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    >
                      {Object.entries(MatterStatus).map(([key, value]) => (
                        <option key={key} value={value}>{value.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    >
                      {Object.entries(MatterPriority).map(([key, value]) => (
                        <option key={key} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Practice Area */}
                <div>
                  <label htmlFor="practiceArea" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Practice Area
                  </label>
                  <select
                    id="practiceArea"
                    value={formData.practiceArea}
                    onChange={(e) => handleChange('practiceArea', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                  >
                    {Object.entries(PracticeArea).map(([key, value]) => (
                      <option key={key} value={value}>
                        {value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="intakeDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Intake Date
                    </label>
                    <input
                      id="intakeDate"
                      type="date"
                      value={formData.intakeDate}
                      onChange={(e) => handleChange('intakeDate', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="openedDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Opened Date
                    </label>
                    <input
                      id="openedDate"
                      type="date"
                      value={formData.openedDate}
                      onChange={(e) => handleChange('openedDate', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* COURT TAB */}
            {activeTab === 'court' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Court Information
                </h2>

                {/* Court & Jurisdiction */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="court" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Court
                    </label>
                    <input
                      id="court"
                      type="text"
                      value={formData.court}
                      onChange={(e) => handleChange('court', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="e.g., U.S. District Court, Southern District of New York"
                    />
                  </div>

                  <div>
                    <label htmlFor="jurisdiction" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Jurisdiction
                    </label>
                    <input
                      id="jurisdiction"
                      type="text"
                      value={formData.jurisdiction}
                      onChange={(e) => handleChange('jurisdiction', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="e.g., Federal, New York"
                    />
                  </div>
                </div>

                {/* Judges */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="judge" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Presiding Judge
                    </label>
                    <input
                      id="judge"
                      type="text"
                      value={formData.judge || ''}
                      onChange={(e) => handleChange('judge', e.target.value || null)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="Judge name"
                    />
                  </div>

                  <div>
                    <label htmlFor="referredJudge" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Referred Judge
                    </label>
                    <input
                      id="referredJudge"
                      type="text"
                      value={formData.referredJudge || ''}
                      onChange={(e) => handleChange('referredJudge', e.target.value || null)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="Referred judge name"
                    />
                  </div>

                  <div>
                    <label htmlFor="magistrateJudge" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Magistrate Judge
                    </label>
                    <input
                      id="magistrateJudge"
                      type="text"
                      value={formData.magistrateJudge || ''}
                      onChange={(e) => handleChange('magistrateJudge', e.target.value || null)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="Magistrate name"
                    />
                  </div>
                </div>

                {/* Federal Litigation Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="causeOfAction" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Cause of Action
                    </label>
                    <input
                      id="causeOfAction"
                      type="text"
                      value={formData.causeOfAction}
                      onChange={(e) => handleChange('causeOfAction', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="e.g., Breach of Contract"
                    />
                  </div>

                  <div>
                    <label htmlFor="natureOfSuit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nature of Suit
                    </label>
                    <input
                      id="natureOfSuit"
                      type="text"
                      value={formData.natureOfSuit}
                      onChange={(e) => handleChange('natureOfSuit', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="Nature of suit description"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="natureOfSuitCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nature of Suit Code
                    </label>
                    <input
                      id="natureOfSuitCode"
                      type="text"
                      value={formData.natureOfSuitCode}
                      onChange={(e) => handleChange('natureOfSuitCode', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="e.g., 110, 190"
                    />
                  </div>

                  <div>
                    <label htmlFor="juryDemand" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Jury Demand
                    </label>
                    <select
                      id="juryDemand"
                      value={formData.juryDemand}
                      onChange={(e) => handleChange('juryDemand', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    >
                      <option value="None">None</option>
                      <option value="Plaintiff">Plaintiff</option>
                      <option value="Defendant">Defendant</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                {/* Case Dates */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="filingDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Filing Date
                    </label>
                    <input
                      id="filingDate"
                      type="date"
                      value={formData.filingDate}
                      onChange={(e) => handleChange('filingDate', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="trialDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Trial Date
                    </label>
                    <input
                      id="trialDate"
                      type="date"
                      value={formData.trialDate || ''}
                      onChange={(e) => handleChange('trialDate', e.target.value || null)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="dateTerminated" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Date Terminated
                    </label>
                    <input
                      id="dateTerminated"
                      type="date"
                      value={formData.dateTerminated || ''}
                      onChange={(e) => handleChange('dateTerminated', e.target.value || null)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PARTIES TAB */}
            {activeTab === 'parties' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Parties & Team Assignment
                </h2>

                <div>
                  <label htmlFor="responsibleAttorneyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Responsible Attorney *
                  </label>
                  <input
                    id="responsibleAttorneyName"
                    type="text"
                    value={formData.responsibleAttorneyName}
                    onChange={(e) => handleChange('responsibleAttorneyName', e.target.value)}
                    className={cn(
                      "w-full px-4 py-2 border rounded-lg",
                      errors.responsibleAttorneyName
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    )}
                    placeholder="Attorney name"
                  />
                  {errors.responsibleAttorneyName && (
                    <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.responsibleAttorneyName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="originatingAttorneyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Originating Attorney
                  </label>
                  <input
                    id="originatingAttorneyName"
                    type="text"
                    value={formData.originatingAttorneyName}
                    onChange={(e) => handleChange('originatingAttorneyName', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    placeholder="Attorney who originated the matter"
                  />
                </div>

                {/* Opposing Party Section */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Opposing Party
                  </h3>

                  <div>
                    <label htmlFor="opposingPartyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Opposing Party Name
                    </label>
                    <input
                      id="opposingPartyName"
                      type="text"
                      value={formData.opposingPartyName || ''}
                      onChange={(e) => handleChange('opposingPartyName', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      placeholder="Name of opposing party"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="opposingCounsel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Opposing Counsel
                      </label>
                      <input
                        id="opposingCounsel"
                        type="text"
                        value={formData.opposingCounsel || ''}
                        onChange={(e) => handleChange('opposingCounsel', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                        placeholder="Attorney name"
                      />
                    </div>

                    <div>
                      <label htmlFor="opposingCounselFirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Opposing Counsel Firm
                      </label>
                      <input
                        id="opposingCounselFirm"
                        type="text"
                        value={formData.opposingCounselFirm || ''}
                        onChange={(e) => handleChange('opposingCounselFirm', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                        placeholder="Law firm name"
                      />
                    </div>
                  </div>
                </div>

                {/* Conflict Check Section */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Conflict Check
                  </h3>

                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.conflictCheckCompleted || false}
                        onChange={(e) => handleChange('conflictCheckCompleted', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Conflict Check Completed
                      </span>
                    </label>
                  </div>

                  {formData.conflictCheckCompleted && (
                    <div>
                      <label htmlFor="conflictCheckDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Conflict Check Date
                      </label>
                      <input
                        id="conflictCheckDate"
                        type="date"
                        value={formData.conflictCheckDate || ''}
                        onChange={(e) => handleChange('conflictCheckDate', e.target.value || null)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <label htmlFor="conflictCheckNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Conflict Check Notes
                    </label>
                    <textarea
                      id="conflictCheckNotes"
                      value={formData.conflictCheckNotes || ''}
                      onChange={(e) => handleChange('conflictCheckNotes', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      rows={3}
                      placeholder="Notes about conflict check findings..."
                    />
                  </div>
                </div>

                {/* Risk Management Section */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Risk Management
                  </h3>

                  <div>
                    <label htmlFor="riskLevel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Risk Level
                    </label>
                    <select
                      id="riskLevel"
                      value={formData.riskLevel || ''}
                      onChange={(e) => handleChange('riskLevel', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                    >
                      <option value="">Select risk level...</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="riskNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Risk Notes
                    </label>
                    <textarea
                      id="riskNotes"
                      value={formData.riskNotes || ''}
                      onChange={(e) => handleChange('riskNotes', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      rows={3}
                      placeholder="Describe potential risks and mitigation strategies..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Financial Information
                </h2>

                {/* Billing Type */}
                <div>
                  <label htmlFor="billingType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Billing Type
                  </label>
                  <select
                    id="billingType"
                    value={formData.billingType || ''}
                    onChange={(e) => handleChange('billingType', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                  >
                    <option value="">Select billing type...</option>
                    <option value="hourly">Hourly</option>
                    <option value="flat_fee">Flat Fee</option>
                    <option value="contingency">Contingency</option>
                    <option value="retainer">Retainer</option>
                    <option value="blended">Blended</option>
                    <option value="value_based">Value Based</option>
                    <option value="pro_bono">Pro Bono</option>
                  </select>
                </div>

                {/* Value and Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="estimatedValue" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Estimated Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        id="estimatedValue"
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => handleChange('estimatedValue', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="budgetAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Budget Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        id="budgetAmount"
                        type="number"
                        value={formData.budgetAmount}
                        onChange={(e) => handleChange('budgetAmount', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Hourly Rate & Retainer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Hourly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        id="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="retainerAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Retainer Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        id="retainerAmount"
                        type="number"
                        value={formData.retainerAmount}
                        onChange={(e) => handleChange('retainerAmount', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Flat Fee & Contingency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="flatFee" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Flat Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        id="flatFee"
                        type="number"
                        value={formData.flatFee || 0}
                        onChange={(e) => handleChange('flatFee', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contingencyPercentage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Contingency Percentage
                    </label>
                    <div className="relative">
                      <input
                        id="contingencyPercentage"
                        type="number"
                        value={formData.contingencyPercentage || 0}
                        onChange={(e) => handleChange('contingencyPercentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">%</span>
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Important Dates
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="targetCloseDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Target Close Date
                      </label>
                      <input
                        id="targetCloseDate"
                        type="date"
                        value={formData.targetCloseDate || ''}
                        onChange={(e) => handleChange('targetCloseDate', e.target.value || null)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="statuteOfLimitations" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Statute of Limitations
                      </label>
                      <input
                        id="statuteOfLimitations"
                        type="date"
                        value={formData.statuteOfLimitations || ''}
                        onChange={(e) => handleChange('statuteOfLimitations', e.target.value || null)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Internal Notes
                  </h3>

                  <div>
                    <label htmlFor="internalNotes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Notes (Internal Only)
                    </label>
                    <textarea
                      id="internalNotes"
                      value={formData.internalNotes || ''}
                      onChange={(e) => handleChange('internalNotes', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      rows={5}
                      placeholder="Internal notes, strategy notes, confidential information..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RELATED CASES TAB */}
            {activeTab === 'related' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Related Cases
                  </h2>
                  <Button
                    variant="secondary"
                    onClick={addRelatedCase}
                    icon={Link2}
                  >
                    Add Related Case
                  </Button>
                </div>

                {formData.relatedCases.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No related cases. Click "Add Related Case" to link a case.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.relatedCases.map((rc, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={rc.court}
                            onChange={(e) => updateRelatedCase(index, 'court', e.target.value)}
                            placeholder="Court"
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                          />
                          <input
                            type="text"
                            value={rc.caseNumber}
                            onChange={(e) => updateRelatedCase(index, 'caseNumber', e.target.value)}
                            placeholder="Case Number"
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                          />
                          <input
                            type="text"
                            value={rc.relationship || ''}
                            onChange={(e) => updateRelatedCase(index, 'relationship', e.target.value)}
                            placeholder="Relationship (optional)"
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRelatedCase(index)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
                          aria-label="Remove related case"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this matter? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                icon={Trash2}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMatter;
