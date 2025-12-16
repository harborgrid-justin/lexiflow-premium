import React, { lazy } from 'react';
import { KnowledgeView } from '../../config/tabs.config';

// Lazy load all sub-views for the Knowledge Base
const WikiView = lazy(() => import('./WikiView').then(m => ({ default: m.WikiView })));
const PrecedentsView = lazy(() => import('./PrecedentsView').then(m => ({ default: m.PrecedentsView })));
const QAView = lazy(() => import('./QAView').then(m => ({ default: m.QAView })));
const KnowledgeAnalytics = lazy(() => import('./KnowledgeAnalytics').then(m => ({ default: m.KnowledgeAnalytics })));
const CLETracker = () => <div className="p-8 text-center text-slate-500">CLE Tracking Module (Placeholder)</div>;

interface KnowledgeContentProps {
  activeTab: KnowledgeView;
}

export const KnowledgeContent: React.FC<KnowledgeContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'wiki': return <WikiView />;
    case 'precedents': return <PrecedentsView />;
    case 'qa': return <QAView />;
    case 'analytics': return <KnowledgeAnalytics />;
    case 'cle': return <CLETracker />;
    default: return <WikiView />;
  }
};
