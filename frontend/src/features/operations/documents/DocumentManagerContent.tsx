import { DocView } from '@/config/tabs.config';
import { UserRole } from '@/types';
import { lazy } from 'react';

const DocumentExplorer = lazy(() => import('./DocumentExplorer').then(m => ({ default: m.DocumentExplorer })));
const DocumentTemplates = lazy(() => import('./DocumentTemplates').then(m => ({ default: m.DocumentTemplates })));
const RecentFiles = lazy(() => import('./RecentFiles').then(m => ({ default: m.RecentFiles })));
const PDFEditorView = lazy(() => import('./pdf/PDFEditorView').then(m => ({ default: m.PDFEditorView })));
const RedactionStudioView = lazy(() => import('./pdf/RedactionStudioView').then(m => ({ default: m.RedactionStudioView })));
// Temporarily disabled - debugging Vite 500 error
// const FormsSigningView = lazy(() => import('./pdf/FormsSigningView').then(m => ({ default: m.FormsSigningView })));
const BatchProcessingView = lazy(() => import('./pdf/BatchProcessingView').then(m => ({ default: m.BatchProcessingView })));

interface DocumentManagerContentProps {
  activeTab: DocView;
  currentUserRole: UserRole;
}

export function DocumentManagerContent({ activeTab, currentUserRole }: DocumentManagerContentProps) {
  switch (activeTab) {
    case 'browse': return <DocumentExplorer currentUserRole={currentUserRole} />;
    case 'recent': return <RecentFiles />;
    case 'favorites': return <DocumentExplorer currentUserRole={currentUserRole} />; // Re-use explorer with filter?
    case 'templates': return <DocumentTemplates />;
    case 'drafts': return <DocumentExplorer currentUserRole={currentUserRole} />;
    case 'editor': return <PDFEditorView />;
    case 'redaction': return <RedactionStudioView />;
    case 'signing': return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
        <div className="mb-4 p-4 bg-slate-100 rounded-full dark:bg-slate-800">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Forms & Signing Unavailable</h3>
        <p className="mt-2 max-w-sm">This module is currently undergoing maintenance. Please check back later.</p>
      </div>
    );
    case 'batch': return <BatchProcessingView />;
    default: return <DocumentExplorer currentUserRole={currentUserRole} />;
  }
}
