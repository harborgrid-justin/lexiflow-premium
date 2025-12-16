import React, { lazy } from 'react';
import { RulesView } from '../../config/tabs.config';
import { LazyLoader } from '../common/LazyLoader';

// Sub-components
const RulesDashboard = lazy(() => import('./RulesDashboard').then(m => ({ default: m.RulesDashboard })));
const RuleBookViewer = lazy(() => import('./RuleBookViewer').then(m => ({ default: m.RuleBookViewer })));
const StandingOrders = lazy(() => import('./StandingOrders').then(m => ({ default: m.StandingOrders })));
const LocalRulesMap = lazy(() => import('./LocalRulesMap').then(m => ({ default: m.LocalRulesMap })));

interface RulesPlatformContentProps {
  activeTab: RulesView;
  setActiveTab: (view: RulesView) => void;
}

export const RulesPlatformContent: React.FC<RulesPlatformContentProps> = ({ activeTab, setActiveTab }) => {
  switch (activeTab) {
    case 'dashboard': return <RulesDashboard onNavigate={setActiveTab} />;
    case 'federal_evidence': return <RuleBookViewer type="FRE" title="Federal Rules of Evidence" />;
    case 'federal_civil': return <RuleBookViewer type="FRCP" title="Federal Rules of Civil Procedure" />;
    case 'local': return <LocalRulesMap />;
    case 'standing_orders': return <StandingOrders />;
    case 'search': return <div className="p-12 text-center text-slate-400">Deep Semantic Search Module Loading...</div>;
    case 'compare': return <div className="p-12 text-center text-slate-400">Rule Comparison Engine Loading...</div>;
    default: return <RulesDashboard onNavigate={setActiveTab} />;
  }
};
