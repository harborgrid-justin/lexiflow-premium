
import React, { Suspense } from 'react';
import { AppView, User } from '../../types';
import { ModuleRegistry } from '../../services/moduleRegistry';
import { PATHS } from '../../constants/paths';
import { LazyLoader } from '../common/LazyLoader';
import { HelpCircle, Lock } from 'lucide-react';

// Lazy Load CaseDetail specifically as it's a heavy component often used
const CaseDetail = React.lazy(() => import('../case-detail/CaseDetail').then(m => ({ default: m.CaseDetail as React.ComponentType<any> })));

interface AppContentRendererProps {
  activeView: AppView;
  currentUser: User;
  selectedCase: any | null; 
  handleSelectCase: (c: any) => void;
  handleSelectCaseById: (id: string) => void;
  handleBackToMain: () => void;
  setActiveView: (view: AppView) => void;
  initialTab?: string;
}

export const AppContentRenderer: React.FC<AppContentRendererProps> = ({
  activeView,
  currentUser,
  selectedCase,
  handleSelectCase,
  handleSelectCaseById,
  handleBackToMain,
  setActiveView,
  initialTab
}) => {
  // Special Case: Case Detail overrides generic modules
  if (selectedCase) {
    return (
      <Suspense fallback={<LazyLoader message="Loading Case Context..." />}>
        <CaseDetail 
          caseData={selectedCase} 
          onBack={handleBackToMain} 
          onSelectCase={handleSelectCase}
          initialTab={initialTab}
        />
      </Suspense>
    );
  }

  // Resolve Module from Registry
  const moduleDef = ModuleRegistry.getModule(activeView);

  if (moduleDef) {
    // Security Check
    if (moduleDef.requiresAdmin && currentUser.role !== 'Administrator' && currentUser.role !== 'Senior Partner') {
      return (
        <div className="flex flex-col justify-center items-center h-full text-slate-500 animate-fade-in">
          <div className="bg-red-50 p-6 rounded-full mb-4 border border-red-100">
            <Lock className="h-12 w-12 text-red-500"/>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
          <p className="text-sm mt-2 max-w-md text-center text-slate-600">
            You do not have permission to view the <strong>{moduleDef.label}</strong> module. 
            Please contact your system administrator.
          </p>
        </div>
      );
    }

    // Dynamic Component Injection
    const Component = moduleDef.component;
    
    // Inject props dynamically based on module requirements (Dependency Injection Lite)
    const dynamicProps: any = {};

    // Inject Holographic Route
    if (initialTab) {
        dynamicProps.initialTab = initialTab;
    }
    
    // Route-Specific Injection Logic
    if (activeView === PATHS.CASES) {
      dynamicProps.onSelectCase = handleSelectCase;
    } else if (([PATHS.DASHBOARD, PATHS.WORKFLOWS, PATHS.EVIDENCE, PATHS.EXHIBITS] as string[]).includes(activeView)) {
      dynamicProps.onSelectCase = handleSelectCaseById;
      dynamicProps.onNavigateToCase = handleSelectCaseById; // Alias
    }
    
    if (activeView === PATHS.BILLING) {
      dynamicProps.navigateTo = (v: string) => setActiveView(v);
    }
    
    if (activeView === PATHS.DOCUMENTS || activeView === PATHS.JURISDICTION) {
      dynamicProps.currentUser = currentUser;
      dynamicProps.currentUserRole = currentUser.role;
    }

    return (
      <Suspense fallback={<LazyLoader message={`Loading ${moduleDef.label}...`} />}>
        <Component {...dynamicProps} />
      </Suspense>
    );
  }

  // Fallback 404
  return (
    <div className="flex flex-col justify-center items-center h-full text-slate-400">
      <div className="bg-slate-100 p-4 rounded-full mb-4">
        <HelpCircle className="h-10 w-10 text-slate-300"/>
      </div>
      <p className="text-xl font-semibold">Module Not Found</p>
      <p className="text-sm mt-2">The requested module <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">"{activeView}"</span> is not registered in the dynamic runtime.</p>
    </div>
  );
};
