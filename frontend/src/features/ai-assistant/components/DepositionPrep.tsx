/**
 * Deposition Preparation Component
 * Generate comprehensive deposition outlines
 */

import React, { useState } from 'react';
import { Users, Plus, Trash2, Clock, CheckSquare } from 'lucide-react';
import { aiLegalService } from '../services/aiLegalService';
import type { DepositionOutline } from '../types';

export interface DepositionPrepProps {
  matterId: string;
  onOutlineGenerated?: (outline: DepositionOutline) => void;
  className?: string;
}

export function DepositionPrep({ matterId, onOutlineGenerated, className }: DepositionPrepProps) {
  const [formData, setFormData] = useState({
    witnessName: '',
    witnessRole: '',
    witnessAffiliation: '',
    caseBackground: '',
    keyFacts: [''],
    objectives: [''],
  });
  const [outline, setOutline] = useState<DepositionOutline | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const filteredFacts = formData.keyFacts.filter(f => f.trim());
    const filteredObjectives = formData.objectives.filter(o => o.trim());

    if (!formData.witnessName || !formData.caseBackground || filteredFacts.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await aiLegalService.generateDepositionOutline({
        matterId,
        witnessName: formData.witnessName,
        witnessRole: formData.witnessRole || undefined,
        witnessAffiliation: formData.witnessAffiliation || undefined,
        caseBackground: formData.caseBackground,
        keyFacts: filteredFacts,
        objectives: filteredObjectives,
      });

      setOutline(result);
      onOutlineGenerated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate outline');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className || ''}`}>
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Users className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Deposition Preparation</h2>
            <p className="text-sm text-teal-100">AI-powered deposition outline generator</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!outline ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Witness Name *</label>
                <input
                  type="text"
                  value={formData.witnessName}
                  onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={formData.witnessRole}
                  onChange={(e) => setFormData({ ...formData, witnessRole: e.target.value })}
                  placeholder="CEO, CFO, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Affiliation</label>
                <input
                  type="text"
                  value={formData.witnessAffiliation}
                  onChange={(e) => setFormData({ ...formData, witnessAffiliation: e.target.value })}
                  placeholder="Company name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Case Background *</label>
              <textarea
                value={formData.caseBackground}
                onChange={(e) => setFormData({ ...formData, caseBackground: e.target.value })}
                placeholder="Provide background on the case..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Key Facts *</label>
                <button
                  onClick={() => setFormData({ ...formData, keyFacts: [...formData.keyFacts, ''] })}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Fact
                </button>
              </div>
              <div className="space-y-2">
                {formData.keyFacts.map((fact, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={fact}
                      onChange={(e) => {
                        const newFacts = [...formData.keyFacts];
                        newFacts[index] = e.target.value;
                        setFormData({ ...formData, keyFacts: newFacts });
                      }}
                      placeholder={`Key fact ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {formData.keyFacts.length > 1 && (
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          keyFacts: formData.keyFacts.filter((_, i) => i !== index)
                        })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Objectives</label>
                <button
                  onClick={() => setFormData({ ...formData, objectives: [...formData.objectives, ''] })}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Objective
                </button>
              </div>
              <div className="space-y-2">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...formData.objectives];
                        newObjectives[index] = e.target.value;
                        setFormData({ ...formData, objectives: newObjectives });
                      }}
                      placeholder={`Objective ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          objectives: formData.objectives.filter((_, i) => i !== index)
                        })}
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
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Generating Outline...
                </>
              ) : (
                <>
                  <CheckSquare className="w-5 h-5" />
                  Generate Deposition Outline
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <h3 className="font-semibold text-teal-900">Witness: {outline.witnessName}</h3>
              {outline.witnessRole && <p className="text-sm text-teal-700">Role: {outline.witnessRole}</p>}
              {outline.witnessAffiliation && (
                <p className="text-sm text-teal-700">Affiliation: {outline.witnessAffiliation}</p>
              )}
              <p className="text-sm text-teal-700 mt-2">
                Estimated Duration: {outline.estimatedDurationMinutes} minutes
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Topics ({outline.topics.length})</h4>
              <div className="space-y-3">
                {outline.topics
                  .sort((a, b) => a.order - b.order)
                  .map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{topic.title}</h5>
                        <span className={`text-xs px-2 py-1 rounded ${
                          topic.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          topic.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          topic.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {topic.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{topic.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Est. time: {topic.estimatedTimeMinutes} min
                      </p>
                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">Subtopics:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {topic.subtopics.map((sub, idx) => (
                              <li key={idx}>{sub}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Questions ({outline.questions.length})
              </h4>
              <div className="space-y-2">
                {outline.questions
                  .sort((a, b) => a.order - b.order)
                  .map((question, idx) => (
                    <div key={question.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900">
                        Q{idx + 1}: {question.question}
                      </p>
                      {question.notes && (
                        <p className="text-xs text-blue-700 mt-1">Note: {question.notes}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setOutline(null)}
              className="w-full px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
            >
              Generate New Outline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
