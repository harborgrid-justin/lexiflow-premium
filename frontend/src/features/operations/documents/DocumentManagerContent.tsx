import React, { lazy } from 'react';
import { DocView } from '@/config/tabs.config';
import { UserRole } from '@/types';

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
        case 'signing': return <div className="p-8 text-center text-slate-600">Forms & Signing temporarily unavailable</div>;
        case 'batch': return <BatchProcessingView />;
        default: return <DocumentExplorer currentUserRole={currentUserRole} />;
    }
}
