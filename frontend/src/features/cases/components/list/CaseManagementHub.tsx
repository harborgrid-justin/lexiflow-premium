/**
 * CaseManagementHub - Enterprise Case Management Hub
 * Central routing and orchestration component for case management
 *
 * @module CaseManagement
 * @version 1.0.0
 * @enterprise true
 */

import React, { lazy, Suspense, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

// Lazy load case management components
const CaseListView = lazy(() => import('./CaseListView').then(m => ({ default: m.CaseListView })));
const CaseDetail = lazy(() => import('./CaseDetail').then(m => ({ default: m.CaseDetail })));
const CaseManagement = lazy(() => import('./CaseManagement').then(m => ({ default: m.CaseManagement })));

/**
 * Loading component for suspense fallback
 */
const LoadingSpinner: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className={cn("flex items-center justify-center h-full w-full min-h-[400px]", theme.surface.default)}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className={cn("h-8 w-8 animate-spin", theme.text.primary)} />
        <span className={cn("text-sm", theme.text.secondary)}>Loading Case Management...</span>
      </div>
    </div>
  );
};

/**
 * CaseManagementHub - Main case management router
 */
const CaseManagementHub: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();

  const basePath = useMemo(() => {
    return location.pathname.split('/cases')[0] + '/cases';
  }, [location.pathname]);

  return (
    <div className={cn("h-full w-full", theme.surface.default)}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route index element={<CaseListView />} />
          <Route path="list" element={<CaseListView />} />
          <Route path="manage" element={<CaseManagement />} />
          <Route path=":caseId" element={<CaseDetail />} />
          <Route path=":caseId/*" element={<CaseDetail />} />
          <Route path="*" element={<Navigate to={basePath} replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default CaseManagementHub;
