/**
 * Litigation Strategy Builder Route
 *
 * Advanced litigation strategy planning and management tool.
 * Logic delegates to StrategyBuilder feature component.
 *
 * @module routes/litigation/builder
 */

import { StrategyBuilder, type StrategyTemplate } from '@/features/litigation/components/builder/StrategyBuilder';
import { DataService } from '@/services/data/dataService';
import type { Case } from '@/types';
import { MatterType } from '@/types/enums';
import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/builder";

// ============================================================================
// Types
// ============================================================================

interface LoaderData {
  templates: StrategyTemplate[];
  caseTypes: Array<{ id: string; name: string }>;
  existingStrategies: Array<{ id: string; name: string; caseId: string }>;
  cases: Case[];
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
  const templateId = url.searchParams.get('template');
  // Note: templateId could be used for future pre-selection logic
  void templateId; // Explicitly mark as intentionally unused for now

  // Fetch cases for selection
  let cases: Case[] = [];
  try {
    cases = await DataService.cases.getAll();
  } catch (error) {
    console.error('Failed to load cases for strategy builder:', error);
    // Continue with empty cases array rather than crashing the page
  }

  // Default strategy templates
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

  // Case types from enum
  const caseTypes = Object.values(MatterType).map(type => ({
    id: type,
    name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  // Fetch existing strategies from cases that have them
  const existingStrategies: LoaderData['existingStrategies'] = [];
  for (const c of cases) {
    try {
      const warRoomService = await DataService.warRoom.get();
      const strategy = await warRoomService.getStrategy(c.id);
      if (strategy && strategy.name) {
        existingStrategies.push({
          id: strategy.id || c.id,
          name: strategy.name,
          caseId: c.id
        });
      }
    } catch {
      // Case may not have a strategy - continue
    }
  }

  return {
    templates,
    caseTypes,
    existingStrategies,
    cases,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    switch (intent) {
      case "save": {
        const name = formData.get("name") as string;
        const caseId = formData.get("caseId") as string;
        const templateId = formData.get("templateId") as string;
        const objectives = formData.get("objectives") as string;

        if (!name?.trim()) {
          return { success: false, error: "Strategy name is required" };
        }

        if (caseId) {
          // Update strategy for the case
          await DataService.warRoom.updateStrategy(caseId, {
            name,
            templateId,
            objectives,
            status: 'Draft'
          });
          return {
            success: true,
            message: "Strategy saved successfully",
            strategyId: caseId, // Strategy ID is effectively Case ID in this model
          };
        }

        return { success: false, error: "Case selection required" };
      }

      case "generate": {
        const templateId = formData.get("templateId") as string;

        if (!templateId) {
          return { success: false, error: "Please select a strategy template" };
        }

        // In a real app, this would call an AI service
        return {
          success: true,
          message: "Strategy generated successfully",
        };
      }

      case "analyze-risk": {
        return {
          success: true,
          message: "Risk analysis completed",
        };
      }

      case "add-milestone": {
        const milestoneName = formData.get("milestoneName") as string;

        if (!milestoneName?.trim()) {
          return { success: false, error: "Milestone name is required" };
        }

        return {
          success: true,
          message: "Milestone added",
        };
      }

      case "export": {
        const format = formData.get("format") as string;
        return {
          success: true,
          message: `Strategy exported as ${format?.toUpperCase() || 'PDF'}`,
        };
      }

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Strategy builder action failed", error);
    return { success: false, error: "Action failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function LitigationBuilderRoute() {
  const loaderData = useLoaderData() as LoaderData;
  return <StrategyBuilder templates={loaderData.templates} caseTypes={loaderData.caseTypes} cases={loaderData.cases} />;
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
