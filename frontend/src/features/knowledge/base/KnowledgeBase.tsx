/**
 * @module components/knowledge/KnowledgeBase
 * @category Knowledge Management
 * @description Central knowledge base with wiki, Q&A, and precedent repositories.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, useTransition } from 'react';
import { Plus } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Components
import { TabbedPageLayout } from '../../components/templates/TabbedPageLayout';
import { LazyLoader } from '../../components/molecules/LazyLoader';
import { KnowledgeContent } from './KnowledgeContent';
import { Button } from '../../components/atoms/Button';

// Utils & Config
import { cn } from '@/utils/cn';
import { KNOWLEDGE_BASE_TABS, KnowledgeView } from '../../../config/tabs.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface KnowledgeBaseProps {
    /** Optional initial tab to display. */
    initialTab?: KnowledgeView;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ initialTab }) => {
    const [isPending, startTransition] = useTransition();
    const [activeTab, _setActiveTab] = useSessionStorage<string>('knowledge_active_tab', initialTab || 'wiki');

    const setActiveTab = (tab: string) => {
        startTransition(() => {
            _setActiveTab(tab);
        });
    };

    const renderContent = () => {
        return <KnowledgeContent activeTab={activeTab as KnowledgeView} />;
    };

    return (
        <TabbedPageLayout
            pageTitle="Knowledge Base"
            pageSubtitle="Centralized repository for firm intelligence, precedents, and best practices."
            pageActions={
                <div className="flex gap-2">
                    <Button variant="primary" icon={Plus}>Contribute</Button>
                </div>
            }
            tabConfig={KNOWLEDGE_BASE_TABS}
            activeTabId={activeTab}
            onTabChange={setActiveTab}
        >
            <Suspense fallback={<LazyLoader message="Loading Knowledge Module..." />}>
                <div className={cn("h-full", isPending && "opacity-60 transition-opacity")}>
                    {renderContent()}
                </div>
            </Suspense>
        </TabbedPageLayout>
    );
};

export default KnowledgeBase;
