
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Book, FileText, MessageCircle, BarChart3, Search, BookOpen, Users, Lightbulb } from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { WikiView } from './knowledge/WikiView';
import { PrecedentsView } from './knowledge/PrecedentsView';
import { QAView } from './knowledge/QAView';
import { KnowledgeAnalytics } from './knowledge/KnowledgeAnalytics';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

type KnowledgeView = 'wiki' | 'precedents' | 'qa' | 'insights';

interface KnowledgeBaseProps {
    initialTab?: KnowledgeView;
}

const PARENT_TABS = [
  {
    id: 'library', label: 'Library', icon: Book,
    subTabs: [
      { id: 'wiki', label: 'Practice Wiki', icon: BookOpen },
      { id: 'precedents', label: 'Precedents', icon: FileText },
    ]
  },
  {
    id: 'community', label: 'Community', icon: Users,
    subTabs: [
      { id: 'qa', label: 'Firm Q&A', icon: MessageCircle },
    ]
  },
  {
    id: 'intelligence', label: 'Intelligence', icon: Lightbulb,
    subTabs: [
      { id: 'insights', label: 'Usage Analytics', icon: BarChart3 },
    ]
  }
];

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<KnowledgeView>('wiki');

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as KnowledgeView);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
        case 'wiki': return <WikiView />;
        case 'precedents': return <div className="h-full overflow-y-auto custom-scrollbar p-6"><PrecedentsView /></div>;
        case 'qa': return <div className="h-full overflow-y-auto custom-scrollbar p-6"><QAView /></div>;
        case 'insights': return <div className="h-full overflow-y-auto custom-scrollbar p-6"><KnowledgeAnalytics /></div>;
        default: return <WikiView />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Knowledge Base" 
          subtitle="Firm-wide intelligence, standard operating procedures, and legal precedents."
          actions={
            <div className="relative w-64 hidden md:block">
               <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
               <input 
                  className={cn("w-full pl-9 pr-4 py-1.5 text-sm border rounded-full outline-none focus:ring-2 focus:ring-blue-500", theme.surface, theme.border.default, theme.text.primary)}
                  placeholder="Search knowledge..."
               />
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

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as KnowledgeView)} 
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

      <div className="flex-1 overflow-hidden min-h-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default KnowledgeBase;
