/**
 * Brief Generator Component
 * Generate legal briefs with AI assistance
 */

import React, { useState } from 'react';
import { FileText, Plus, Trash2, Download, Clock } from 'lucide-react';
import { aiLegalService } from '../services/aiLegalService';
import type { LegalBrief } from '../types';

const BRIEF_TYPES = [
  { value: 'MOTION', label: 'Motion' },
  { value: 'MEMORANDUM', label: 'Memorandum of Law' },
  { value: 'RESPONSE', label: 'Response' },
  { value: 'REPLY', label: 'Reply' },
  { value: 'APPELLATE', label: 'Appellate Brief' },
  { value: 'AMICUS', label: 'Amicus Curiae' },
  { value: 'TRIAL', label: 'Trial Brief' },
  { value: 'OTHER', label: 'Other' },
];

export interface BriefGeneratorProps {
  matterId: string;
  onBriefGenerated?: (brief: LegalBrief) => void;
  className?: string;
}

export function BriefGenerator({ matterId, onBriefGenerated, className }: BriefGeneratorProps) {
  const [formData, setFormData] = useState({
    briefType: 'MOTION',
    title: '',
    facts: '',
    legalIssues: [''],
    jurisdiction: '',
    court: '',
    precedents: [''],
  });
  const [brief, setBrief] = useState<LegalBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddIssue = () => {
    setFormData({
      ...formData,
      legalIssues: [...formData.legalIssues, ''],
    });
  };

  const handleRemoveIssue = (index: number) => {
    setFormData({
      ...formData,
      legalIssues: formData.legalIssues.filter((_, i) => i !== index),
    });
  };

  const handleIssueChange = (index: number, value: string) => {
    const newIssues = [...formData.legalIssues];
    newIssues[index] = value;
    setFormData({ ...formData, legalIssues: newIssues });
  };

  const handleAddPrecedent = () => {
    setFormData({
      ...formData,
      precedents: [...formData.precedents, ''],
    });
  };

  const handleRemovePrecedent = (index: number) => {
    setFormData({
      ...formData,
      precedents: formData.precedents.filter((_, i) => i !== index),
    });
  };

  const handlePrecedentChange = (index: number, value: string) => {
    const newPrecedents = [...formData.precedents];
    newPrecedents[index] = value;
    setFormData({ ...formData, precedents: newPrecedents });
  };

  const handleGenerate = async () => {
    if (!formData.title || !formData.facts || !formData.jurisdiction) {
      setError('Please fill in all required fields');
      return;
    }

    const filteredIssues = formData.legalIssues.filter(issue => issue.trim());
    if (filteredIssues.length === 0) {
      setError('Please add at least one legal issue');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await aiLegalService.generateBrief({
        matterId,
        briefType: formData.briefType,
        title: formData.title,
        facts: formData.facts,
        legalIssues: filteredIssues,
        jurisdiction: formData.jurisdiction,
        court: formData.court || undefined,
        precedents: formData.precedents.filter(p => p.trim()) || undefined,
      });

      setBrief(result);
      onBriefGenerated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate brief');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className || ''}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Legal Brief Generator</h2>
            <p className="text-sm text-indigo-100">AI-powered brief writing assistant</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!brief ? (
          <div className="space-y-4">
            {/* Brief Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief Type *
              </label>
              <select
                value={formData.briefType}
                onChange={(e) => setFormData({ ...formData, briefType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BRIEF_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Motion to Dismiss for Lack of Jurisdiction"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Jurisdiction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jurisdiction *
                </label>
                <input
                  type="text"
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  placeholder="e.g., Federal - 9th Circuit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court (Optional)
                </label>
                <input
                  type="text"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  placeholder="e.g., U.S. District Court, N.D. Cal."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Facts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statement of Facts *
              </label>
              <textarea
                value={formData.facts}
                onChange={(e) => setFormData({ ...formData, facts: e.target.value })}
                placeholder="Provide a detailed statement of facts..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Legal Issues */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Legal Issues *
                </label>
                <button
                  onClick={handleAddIssue}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Issue
                </button>
              </div>
              <div className="space-y-2">
                {formData.legalIssues.map((issue, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={issue}
                      onChange={(e) => handleIssueChange(index, e.target.value)}
                      placeholder={`Legal issue ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {formData.legalIssues.length > 1 && (
                      <button
                        onClick={() => handleRemoveIssue(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Precedents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Relevant Precedents (Optional)
                </label>
                <button
                  onClick={handleAddPrecedent}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Precedent
                </button>
              </div>
              <div className="space-y-2">
                {formData.precedents.map((precedent, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={precedent}
                      onChange={(e) => handlePrecedentChange(index, e.target.value)}
                      placeholder="e.g., Smith v. Jones, 123 F.3d 456 (9th Cir. 2020)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {formData.precedents.length > 1 && (
                      <button
                        onClick={() => handleRemovePrecedent(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Generating Brief...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate Brief
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Brief Header */}
            <div className="text-center space-y-2 pb-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">{brief.title}</h3>
              <p className="text-sm text-gray-600">{brief.type}</p>
              <p className="text-sm text-gray-600">{brief.jurisdiction}</p>
              {brief.court && <p className="text-sm text-gray-600">{brief.court}</p>}
            </div>

            {/* Brief Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Word Count</p>
                <p className="text-xl font-semibold text-gray-900">{brief.wordCount || 0}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Arguments</p>
                <p className="text-xl font-semibold text-gray-900">{brief.arguments.length}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Citations</p>
                <p className="text-xl font-semibold text-gray-900">{brief.citations.length}</p>
              </div>
            </div>

            {/* Brief Content */}
            <div className="prose max-w-none">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Introduction</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-6">{brief.introduction}</p>

              {brief.statementOfFacts && (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Statement of Facts</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-6">{brief.statementOfFacts}</p>
                </>
              )}

              <h4 className="text-lg font-semibold text-gray-900 mb-3">Arguments</h4>
              {brief.arguments.map((arg, idx) => (
                <div key={arg.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-md font-semibold text-gray-900 mb-2">
                    {idx + 1}. {arg.heading}
                  </h5>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{arg.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      arg.strength === 'STRONG' ? 'bg-green-100 text-green-700' :
                      arg.strength === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {arg.strength}
                    </span>
                  </div>
                </div>
              ))}

              <h4 className="text-lg font-semibold text-gray-900 mb-3">Conclusion</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{brief.conclusion}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setBrief(null)}
                className="flex-1 px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Generate New Brief
              </button>
              <button
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
