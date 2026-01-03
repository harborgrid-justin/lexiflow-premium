/**
 * Litigation Strategy Builder Route
 *
 * Advanced litigation strategy planning and management tool:
 * - Case timeline and milestone planning
 * - Strategy document generation
 * - Risk assessment and analysis
 * - Discovery planning
 * - Motion practice scheduling
 * - Trial preparation checklist
 *
 * @module routes/litigation/builder
 */

import { Form, Link, useLoaderData, useNavigate } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/builder";

// ============================================================================
// Types
// ============================================================================

interface StrategyTemplate {
  id: string;
  name: string;
  category: 'offensive' | 'defensive' | 'settlement' | 'appeal';
  phases: string[];
  description: string;
}

interface _Milestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface _RiskFactor {
  id: string;
  category: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

interface LoaderData {
  templates: StrategyTemplate[];
  caseTypes: Array<{ id: string; name: string }>;
  existingStrategies: Array<{ id: string; name: string; caseId: string }>;
}

interface ActionData {
  success: boolean;
  message?: string;
  error?: string;
  strategyId?: string;
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Litigation Strategy Builder',
    description: 'Plan and manage comprehensive litigation strategies with timeline and risk analysis',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const url = new URL(request.url);
  const _caseId = url.searchParams.get('case');
  const templateId = url.searchParams.get('template');
  console.log('template ID:', templateId);

  // TODO: Fetch strategy templates from API
  const templates: StrategyTemplate[] = [
    {
      id: 'aggressive-plaintiff',
      name: 'Aggressive Plaintiff Strategy',
      category: 'offensive',
      phases: ['Pleading', 'Discovery', 'Motion Practice', 'Trial'],
      description: 'Fast-paced litigation with early dispositive motions',
    },
    {
      id: 'measured-defense',
      name: 'Measured Defense Strategy',
      category: 'defensive',
      phases: ['Response', 'Discovery', 'Settlement Negotiations', 'Trial Prep'],
      description: 'Strategic defense with settlement optionality',
    },
    {
      id: 'settlement-focused',
      name: 'Settlement-Focused Approach',
      category: 'settlement',
      phases: ['Assessment', 'Negotiation', 'Mediation', 'Resolution'],
      description: 'Prioritizes early resolution through negotiation',
    },
    {
      id: 'appellate-strategy',
      name: 'Appellate Strategy',
      category: 'appeal',
      phases: ['Record Review', 'Brief Preparation', 'Oral Argument', 'Post-Decision'],
      description: 'Comprehensive approach to appellate advocacy',
    },
  ];

  // TODO: Fetch case types from API
  const caseTypes = [
    { id: 'commercial', name: 'Commercial Litigation' },
    { id: 'employment', name: 'Employment Dispute' },
    { id: 'ip', name: 'Intellectual Property' },
    { id: 'personal-injury', name: 'Personal Injury' },
    { id: 'contract', name: 'Contract Dispute' },
    { id: 'securities', name: 'Securities Litigation' },
  ];

  // TODO: Fetch existing strategies
  const existingStrategies: Strategy[] = [];

  return {
    templates,
    caseTypes,
    existingStrategies,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "save": {
      const name = formData.get("name") as string;
      const caseId = formData.get("caseId") as string;
      console.log('case ID:', caseId);
      const templateId = formData.get("templateId") as string;
      const objectives = formData.get("objectives") as string;

      if (!name?.trim()) {
        return {
          success: false,
          error: "Strategy name is required",
        };
      }

      // TODO: Save strategy to database
      console.log('Saving strategy:', { name, caseId, templateId, objectives });

      return {
        success: true,
        message: "Strategy saved successfully",
        strategyId: `strategy-${Date.now()}`,
      };
    }

    case "generate": {
      const templateId = formData.get("templateId") as string;
      const caseType = formData.get("caseType") as string;
      const caseDetails = formData.get("caseDetails") as string;

      if (!templateId) {
        return {
          success: false,
          error: "Please select a strategy template",
        };
      }

      // TODO: Generate strategy from template using AI
      console.log('Generating strategy:', { templateId, caseType, caseDetails });

      return {
        success: true,
        message: "Strategy generated successfully",
      };
    }

    case "analyze-risk": {
      const strategyId = formData.get("strategyId") as string;
      const factors = formData.get("factors") as string;

      // TODO: Perform risk analysis
      console.log('Analyzing risk:', { strategyId, factors });

      return {
        success: true,
        message: "Risk analysis completed",
      };
    }

    case "add-milestone": {
      const strategyId = formData.get("strategyId") as string;
      const milestoneName = formData.get("milestoneName") as string;
      const dueDate = formData.get("dueDate") as string;
      const priority = formData.get("priority") as string;

      if (!milestoneName?.trim()) {
        return {
          success: false,
          error: "Milestone name is required",
        };
      }

      // TODO: Add milestone to strategy
      console.log('Adding milestone:', { strategyId, milestoneName, dueDate, priority });

      return {
        success: true,
        message: "Milestone added",
      };
    }

    case "export": {
      const strategyId = formData.get("strategyId") as string;
      const format = formData.get("format") as string;

      // TODO: Export strategy document
      console.log('Exporting strategy:', { strategyId, format });

      return {
        success: true,
        message: `Strategy exported as ${format?.toUpperCase() || 'PDF'}`,
      };
    }

    default:
      return {
        success: false,
        error: "Invalid action",
      };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function LitigationBuilderRoute() {
  const navigate = useNavigate();
  const { templates, caseTypes } = useLoaderData() as LoaderData;

  const handleCancel = () => {
    navigate('/litigation');
  };

  const handleLoadTemplate = (templateId: string) => {
    navigate(`/litigation/builder?template=${templateId}`);
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/litigation" className="hover:text-gray-700 dark:hover:text-gray-200">
          Litigation
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">Strategy Builder</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Litigation Strategy Builder
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Plan and manage comprehensive litigation strategies
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Builder Area */}
        <div className="lg:col-span-3">
          <Form method="post" className="space-y-6">
            {/* Strategy Overview */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Strategy Overview
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Strategy Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g., Smith v. Corp - Aggressive Discovery Strategy"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="caseType" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Case Type
                  </label>
                  <select
                    id="caseType"
                    name="caseType"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Select case type</option>
                    {caseTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="templateId" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Strategy Template
                  </label>
                  <select
                    id="templateId"
                    name="templateId"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Strategic Objectives */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Strategic Objectives
              </h2>
              <div>
                <label htmlFor="objectives" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Primary Objectives
                </label>
                <textarea
                  id="objectives"
                  name="objectives"
                  rows={4}
                  placeholder="Define the primary strategic objectives for this case..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="caseDetails" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Case Details & Context
                </label>
                <textarea
                  id="caseDetails"
                  name="caseDetails"
                  rows={4}
                  placeholder="Provide relevant case details, key facts, and context..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Key Milestones */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Key Milestones
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="milestoneName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Milestone
                  </label>
                  <input
                    type="text"
                    id="milestoneName"
                    name="milestoneName"
                    placeholder="e.g., Discovery Deadline"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                name="intent"
                value="add-milestone"
                className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Add Milestone
              </button>
            </div>

            {/* Risk Assessment */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Risk Assessment
              </h2>
              <div>
                <label htmlFor="factors" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Risk Factors
                </label>
                <textarea
                  id="factors"
                  name="factors"
                  rows={4}
                  placeholder="Identify potential risk factors, adverse outcomes, and mitigation strategies..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <button
                type="submit"
                name="intent"
                value="analyze-risk"
                className="mt-4 rounded-md border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/40"
              >
                Analyze Risks
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <button
                  type="submit"
                  name="intent"
                  value="generate"
                  className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                >
                  Generate Strategy
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="save"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Strategy
                </button>
              </div>
            </div>
          </Form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Strategy Templates */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Strategy Templates
            </h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleLoadTemplate(template.id)}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span className="font-medium">{template.name}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {template.description}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {template.phases.slice(0, 2).map((phase) => (
                      <span
                        key={phase}
                        className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      >
                        {phase}
                      </span>
                    ))}
                    {template.phases.length > 2 && (
                      <span className="text-xs text-gray-500">+{template.phases.length - 2} more</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Tips */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              Strategy Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li>Define clear, measurable objectives</li>
              <li>Identify risks early in the process</li>
              <li>Set realistic milestones</li>
              <li>Review and adapt strategy regularly</li>
            </ul>
          </div>

          {/* Export Options */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Export Strategy
            </h3>
            <Form method="post" className="space-y-2">
              <input type="hidden" name="intent" value="export" />
              <button
                type="submit"
                name="format"
                value="pdf"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export as PDF
              </button>
              <button
                type="submit"
                name="format"
                value="docx"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export as Word
              </button>
              <button
                type="submit"
                name="format"
                value="timeline"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export Timeline
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Strategy Builder Error"
      message="Failed to load the litigation strategy builder. Please try again."
      backTo="/litigation"
      backLabel="Back to Litigation"
    />
  );
}
