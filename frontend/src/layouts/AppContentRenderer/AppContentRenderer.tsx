/**
 * @module components/layout/AppContentRenderer
 * @category Layout
 * @description Dynamic content renderer for application views with lazy-loaded modules, access
 * control enforcement, case detail routing, and module prop injection. Routes between registered
 * modules from ModuleRegistry and handles special case for CaseDetail named export.
 *
 * THEME SYSTEM USAGE:
 * - No direct theme usage (routing component)
 * - Child components handle their own theme integration
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { HelpCircle, Lock } from 'lucide-react';
import React, { Suspense, lazy } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { LazyLoader } from '@/components/molecules/LazyLoader/LazyLoader';

// Services & Data
import { ModuleRegistry } from '@/services/infrastructure/module-registry.service';

// Utils & Constants
import { PATHS } from '@/config/paths.config';

// Types
import { AppView, Case, User } from '@/types';

// ========================================
// LAZY LOADED COMPONENTS
// ========================================
// OPTIMIZATION: Lazy load CaseDetailView to prevent it from being bundled in the main chunk.
const CaseDetail = lazy(() => import('@/routes/cases/CaseDetailView').then(m => ({ default: m.CaseDetailView })));

// ========================================
// TYPES & INTERFACES
// ========================================
interface AppContentRendererProps {
  activeView: AppView;
  currentUser?: User;
  selectedCase: Case | null;
  handleSelectCase: (c: Case) => void;
  handleSelectCaseById: (id: string) => void;
  navigateToCaseTab: (caseId: string, tab: string) => void;
  handleBackToMain: () => void;
  setActiveView: (view: AppView) => void;
  initialTab?: string;
}

// ========================================
// COMPONENT
// ========================================
export const AppContentRenderer = ({
  activeView,
  currentUser,
  selectedCase,
  handleSelectCase,
  handleSelectCaseById,
  navigateToCaseTab,
  handleBackToMain,
  setActiveView,
  initialTab
}: AppContentRendererProps) => {
  // Only show CaseDetail when we have a valid case with an ID
  // This prevents showing CaseDetail with empty/undefined case data
  const hasValidCase = selectedCase && selectedCase.id;

  if (hasValidCase) {
    return (
      <Suspense fallback={<LazyLoader message="Initializing Case Context & Workspace..." />}>
        <CaseDetail
          caseData={selectedCase}
          onBack={handleBackToMain}
          onSelectCase={handleSelectCase}
          initialTab={initialTab}
        />
      </Suspense>
    );
  }

  const moduleDef = ModuleRegistry.getModule(activeView);

  if (moduleDef) {
    // Check admin permission - support both backend role names (snake_case) and legacy frontend names
    const adminRoles = ['super_admin', 'admin', 'Administrator', 'Senior Partner', 'partner', 'it_admin'];
    const hasAdminAccess = currentUser && adminRoles.includes(currentUser.role);

    if (moduleDef.requiresAdmin && !hasAdminAccess) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-slate-500 animate-fade-in">
          <div className="bg-red-50 p-6 rounded-full mb-4 border border-red-100">
            <Lock className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
          <p className="text-sm mt-2 max-w-md text-center text-slate-600">
            You do not have permission to view the <strong>{moduleDef.label}</strong> module.
            Please contact your system administrator.
          </p>
        </div>
      );
    }

    const Component = moduleDef.component as unknown as React.ComponentType<Record<string, unknown>>;
    const dynamicProps: Record<string, unknown> = { currentUser };

    if (initialTab) {
      dynamicProps.initialTab = initialTab;
    }

    if (activeView === PATHS.CASES || activeView === PATHS.PLEADING_BUILDER) {
      dynamicProps.onSelectCase = handleSelectCase;
      dynamicProps.setActiveView = setActiveView;
    } else if (([PATHS.DASHBOARD, PATHS.WORKFLOWS, PATHS.EVIDENCE, PATHS.EXHIBITS] as string[]).includes(activeView)) {
      dynamicProps.onSelectCase = handleSelectCaseById;
      dynamicProps.onNavigateToCase = handleSelectCaseById;
    }

    if (activeView === PATHS.LITIGATION_BUILDER) {
      dynamicProps.navigateToCaseTab = navigateToCaseTab;
    }

    if (activeView === PATHS.BILLING) {
      dynamicProps.navigateTo = (v: string) => setActiveView(v as AppView);
    }

    if (activeView === PATHS.CREATE_CASE) {
      dynamicProps.onBack = () => setActiveView(PATHS.CASES);
      dynamicProps.onSuccess = () => {
        // Navigate back to cases after successful creation
        setActiveView(PATHS.CASES);
      };
    }

    if (activeView === PATHS.DOCUMENTS || activeView === PATHS.JURISDICTION) {
      dynamicProps.currentUser = currentUser;
      dynamicProps.currentUserRole = currentUser?.role;
    }

    return (
      <div className="h-full">
        <Suspense fallback={<LazyLoader message={`Loading ${moduleDef.label}...`} />}>
          <Component {...dynamicProps} />
        </Suspense>
      </div>
    );
  }

  return (
    <div style={{ color: 'var(--color-textMuted)' }} className="flex flex-col justify-center items-center h-full">
      <div style={{ backgroundColor: 'var(--color-surface)' }} className="p-4 rounded-full mb-4">
        <HelpCircle style={{ color: 'var(--color-border)' }} className="h-10 w-10" />
      </div>
      <p className="text-xl font-semibold">Module Not Found</p>
      <p className="text-sm mt-2">The requested module <span style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} className="font-mono px-1 rounded">"{activeView}"</span> is not registered in the dynamic runtime.</p>
    </div>
  );
};
