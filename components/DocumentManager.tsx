import React, { Suspense, lazy } from 'react';
import { 
  Folder, Clock, Star, FileText, LayoutTemplate, 
  PenTool, Share2, CheckCircle, FileSignature, Edit, Eraser, Cpu
} from 'lucide-react';
import { Button } from './common/Button';
import { UserRole } from '../types';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { LazyLoader } from './common/LazyLoader';

// Lazy load sub-components
const DocumentExplorer = lazy(() => import('./documents/DocumentExplorer').then(m => ({ default: m.DocumentExplorer })));
const DocumentTemplates = lazy(() => import('./documents/DocumentTemplates').then(m => ({ default: m.DocumentTemplates })));
const RecentFiles = lazy(() => import('./documents/RecentFiles').then(m => ({ default: m.RecentFiles })));
const PDFEditorView = lazy(() => import('./documents/pdf/PDFEditorView').then(m => ({ default: m.PDFEditorView })));
const RedactionStudioView = lazy(() => import('./documents/pdf/RedactionStudioView').then(m => ({ default: m.RedactionStudioView })));
const FormsSigningView = lazy(() => import('./documents/pdf/FormsSigningView').then(m => ({ default: m.FormsSigningView })));
const BatchProcessingView = lazy(() => import('./documents/pdf/BatchProcessingView').then(m => ({ default: m.BatchProcessingView })));

type DocView = 'browse' | 'recent' | 'favorites' | 'templates' | 'drafts' | 'pending' | 'shared' | 'editor' | 'redaction' | 'signing' | 'batch';

interface DocumentManagerProps {
  currentUserRole?: UserRole;
  initialTab?: DocView;
}

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'library', label: 'Library', icon: Folder,
    subTabs: [
      { id: 'browse', label: 'All Files', icon: Folder },
      { id: 'recent', label: 'Recent', icon: Clock },
      { id: 'favorites', label: 'Favorites', icon: Star },
    ]
  },
  {
    id: 'drafting', label: 'Drafting', icon: PenTool,
    subTabs: [
      { id: 'templates', label: 'Templates', icon: LayoutTemplate },
      { id: 'drafts', label: 'My Drafts', icon: FileText },
    ]
  },
  {
    id: 'review', label: 'Review', icon: Share2,
    subTabs: [
      { id: 'pending', label: 'Pending Review', icon: Clock },
      { id: 'shared', label: 'Shared with Client', icon: Share2 },
    ]
  },
  {
    id: 'pdf_platform', label: 'PDF Platform', icon: FileSignature,
    subTabs: [
      { id: 'editor', label: 'Interactive Editor', icon: Edit },
      { id: 'redaction', label: 'Redaction Studio', icon: Eraser },
      { id: 'signing', label: 'Forms & Signing', icon: FileSignature },
      { id: 'batch', label: 'Batch Processing', icon: Cpu },
    ]
  }
];

export const DocumentManager: React.FC<DocumentManagerProps> = ({ currentUserRole = 'Associate', initialTab }) => {
  const [activeTab, setActiveTab] = useSessionStorage<string>('docs_active_tab', initialTab || 'browse');

  const renderContent = () => {
      switch (activeTab) {
          case 'browse': return <DocumentExplorer currentUserRole={currentUserRole} />;
          case 'templates': return <DocumentTemplates />;
          case 'recent': return <RecentFiles />;
          case 'favorites': return <div className="p-12 text-center text-sm text-slate-500">No favorite documents yet.</div>;
          case 'drafts': return <div className="p-12 text-center text-sm text-slate-500">No active drafts found.</div>;
          case 'pending': return <div className="p-12 text-center text-sm text-slate-500">All documents are approved.</div>;
          case 'shared': return <div className="p-12 text-center text-sm text-slate-500">No documents currently shared.</div>;
          case 'editor': return <PDFEditorView />;
          case 'redaction': return <RedactionStudioView />;
          case 'signing': return <FormsSigningView />;
          case 'batch': return <BatchProcessingView />;
          default: return <DocumentExplorer currentUserRole={currentUserRole} />;
      }
  };

  return (
    <TabbedPageLayout
      pageTitle="Document Management"
      pageSubtitle="Centralized DMS, Version Control, and Automated Drafting."
      pageActions={
        <div className="flex gap-2">
            <Button variant="secondary" icon={Clock} onClick={() => setActiveTab('recent')}>History</Button>
            <Button variant="outline" icon={LayoutTemplate} onClick={() => setActiveTab('templates')}>New Draft</Button>
        </div>
      }
      tabConfig={TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Document Module..." />}>
        {renderContent()}
      </Suspense>
    </TabbedPageLayout>
  );
};

export default DocumentManager;
