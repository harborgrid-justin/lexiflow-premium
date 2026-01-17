import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';

// Components
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { CASE_DETAIL_TABS } from '@/routes/cases/components/detail/CaseDetailConfig';
import { CaseDetailHeader } from '@/routes/cases/components/detail/CaseDetailHeader';
import { CaseDetailMobileMenu } from '@/routes/cases/components/detail/CaseDetailMobileMenu';
import { CaseDetailNavigation } from '@/routes/cases/components/detail/layout/CaseDetailNavigation';
import { MobileTimelineOverlay } from '@/routes/cases/components/detail/MobileTimelineOverlay';

// Hooks & Context
import { useCaseDetailContext } from './CaseDetailContext';

// Services & Utils

export function CaseDetailShell() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTimelineOverlay, setShowTimelineOverlay] = useState(false);

  // Consume from context
  const {
    caseData,
    activeTab,
    setActiveTab,
    timelineEvents,
  } = useCaseDetailContext();

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = CASE_DETAIL_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0]!.id);
    }
  }, [setActiveTab]);

  return (
    <div className={cn("h-full flex flex-col", theme.surface.default)}>
      {/* Header */}
      <CaseDetailHeader
        id={caseData.id}
        title={caseData.title}
        status={caseData.status}
        client={caseData.client}
        clientId={caseData.clientId || caseData.id}
        jurisdiction={caseData.jurisdiction}
        onBack={() => navigate('/cases')}
        onShowTimeline={() => setShowTimelineOverlay(true)}
      />

      {/* Navigation */}
      <CaseDetailNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onParentTabChange={handleParentTabChange}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setShowMobileMenu(true)}
        className={cn(
          "md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center z-40",
          theme.action.primary.bg, theme.action.primary.text, theme.action.primary.hover
        )}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Mobile Menus */}
      <CaseDetailMobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setShowMobileMenu(false);
        }}
      />

      <MobileTimelineOverlay
        isOpen={showTimelineOverlay}
        onClose={() => setShowTimelineOverlay(false)}
        events={timelineEvents}
        onEventClick={(e) => {
          if ((e.type as string) === 'docket' && e.id) {
            navigate(`/docket/${e.id}`);
          }
        }}
      />
    </div>
  );
}
