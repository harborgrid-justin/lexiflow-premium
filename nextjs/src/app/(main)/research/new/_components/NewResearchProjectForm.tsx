'use client';

/**
 * New Research Project Form Component
 * Client component for creating research projects
 *
 * @module research/new/_components/NewResearchProjectForm
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  X,
  Calendar,
  Clock,
  Users,
  Tag,
  Save,
  AlertCircle,
} from 'lucide-react';
import type { CreateResearchProjectDto } from '@/types/research';
import { createResearchProject } from '../../actions';

interface NewResearchProjectFormProps {
  cases: Array<{ id: string; title: string; caseNumber: string }>;
  matters: Array<{ id: string; name: string }>;
}

const JURISDICTIONS = [
  'Federal (All Circuits)',
  'Supreme Court',
  '1st Circuit',
  '2nd Circuit',
  '3rd Circuit',
  '4th Circuit',
  '5th Circuit',
  '6th Circuit',
  '7th Circuit',
  '8th Circuit',
  '9th Circuit',
  '10th Circuit',
  '11th Circuit',
  'D.C. Circuit',
  'Federal Circuit',
  'California',
  'New York',
  'Texas',
  'Florida',
  'Illinois',
  'Pennsylvania',
  'Ohio',
  'Georgia',
  'Michigan',
  'North Carolina',
];

const PRACTICE_AREAS = [
  'Litigation',
  'Corporate',
  'Real Estate',
  'Employment',
  'Intellectual Property',
  'Tax',
  'Bankruptcy',
  'Criminal Defense',
  'Family Law',
  'Immigration',
  'Environmental',
  'Healthcare',
  'Securities',
  'Antitrust',
  'Insurance',
];

export function NewResearchProjectForm({ cases, matters }: NewResearchProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [caseId, setCaseId] = useState('');
  const [matterId, setMatterId] = useState('');
  const [researchQuestions, setResearchQuestions] = useState<string[]>(['']);
  const [jurisdictions, setJurisdictions] = useState<string[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [priority, setPriority] = useState<number>(3);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Project title is required');
      return;
    }

    const filteredQuestions = researchQuestions.filter((q) => q.trim());

    const data: CreateResearchProjectDto = {
      title: title.trim(),
      description: description.trim() || undefined,
      caseId: caseId || undefined,
      matterId: matterId || undefined,
      researchQuestions: filteredQuestions.length > 0 ? filteredQuestions : undefined,
      jurisdictions: jurisdictions.length > 0 ? jurisdictions : undefined,
      practiceAreas: practiceAreas.length > 0 ? practiceAreas : undefined,
      dueDate: dueDate || undefined,
      estimatedHours: estimatedHours ? parseInt(estimatedHours, 10) : undefined,
      priority,
      tags: tags.length > 0 ? tags : undefined,
    };

    startTransition(async () => {
      const result = await createResearchProject(data);

      if (result.success && result.data) {
        router.push(`/research/${result.data.id}`);
      } else {
        setError(result.error || 'Failed to create project');
      }
    });
  };

  const addResearchQuestion = () => {
    setResearchQuestions([...researchQuestions, '']);
  };

  const updateResearchQuestion = (index: number, value: string) => {
    const updated = [...researchQuestions];
    updated[index] = value;
    setResearchQuestions(updated);
  };

  const removeResearchQuestion = (index: number) => {
    if (researchQuestions.length > 1) {
      setResearchQuestions(researchQuestions.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const toggleJurisdiction = (jurisdiction: string) => {
    setJurisdictions((prev) =>
      prev.includes(jurisdiction)
        ? prev.filter((j) => j !== jurisdiction)
        : [...prev, jurisdiction]
    );
  };

  const togglePracticeArea = (area: string) => {
    setPracticeAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Link */}
      <Link
        href="/research"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Research
      </Link>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Basic Information
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Contract Breach Research for ABC Corp"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the research objectives and scope..."
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Link to Case/Matter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="caseId"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Link to Case
              </label>
              <select
                id="caseId"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              >
                <option value="">None</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="matterId"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Link to Matter
              </label>
              <select
                id="matterId"
                value={matterId}
                onChange={(e) => setMatterId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              >
                <option value="">None</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Research Questions */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Research Questions
          </h2>
          <button
            type="button"
            onClick={addResearchQuestion}
            className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        <div className="space-y-3">
          {researchQuestions.map((question, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 mt-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <input
                type="text"
                value={question}
                onChange={(e) => updateResearchQuestion(index, e.target.value)}
                placeholder="Enter a research question..."
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              {researchQuestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeResearchQuestion(index)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Jurisdictions & Practice Areas */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Scope
        </h2>

        <div className="space-y-6">
          {/* Jurisdictions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Jurisdictions
            </label>
            <div className="flex flex-wrap gap-2">
              {JURISDICTIONS.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => toggleJurisdiction(j)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    jurisdictions.includes(j)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Practice Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {PRACTICE_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => togglePracticeArea(area)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    practiceAreas.includes(area)
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline & Priority */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Timeline & Priority
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              <Calendar className="h-4 w-4 inline mr-1.5" />
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Estimated Hours */}
          <div>
            <label
              htmlFor="estimatedHours"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              <Clock className="h-4 w-4 inline mr-1.5" />
              Estimated Hours
            </label>
            <input
              id="estimatedHours"
              type="number"
              min="0"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="e.g., 20"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    priority === p
                      ? p <= 2
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                        : p === 3
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              1 = Highest, 5 = Lowest
            </p>
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
          <Tag className="h-5 w-5 text-slate-400" />
          Tags
        </h2>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="p-0.5 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/research"
          className="px-6 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
