'use client';

/**
 * Coding Panel Component
 * Document coding controls for responsiveness, privilege, and tags
 *
 * Features:
 * - Responsiveness, privilege, and confidentiality coding
 * - Issue codes and tags management
 * - Review notes
 * - Save & Next workflow for efficient review
 * - Auto-reset form state when document changes
 */

import { useState, useTransition } from 'react';
import { Button, Badge, Input } from '@/components/ui';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Shield,
  Save,
  ChevronRight,
  Flag,
  Plus,
  X,
} from 'lucide-react';
import { updateDocumentCoding, updateReviewStatus } from '../../../_actions';
import type {
  ReviewDocument,
  DocumentCodingResponsiveValue,
  DocumentCodingPrivilegedValue,
} from '../../../_types';

interface CodingPanelProps {
  document: ReviewDocument;
  onUpdate?: () => void;
  onSaveAndNext?: () => void;
  hasNext?: boolean;
}

const responsiveOptions: {
  value: DocumentCodingResponsiveValue;
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  { value: 'yes', label: 'Responsive', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  { value: 'no', label: 'Not Responsive', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
  { value: 'maybe', label: 'Maybe', color: 'bg-amber-500', icon: <HelpCircle className="h-4 w-4" /> },
];

const privilegeOptions: {
  value: DocumentCodingPrivilegedValue;
  label: string;
  description: string;
}[] = [
  { value: 'yes', label: 'Privileged', description: 'Attorney-client or work product' },
  { value: 'no', label: 'Not Privileged', description: 'No privilege applies' },
  { value: 'partial', label: 'Partially Privileged', description: 'Requires redaction' },
];

const confidentialityOptions = [
  { value: 'public', label: 'Public', description: 'No restrictions' },
  { value: 'confidential', label: 'Confidential', description: 'Standard confidentiality' },
  { value: 'highly_confidential', label: 'Highly Confidential', description: 'Attorneys eyes only' },
];

export function CodingPanel({ document, onUpdate, onSaveAndNext, hasNext = false }: CodingPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [responsive, setResponsive] = useState<DocumentCodingResponsiveValue>(document.coding.responsive);
  const [privileged, setPrivileged] = useState<DocumentCodingPrivilegedValue>(document.coding.privileged);
  const [confidentiality, setConfidentiality] = useState(document.coding.confidentiality || 'not_coded');
  const [issueCode, setIssueCode] = useState(document.coding.issueCode || '');
  const [notes, setNotes] = useState(document.notes || '');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(document.tags || []);
  const [showPrivilegeDetails, setShowPrivilegeDetails] = useState(false);

  // Note: Form state is reset when document changes via key prop in parent component
  // This causes React to remount the CodingPanel with fresh state from the new document

  const handleSave = () => {
    startTransition(async () => {
      await updateDocumentCoding(document.id, {
        responsive,
        privileged,
        confidentiality: confidentiality as 'public' | 'confidential' | 'highly_confidential',
        issueCode,
        notes,
        tags,
      });
      onUpdate?.();
    });
  };

  // Save coding and automatically advance to next document
  const handleSaveAndNext = () => {
    startTransition(async () => {
      // Save coding first
      await updateDocumentCoding(document.id, {
        responsive,
        privileged,
        confidentiality: confidentiality as 'public' | 'confidential' | 'highly_confidential',
        issueCode,
        notes,
        tags,
      });
      // Mark as reviewed
      await updateReviewStatus(document.id, 'reviewed');
      // Trigger save and next callback
      onSaveAndNext?.();
    });
  };

  const handleMarkReviewed = () => {
    startTransition(async () => {
      await updateReviewStatus(document.id, 'reviewed');
      onUpdate?.();
    });
  };

  const handleFlag = () => {
    startTransition(async () => {
      await updateReviewStatus(document.id, 'flagged');
      onUpdate?.();
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Document Coding
          </h3>
          <Badge
            variant={
              document.reviewStatus === 'reviewed'
                ? 'success'
                : document.reviewStatus === 'flagged'
                  ? 'warning'
                  : 'default'
            }
          >
            {document.reviewStatus.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Responsiveness */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Responsiveness
          </label>
          <div className="grid grid-cols-3 gap-2">
            {responsiveOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setResponsive(option.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  responsive === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`p-2 rounded-full text-white ${option.color}`}>
                  {option.icon}
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Privilege */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Privilege Status
            </label>
            <button
              onClick={() => setShowPrivilegeDetails(!showPrivilegeDetails)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showPrivilegeDetails ? 'Hide' : 'Show'} details
            </button>
          </div>
          <div className="space-y-2">
            {privilegeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPrivileged(option.value)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  privileged === option.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Shield className={`h-5 w-5 mt-0.5 ${
                  option.value === 'yes'
                    ? 'text-purple-600'
                    : option.value === 'partial'
                      ? 'text-amber-600'
                      : 'text-slate-400'
                }`} />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {option.label}
                  </p>
                  {showPrivilegeDetails && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Confidentiality */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Confidentiality
          </label>
          <select
            value={confidentiality}
            onChange={(e) => setConfidentiality(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="not_coded">Not Coded</option>
            {confidentialityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Code */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Issue Code
          </label>
          <Input
            value={issueCode}
            onChange={(e) => setIssueCode(e.target.value)}
            placeholder="e.g., BREACH-01, CONTRACT-A"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={addTag}
              icon={<Plus className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Review Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add notes about this document..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleFlag}
            disabled={isPending}
            icon={<Flag className="h-4 w-4" />}
          >
            Flag
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkReviewed}
            disabled={isPending}
            icon={<CheckCircle className="h-4 w-4" />}
          >
            Mark Reviewed
          </Button>
        </div>
        <Button
          className="w-full"
          variant="outline"
          onClick={handleSave}
          disabled={isPending}
          icon={<Save className="h-4 w-4" />}
        >
          {isPending ? 'Saving...' : 'Save Coding'}
        </Button>
        {/* Primary action: Save & Next for efficient review workflow */}
        <Button
          className="w-full"
          onClick={handleSaveAndNext}
          disabled={isPending || !hasNext}
          icon={<ChevronRight className="h-4 w-4" />}
        >
          {isPending ? 'Saving...' : hasNext ? 'Save & Next Document' : 'Save (Last Document)'}
        </Button>
      </div>
    </div>
  );
}
