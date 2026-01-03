/**
 * Case Templates Component
 *
 * Matter template management for different practice areas:
 * - Pre-configured templates for common case types
 * - Quick case creation from templates
 * - Template customization and cloning
 * - Practice area categorization
 * - Template library management
 *
 * @module components/enterprise/CaseManagement/CaseTemplates
 */

import React, { useState, useMemo } from 'react';
import { Case, MatterType, CaseStatus } from '@/types';
import { cn } from '@/lib/utils';
import {
  Plus, Copy, Edit, Trash2, Star, Search,
  FileText, Scale, Building, Users, Heart,
  Briefcase, Home, Shield, DollarSign, Check,
  ChevronRight, Filter, MoreVertical, X
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  practiceArea: PracticeArea;
  matterType: MatterType;
  icon: React.ElementType;
  fields: TemplateField[];
  defaultValues: Partial<Case>;
  checklist: ChecklistItem[];
  documents: TemplateDocument[];
  milestones: TemplateMilestone[];
  estimatedDuration?: number; // in days
  estimatedBudget?: number;
  isStarred?: boolean;
  usageCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea';
  required: boolean;
  options?: string[];
  defaultValue?: any;
  helpText?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  order: number;
  category?: string;
  dueInDays?: number;
}

export interface TemplateDocument {
  id: string;
  name: string;
  type: 'pleading' | 'motion' | 'discovery' | 'brief' | 'contract' | 'form';
  required: boolean;
  templateUrl?: string;
}

export interface TemplateMilestone {
  id: string;
  name: string;
  daysFromStart: number;
  description?: string;
}

export type PracticeArea =
  | 'Litigation'
  | 'Corporate'
  | 'Real Estate'
  | 'Family Law'
  | 'Estate Planning'
  | 'Employment'
  | 'Intellectual Property'
  | 'Immigration'
  | 'Personal Injury'
  | 'Criminal Defense';

export interface CaseTemplatesProps {
  templates?: CaseTemplate[];
  onCreateFromTemplate?: (template: CaseTemplate, customValues?: Partial<Case>) => void;
  onEditTemplate?: (template: CaseTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onCloneTemplate?: (templateId: string) => void;
  className?: string;
}

// ============================================================================
// Default Templates
// ============================================================================

const PRACTICE_AREA_ICONS: Record<PracticeArea, React.ElementType> = {
  'Litigation': Scale,
  'Corporate': Building,
  'Real Estate': Home,
  'Family Law': Heart,
  'Estate Planning': FileText,
  'Employment': Users,
  'Intellectual Property': Shield,
  'Immigration': Users,
  'Personal Injury': Heart,
  'Criminal Defense': Shield,
};

const DEFAULT_TEMPLATES: CaseTemplate[] = [
  {
    id: 'lit-civil-1',
    name: 'Civil Litigation - Breach of Contract',
    description: 'Standard template for breach of contract cases',
    practiceArea: 'Litigation',
    matterType: MatterType.LITIGATION,
    icon: Scale,
    fields: [
      { id: 'contractDate', label: 'Contract Date', type: 'date', required: true },
      { id: 'breachDate', label: 'Date of Breach', type: 'date', required: true },
      { id: 'damagesAmount', label: 'Damages Claimed', type: 'number', required: true },
      { id: 'contractType', label: 'Contract Type', type: 'select', required: true, options: ['Service', 'Purchase', 'Employment', 'Lease'] },
    ],
    defaultValues: {
      status: CaseStatus.PreFiling,
      practiceArea: 'Litigation',
      matterType: MatterType.LITIGATION,
    },
    checklist: [
      { id: 'cl-1', title: 'Obtain and review contract', order: 1, category: 'Initial Review', dueInDays: 3 },
      { id: 'cl-2', title: 'Interview client regarding breach', order: 2, category: 'Initial Review', dueInDays: 5 },
      { id: 'cl-3', title: 'Calculate damages', order: 3, category: 'Case Evaluation', dueInDays: 7 },
      { id: 'cl-4', title: 'Draft demand letter', order: 4, category: 'Pre-Litigation', dueInDays: 10 },
      { id: 'cl-5', title: 'File complaint if necessary', order: 5, category: 'Litigation', dueInDays: 60 },
    ],
    documents: [
      { id: 'doc-1', name: 'Complaint', type: 'pleading', required: true },
      { id: 'doc-2', name: 'Summons', type: 'pleading', required: true },
      { id: 'doc-3', name: 'Demand Letter', type: 'form', required: false },
    ],
    milestones: [
      { id: 'ms-1', name: 'Case Intake Complete', daysFromStart: 7 },
      { id: 'ms-2', name: 'Demand Letter Sent', daysFromStart: 30 },
      { id: 'ms-3', name: 'Complaint Filed', daysFromStart: 90 },
      { id: 'ms-4', name: 'Discovery Complete', daysFromStart: 180 },
    ],
    estimatedDuration: 365,
    estimatedBudget: 50000,
    usageCount: 24,
  },
  {
    id: 'corp-formation-1',
    name: 'Corporate Formation',
    description: 'Template for forming new corporations and LLCs',
    practiceArea: 'Corporate',
    matterType: MatterType.TRANSACTIONAL,
    icon: Building,
    fields: [
      { id: 'entityType', label: 'Entity Type', type: 'select', required: true, options: ['C-Corp', 'S-Corp', 'LLC', 'Partnership'] },
      { id: 'state', label: 'State of Formation', type: 'select', required: true, options: ['DE', 'CA', 'NY', 'TX', 'FL'] },
      { id: 'capitalRaise', label: 'Initial Capital', type: 'number', required: false },
    ],
    defaultValues: {
      status: CaseStatus.Active,
      practiceArea: 'Corporate',
      matterType: MatterType.TRANSACTIONAL,
    },
    checklist: [
      { id: 'cl-1', title: 'Client consultation on entity structure', order: 1, dueInDays: 1 },
      { id: 'cl-2', title: 'Name availability search', order: 2, dueInDays: 2 },
      { id: 'cl-3', title: 'Prepare articles of incorporation/organization', order: 3, dueInDays: 5 },
      { id: 'cl-4', title: 'File formation documents', order: 4, dueInDays: 7 },
      { id: 'cl-5', title: 'Draft bylaws/operating agreement', order: 5, dueInDays: 10 },
      { id: 'cl-6', title: 'Obtain EIN', order: 6, dueInDays: 14 },
    ],
    documents: [
      { id: 'doc-1', name: 'Articles of Incorporation', type: 'form', required: true },
      { id: 'doc-2', name: 'Bylaws/Operating Agreement', type: 'contract', required: true },
      { id: 'doc-3', name: 'Stock Certificates', type: 'form', required: false },
    ],
    milestones: [
      { id: 'ms-1', name: 'Formation Documents Filed', daysFromStart: 7 },
      { id: 'ms-2', name: 'Entity Approved', daysFromStart: 14 },
      { id: 'ms-3', name: 'Corporate Records Complete', daysFromStart: 21 },
    ],
    estimatedDuration: 30,
    estimatedBudget: 5000,
    usageCount: 18,
  },
  {
    id: 're-transaction-1',
    name: 'Real Estate Purchase/Sale',
    description: 'Template for residential and commercial real estate transactions',
    practiceArea: 'Real Estate',
    matterType: MatterType.TRANSACTIONAL,
    icon: Home,
    fields: [
      { id: 'propertyAddress', label: 'Property Address', type: 'textarea', required: true },
      { id: 'purchasePrice', label: 'Purchase Price', type: 'number', required: true },
      { id: 'closingDate', label: 'Target Closing Date', type: 'date', required: true },
      { id: 'propertyType', label: 'Property Type', type: 'select', required: true, options: ['Residential', 'Commercial', 'Industrial', 'Land'] },
    ],
    defaultValues: {
      status: CaseStatus.Active,
      practiceArea: 'Real Estate',
      matterType: MatterType.TRANSACTIONAL,
    },
    checklist: [
      { id: 'cl-1', title: 'Review purchase agreement', order: 1, dueInDays: 1 },
      { id: 'cl-2', title: 'Order title search', order: 2, dueInDays: 3 },
      { id: 'cl-3', title: 'Review title report', order: 3, dueInDays: 10 },
      { id: 'cl-4', title: 'Coordinate inspections', order: 4, dueInDays: 14 },
      { id: 'cl-5', title: 'Review financing documents', order: 5, dueInDays: 21 },
      { id: 'cl-6', title: 'Prepare closing documents', order: 6, dueInDays: 28 },
      { id: 'cl-7', title: 'Attend closing', order: 7, dueInDays: 30 },
    ],
    documents: [
      { id: 'doc-1', name: 'Purchase Agreement', type: 'contract', required: true },
      { id: 'doc-2', name: 'Title Commitment', type: 'form', required: true },
      { id: 'doc-3', name: 'Deed', type: 'form', required: true },
      { id: 'doc-4', name: 'Closing Statement', type: 'form', required: true },
    ],
    milestones: [
      { id: 'ms-1', name: 'Contract Signed', daysFromStart: 1 },
      { id: 'ms-2', name: 'Title Search Complete', daysFromStart: 10 },
      { id: 'ms-3', name: 'Inspections Complete', daysFromStart: 14 },
      { id: 'ms-4', name: 'Closing', daysFromStart: 30 },
    ],
    estimatedDuration: 30,
    estimatedBudget: 3000,
    usageCount: 31,
  },
  {
    id: 'family-divorce-1',
    name: 'Divorce - Contested',
    description: 'Template for contested divorce proceedings',
    practiceArea: 'Family Law',
    matterType: MatterType.LITIGATION,
    icon: Heart,
    fields: [
      { id: 'marriageDate', label: 'Date of Marriage', type: 'date', required: true },
      { id: 'separationDate', label: 'Date of Separation', type: 'date', required: false },
      { id: 'hasChildren', label: 'Children Involved', type: 'select', required: true, options: ['Yes', 'No'] },
      { id: 'custody', label: 'Custody Type', type: 'select', required: false, options: ['Joint', 'Sole', 'To Be Determined'] },
    ],
    defaultValues: {
      status: CaseStatus.Active,
      practiceArea: 'Family Law',
      matterType: MatterType.LITIGATION,
    },
    checklist: [
      { id: 'cl-1', title: 'Initial client consultation', order: 1, dueInDays: 1 },
      { id: 'cl-2', title: 'Gather financial documents', order: 2, dueInDays: 7 },
      { id: 'cl-3', title: 'File petition for dissolution', order: 3, dueInDays: 14 },
      { id: 'cl-4', title: 'Serve papers on spouse', order: 4, dueInDays: 21 },
      { id: 'cl-5', title: 'Financial disclosures', order: 5, dueInDays: 60 },
      { id: 'cl-6', title: 'Mediation session', order: 6, dueInDays: 90 },
    ],
    documents: [
      { id: 'doc-1', name: 'Petition for Dissolution', type: 'pleading', required: true },
      { id: 'doc-2', name: 'Financial Affidavit', type: 'form', required: true },
      { id: 'doc-3', name: 'Parenting Plan', type: 'form', required: false },
      { id: 'doc-4', name: 'Settlement Agreement', type: 'contract', required: false },
    ],
    milestones: [
      { id: 'ms-1', name: 'Petition Filed', daysFromStart: 14 },
      { id: 'ms-2', name: 'Spouse Served', daysFromStart: 21 },
      { id: 'ms-3', name: 'Discovery Complete', daysFromStart: 90 },
      { id: 'ms-4', name: 'Mediation', daysFromStart: 120 },
    ],
    estimatedDuration: 365,
    estimatedBudget: 25000,
    usageCount: 12,
  },
  {
    id: 'pi-auto-1',
    name: 'Personal Injury - Auto Accident',
    description: 'Template for automobile accident personal injury claims',
    practiceArea: 'Personal Injury',
    matterType: MatterType.LITIGATION,
    icon: Heart,
    fields: [
      { id: 'accidentDate', label: 'Date of Accident', type: 'date', required: true },
      { id: 'injuryType', label: 'Type of Injury', type: 'multiselect', required: true, options: ['Whiplash', 'Broken Bones', 'TBI', 'Soft Tissue', 'Other'] },
      { id: 'insurer', label: 'Insurance Company', type: 'text', required: true },
      { id: 'atFault', label: 'At-Fault Party', type: 'text', required: true },
    ],
    defaultValues: {
      status: CaseStatus.Active,
      practiceArea: 'Personal Injury',
      matterType: MatterType.LITIGATION,
      billingModel: 'contingency' as any,
    },
    checklist: [
      { id: 'cl-1', title: 'Obtain police report', order: 1, dueInDays: 3 },
      { id: 'cl-2', title: 'Gather medical records', order: 2, dueInDays: 7 },
      { id: 'cl-3', title: 'Photograph evidence', order: 3, dueInDays: 5 },
      { id: 'cl-4', title: 'Send demand letter to insurer', order: 4, dueInDays: 60 },
      { id: 'cl-5', title: 'File lawsuit if no settlement', order: 5, dueInDays: 120 },
    ],
    documents: [
      { id: 'doc-1', name: 'Retainer Agreement', type: 'contract', required: true },
      { id: 'doc-2', name: 'Medical Authorization', type: 'form', required: true },
      { id: 'doc-3', name: 'Demand Letter', type: 'form', required: true },
      { id: 'doc-4', name: 'Complaint', type: 'pleading', required: false },
    ],
    milestones: [
      { id: 'ms-1', name: 'Case Accepted', daysFromStart: 1 },
      { id: 'ms-2', name: 'Medical Treatment Complete', daysFromStart: 90 },
      { id: 'ms-3', name: 'Demand Sent', daysFromStart: 120 },
      { id: 'ms-4', name: 'Settlement/Trial', daysFromStart: 365 },
    ],
    estimatedDuration: 365,
    estimatedBudget: 15000,
    usageCount: 45,
  },
];

// ============================================================================
// Component
// ============================================================================

export const CaseTemplates: React.FC<CaseTemplatesProps> = ({
  templates = DEFAULT_TEMPLATES,
  onCreateFromTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onCloneTemplate,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<PracticeArea | 'All'>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<CaseTemplate | null>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);

  // Get unique practice areas
  const practiceAreas = useMemo(() => {
    const areas = new Set(templates.map(t => t.practiceArea));
    return ['All', ...Array.from(areas)] as const;
  }, [templates]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.practiceArea.toLowerCase().includes(query)
      );
    }

    if (selectedPracticeArea !== 'All') {
      result = result.filter(t => t.practiceArea === selectedPracticeArea);
    }

    return result.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  }, [templates, searchQuery, selectedPracticeArea]);

  const handleTemplateSelect = (template: CaseTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDetail(true);
  };

  const handleCreateCase = () => {
    if (selectedTemplate) {
      onCreateFromTemplate?.(selectedTemplate);
      setShowTemplateDetail(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className={cn('flex flex-col h-full space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Case Templates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Start new cases quickly with pre-configured templates
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {practiceAreas.map(area => (
            <button
              key={area}
              onClick={() => setSelectedPracticeArea(area as PracticeArea | 'All')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                selectedPracticeArea === area
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              {area !== 'All' && React.createElement(PRACTICE_AREA_ICONS[area as PracticeArea], { className: 'h-4 w-4' })}
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer dark:border-gray-700 dark:bg-gray-800"
            onClick={() => handleTemplateSelect(template)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                  <template.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{template.practiceArea}</p>
                </div>
              </div>
              {template.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {template.description}
            </p>

            {/* Metadata */}
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {template.checklist.length} tasks
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {template.estimatedBudget ? `$${(template.estimatedBudget / 1000).toFixed(0)}k` : 'Varies'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>~{template.estimatedDuration} days</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Used {template.usageCount || 0} times
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFromTemplate?.(template);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Use Template
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloneTemplate?.(template.id);
                }}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Template Detail Modal */}
      {showTemplateDetail && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                    <selectedTemplate.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedTemplate.practiceArea} • {selectedTemplate.matterType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplateDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated Duration</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedTemplate.estimatedDuration} days
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated Budget</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${(selectedTemplate.estimatedBudget || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Usage Count</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedTemplate.usageCount || 0} times
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Checklist ({selectedTemplate.checklist.length} items)
                </h3>
                <div className="space-y-2">
                  {selectedTemplate.checklist.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                      <div className="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        {item.dueInDays && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due in {item.dueInDays} days
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedTemplate.checklist.length > 5 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      + {selectedTemplate.checklist.length - 5} more items
                    </p>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Required Documents ({selectedTemplate.documents.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTemplate.documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded dark:bg-gray-700">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{doc.name}</span>
                      {doc.required && (
                        <span className="ml-auto text-xs text-red-600 dark:text-red-400">Required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Key Milestones
                </h3>
                <div className="space-y-3">
                  {selectedTemplate.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        {index < selectedTemplate.milestones.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {milestone.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Day {milestone.daysFromStart}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowTemplateDetail(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onEditTemplate?.(selectedTemplate)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Edit Template
                </button>
                <button
                  onClick={handleCreateCase}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Create Case from Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
