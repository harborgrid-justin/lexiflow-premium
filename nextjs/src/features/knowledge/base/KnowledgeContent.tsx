import { KnowledgeView } from '@/config/tabs.config';
import React, { lazy } from 'react';

// Lazy load all sub-views for the Knowledge Base
const WikiView = lazy(() => import('./WikiView').then(m => ({ default: m.WikiView })));
const PrecedentsView = lazy(() => import('./PrecedentsView').then(m => ({ default: m.PrecedentsView })));
const QAView = lazy(() => import('./QAView').then(m => ({ default: m.QAView })));
const KnowledgeAnalytics = lazy(() => import('./KnowledgeAnalytics').then(m => ({ default: m.KnowledgeAnalytics })));
const CLETracker = lazy(() => import('./CLETracker').then(m => ({ default: m.CLETracker })));

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
