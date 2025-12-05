
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Folder, Clock, Star, FileText, LayoutTemplate, 
  PenTool, Share2, CheckCircle 
} from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useSessionStorage } from '../hooks/useSessionStorage';

// Sub-components
import { DocumentExplorer } from './documents/DocumentExplorer';
import { DocumentTemplates } from './documents/DocumentTemplates';
import { RecentFiles } from './documents/RecentFiles';

type DocView = 'browse' | 'recent' | 'favorites' | 'templates' | 'drafts' | 'pending' | 'shared';

interface DocumentManagerProps {
  currentUserRole?: UserRole;
  initialTab?: DocView;
}

const PARENT_TABS = [
  {
    id: 'library',
    label: 'Library',
    icon: Folder,
    subTabs: [
      { id: 'browse', label: 'All Files', icon: Folder },
      { id: 'recent', label: 'Recent', icon: Clock },
      { id: 'favorites', label: 'Favorites', icon: Star },
    ]
  },
  {
    id: 'drafting',
    label: 'Drafting',
    icon: PenTool,
    subTabs: [
      { id: 'templates', label: 'Templates', icon: LayoutTemplate },
      { id: 'drafts', label: 'My Drafts', icon: FileText },
    ]
  },
  {
    id: 'review',
    label: 'Review',
    icon: Share2,
    subTabs: [
      { id: 'pending', label: 'Pending Review', icon: Clock },
      { id: 'shared', label: 'Shared with Client', icon: Share2 },
    ]
  }
];

export const DocumentManager: React.FC<DocumentManagerProps> = ({ currentUserRole = 'Associate', initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useSessionStorage<DocView>('docs_active_tab', 'browse');

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab, setActiveTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as DocView);
    }
  }, [setActiveTab]);

  const renderContent = () => {
      switch (activeTab) {
          case 'browse':
              return <DocumentExplorer currentUserRole={currentUserRole} />;
          case 'templates':
              return <DocumentTemplates />;
          case 'recent':
              return <RecentFiles />;
          case 'favorites':
              return <div className={cn("p-12 text-center text-sm", theme.text.tertiary)}>No favorite documents yet. Star a document to see it here.</div>;
          case 'drafts':
              return <div className={cn("p-12 text-center text-sm", theme.text.tertiary)}>No active drafts found. Start from a template.</div>;
          case 'pending':
              return <div className={cn("p-12 text-center text-sm", theme.text.tertiary)}>All documents are approved.</div>;
          case 'shared':
              return <div className={cn("p-12 text-center text-sm", theme.text.tertiary)}>No documents currently shared externally.</div>;
          default:
              return <DocumentExplorer currentUserRole={currentUserRole} />;
      }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Document Management" 
          subtitle="Centralized DMS, Version Control, and Automated Drafting."
          actions={
            <div className="flex gap-2">
                <Button variant="secondary" icon={Clock} onClick={() => setActiveTab('recent')}>History</Button>
                <Button variant="outline" icon={LayoutTemplate} onClick={() => setActiveTab('templates')}>New Draft</Button>
            </div>
          }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) - Touch Scroll */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as DocView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar touch-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
