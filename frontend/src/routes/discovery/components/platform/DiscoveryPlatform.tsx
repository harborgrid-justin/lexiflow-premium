/**
 * @module components/discovery/DiscoveryPlatform
 * @category Discovery
 * @description Comprehensive discovery platform with requests, productions, and ESI.
 *
 * REACT V18 CONCURRENT-SAFE:
 * - Refactored to use DiscoveryContext for state management
 * - Implements strict separation of urgent/non-urgent updates
 * - Uses Suspense and Transition boundaries
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Clock, Plus, Users } from 'lucide-react';
import React, { lazy, Suspense, useCallback, useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '@/components/atoms/Button/Button';
import { LazyLoader } from '@/components/molecules/LazyLoader/LazyLoader';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { DiscoveryErrorBoundary } from './DiscoveryErrorBoundary';
import { DiscoveryNavigation } from './layout/DiscoveryNavigation';

// Hooks & Context
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotify } from '@/hooks/useNotify';
import { queryClient } from '@/hooks/useQueryHooks';
import { useTheme } from "@/hooks/useTheme";
import { DiscoveryProvider, useDiscoveryActions, useDiscoveryState } from './contexts/DiscoveryContext';

// Services & Utils
import { DiscoveryRepository } from '@/services/api/discoveryRepository';
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/lib/cn';
import type { DiscoveryView } from '@/utils/discoveryNavigation';
import { queryKeys } from '@/utils/queryKeys';

// Internal Discovery Components (Lazy)
const DiscoveryDashboard = lazy(() => import('./dashboard/DiscoveryDashboard').then(m => ({ default: m.DiscoveryDashboard })));
const DiscoveryRequests = lazy(() => import('./DiscoveryRequests').then(m => ({ default: m.DiscoveryRequests })));
const DiscoveryDepositions = lazy(() => import('./DiscoveryDepositions').then(m => ({ default: m.DiscoveryDepositions })));
const Examinations = lazy(() => import('./Examinations').then(m => ({ default: m.Examinations })));
const Custodians = lazy(() => import('./Custodians').then(m => ({ default: m.Custodians })));
const ESISourcesList = lazy(() => import('./ESISourcesList').then(m => ({ default: m.ESISourcesList })));
const DiscoveryProductions = lazy(() => import('./DiscoveryProductions').then(m => ({ default: m.DiscoveryProductions })));
const DiscoveryInterviews = lazy(() => import('./DiscoveryInterviews').then(m => ({ default: m.DiscoveryInterviews })));
const PrivilegeLogEnhanced = lazy(() => import('./PrivilegeLogEnhanced').then(m => ({ default: m.PrivilegeLogEnhanced })));
const LegalHoldsEnhanced = lazy(() => import('./LegalHoldsEnhanced').then(m => ({ default: m.LegalHoldsEnhanced })));
const Collections = lazy(() => import('./Collections').then(m => ({ default: m.Collections })));
const Processing = lazy(() => import('./Processing').then(m => ({ default: m.Processing })));
const Review = lazy(() => import('./Review').then(m => ({ default: m.Review })));
const DiscoveryTimeline = lazy(() => import('./DiscoveryTimeline').then(m => ({ default: m.DiscoveryTimeline })));
const DiscoveryDocumentViewer = lazy(() => import('./DiscoveryDocumentViewer').then(m => ({ default: m.DiscoveryDocumentViewer })));
const DiscoveryResponse = lazy(() => import('./DiscoveryResponse').then(m => ({ default: m.DiscoveryResponse })));
const ProductionWizard = lazy(() => import('./ProductionWizard').then(m => ({ default: m.ProductionWizard })));
const DiscoveryRequestWizard = lazy(() => import('./DiscoveryRequestWizard').then(m => ({ default: m.DiscoveryRequestWizard })));

// Skeletons
const DiscoveryRequestsSkeleton = lazy(() => import('./DiscoverySkeleton').then(m => ({ default: m.DiscoveryRequestsSkeleton })));
const PrivilegeLogSkeleton = lazy(() => import('./DiscoverySkeleton').then(m => ({ default: m.PrivilegeLogSkeleton })));
const LegalHoldsSkeleton = lazy(() => import('./DiscoverySkeleton').then(m => ({ default: m.LegalHoldsSkeleton })));
const ESIDashboardSkeleton = lazy(() => import('./DiscoverySkeleton').then(m => ({ default: m.ESIDashboardSkeleton })));


// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DiscoveryPlatformProps {
    initialTab?: DiscoveryView;
    caseId?: string;
    onNavigateToCase?: (caseId: string) => void;
}

// ============================================================================
// CONTENT COMPONENT
// ============================================================================

const DiscoveryPlatformContent: React.FC<DiscoveryPlatformProps> = ({ caseId, onNavigateToCase: _onNavigateToCase }) => {
    const { theme } = useTheme();
    const notify = useNotify();

    const {
        activeTab,
        activeParentTabId,
        contextId,
        requests,
        isPending,
        isSyncing
    } = useDiscoveryState();

    const {
        setActiveTab,
        handleParentTabChange,
        syncDeadlines,
        setContextId
    } = useDiscoveryActions();

    const handleNavigate = useCallback((targetView: DiscoveryView, id?: string) => {
        if (id) setContextId(id);
        setActiveTab(targetView);
    }, [setContextId, setActiveTab]);

    const handleBackToDashboard = useCallback(() => {
        setActiveTab('dashboard');
        setContextId(null);
    }, [setActiveTab, setContextId]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'mod+d': () => setActiveTab('dashboard'),
        'mod+r': () => setActiveTab('requests'),
        'mod+p': () => setActiveTab('privilege'),
        'mod+h': () => setActiveTab('holds'),
        'mod+e': () => setActiveTab('esi'),
        'escape': () => {
            if (['doc_viewer', 'response', 'production_wizard', 'request_wizard'].includes(activeTab)) {
                handleBackToDashboard();
            }
        }
    });

    const handleSaveResponse = async (reqId: string) => {
        const discovery = DataService.discovery as unknown as DiscoveryRepository;
        await discovery.updateRequestStatus(reqId, 'Responded');
        queryClient.invalidate(caseId ? queryKeys.discovery.byCaseId(caseId) : queryKeys.discovery.all());
        notify.success(`Response saved for ${reqId}. Status updated to Responded.`);
        setActiveTab('requests');
    };

    const isWizardView = ['doc_viewer', 'response', 'production_wizard', 'request_wizard'].includes(activeTab);

    // Render Logic utilizing concurrent features (Suspense)
    const tabContentMap = useMemo(() => ({
        'dashboard': <DiscoveryDashboard onNavigate={handleNavigate} caseId={caseId} />,
        'requests': <DiscoveryRequests items={requests} onNavigate={handleNavigate} />,
        'depositions': <DiscoveryDepositions caseId={caseId} />,
        'examinations': <Examinations caseId={caseId} />,
        'custodians': <Custodians caseId={caseId} />,
        'esi': <ESISourcesList caseId={caseId} />,
        'productions': <DiscoveryProductions caseId={caseId} onCreateClick={() => setActiveTab('production_wizard')} />,
        'interviews': <DiscoveryInterviews caseId={caseId} />,
        'privilege': <PrivilegeLogEnhanced caseId={caseId} />,
        'holds': <LegalHoldsEnhanced caseId={caseId} />,
        'collections': <Collections caseId={caseId} />,
        'processing': <Processing caseId={caseId} />,
        'review': <Review caseId={caseId} />,
        'timeline': <DiscoveryTimeline caseId={caseId} />,
        'plan': (
            <div className={cn("p-12 flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed", theme.border.default)}>
                <Users className={cn("h-16 w-16 mb-4 opacity-20", theme.text.primary)} />
                <p className={cn("font-medium text-lg", theme.text.primary)}>Rule 26(f) Discovery Plan Builder</p>
                <p className={cn("text-sm mb-6", theme.text.secondary)}>Collaborative editor for joint discovery plans.</p>
                <Button variant="outline" onClick={handleBackToDashboard}>Return to Dashboard</Button>
            </div>
        ),
    }), [requests, theme, handleNavigate, handleBackToDashboard, setActiveTab, caseId]);

    // Wizard Views
    if (isWizardView) {
        return (
            <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
                <Suspense fallback={<LazyLoader message="Loading Discovery Wizard..." />}>
                    {activeTab === 'doc_viewer' && (
                        <DiscoveryDocumentViewer docId={contextId || ''} onBack={handleBackToDashboard} />
                    )}
                    {activeTab === 'response' && (
                        <div className="p-6 h-full"><DiscoveryResponse request={requests.find(r => r.id === contextId) || null} onBack={() => setActiveTab('requests')} onSave={handleSaveResponse} /></div>
                    )}
                    {activeTab === 'production_wizard' && (
                        <div className="h-full"><ProductionWizard caseId={caseId} onComplete={() => setActiveTab('productions')} onCancel={() => setActiveTab('productions')} /></div>
                    )}
                    {activeTab === 'request_wizard' && (
                        <div className="h-full"><DiscoveryRequestWizard caseId={caseId} onComplete={() => setActiveTab('requests')} onCancel={() => handleBackToDashboard()} /></div>
                    )}
                </Suspense>
            </div>
        );
    }

    const renderSkeleton = () => {
        switch (activeTab) {
            case 'requests': return <DiscoveryRequestsSkeleton />;
            case 'privilege': return <PrivilegeLogSkeleton />;
            case 'holds': return <LegalHoldsSkeleton />;
            case 'esi': return <ESIDashboardSkeleton />;
            default: return <LazyLoader message="Loading Discovery Module..." />;
        }
    };

    return (
        <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
            <div className={cn("px-6 pt-6 shrink-0 z-10", caseId ? "pt-2" : "")}>
                {!caseId && (
                    <PageHeader
                        title="Discovery Center"
                        subtitle="Manage Requests, Legal Holds, and FRCP Compliance."
                        actions={
                            <div className="flex gap-2">
                                <Button variant="secondary" icon={Clock} onClick={() => syncDeadlines()} isLoading={isSyncing}>Sync Deadlines</Button>
                                <Button variant="primary" icon={Plus} onClick={() => setActiveTab('request_wizard')}>Create Request</Button>
                            </div>
                        }
                    />
                )}

                <DiscoveryNavigation
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    activeParentTabId={activeParentTabId}
                    onParentTabChange={handleParentTabChange}
                />
            </div>

            <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0 relative">
                <div className={cn("h-full overflow-y-auto custom-scrollbar", isPending && "opacity-60 transition-opacity")}>
                    <Suspense fallback={renderSkeleton()}>
                        {tabContentMap[activeTab as keyof typeof tabContentMap]}
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DiscoveryPlatform: React.FC<DiscoveryPlatformProps> = (props) => {
    return (
        <DiscoveryErrorBoundary onReset={() => window.location.reload()}>
            <DiscoveryProvider caseId={props.caseId} initialTab={props.initialTab}>
                <DiscoveryPlatformContent {...props} />
            </DiscoveryProvider>
        </DiscoveryErrorBoundary>
    );
};

export default DiscoveryPlatform;
