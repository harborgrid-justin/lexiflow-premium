import React, { Suspense, useTransition } from 'react';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { LazyLoader } from '../common/LazyLoader';
import { cn } from '../../utils/cn';
import { KNOWLEDGE_BASE_TABS, KnowledgeView } from '../../config/knowledgeBaseConfig';
import { KnowledgeContent } from './KnowledgeContent';
import { Button } from '../common/Button';
import { Plus } from 'lucide-react';

interface KnowledgeBaseProps {
    initialTab?: KnowledgeView;
}

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
