import { Clause } from '@/types';
import { lazy } from 'react';

const ActiveResearch = lazy(() => import('./ActiveResearch').then(m => ({ default: m.ActiveResearch })));
const ResearchHistory = lazy(() => import('./ResearchHistory').then(m => ({ default: m.ResearchHistory })));
const SavedAuthorities = lazy(() => import('./SavedAuthorities').then(m => ({ default: m.SavedAuthorities })));
const JurisdictionSettings = lazy(() => import('./JurisdictionSettings').then(m => ({ default: m.JurisdictionSettings })));
const ShepardizingTool = lazy(() => import('./ShepardizingTool').then(m => ({ default: m.ShepardizingTool })));
const ClauseLibrary = lazy(() => import('../../clauses/components/ClauseLibrary'));

interface ResearchToolContentProps {
    activeView: string;
    caseId?: string;
    selectedClause: Clause | null;
    setSelectedClause: (c: Clause | null) => void;
}

export function ResearchToolContent({ activeView, caseId: _caseId, selectedClause: _selectedClause, setSelectedClause: _setSelectedClause }: ResearchToolContentProps) {
    switch (activeView) {
        case 'active': return <ActiveResearch />;
        case 'history': return <ResearchHistory />;
        case 'saved': return <SavedAuthorities />;
        case 'shepardize': return <ShepardizingTool />;
        case 'library': return <ClauseLibrary onSelectClause={() => { }} />;
        case 'settings': return <JurisdictionSettings />;
        default: return <ActiveResearch />;
    }
};
