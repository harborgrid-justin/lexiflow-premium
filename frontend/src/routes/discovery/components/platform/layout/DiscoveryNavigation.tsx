// components/discovery/layout/DiscoveryNavigation.tsx
import { DISCOVERY_TAB_CONFIG } from '@/config/tabs.config';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import type { DiscoveryView } from '@/utils/discoveryNavigation';


interface DiscoveryNavigationProps {
  activeTab: DiscoveryView;
  setActiveTab: (tab: DiscoveryView) => void;
  activeParentTabId: string;
  onParentTabChange: (parentId: string) => void;
}

const PARENT_TABS = DISCOVERY_TAB_CONFIG;

export function DiscoveryNavigation({
  activeTab, setActiveTab, activeParentTabId, onParentTabChange
}: DiscoveryNavigationProps) {
  const { theme } = useTheme();

  const activeParentTab = PARENT_TABS.find(p => p.id === activeParentTabId) || PARENT_TABS[0];

  return (
    <>
      {/* Desktop Parent Navigation */}
      <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
        {PARENT_TABS.map(parent => (
          <button
            key={parent.id}
            onClick={() => onParentTabChange(parent.id)}
            className={cn(
              "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
              activeParentTabId === parent.id
                ? cn("border-current", theme.primary.text)
                : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
            )}
          >
            <parent.icon className={cn("h-4 w-4 mr-2", activeParentTabId === parent.id ? theme.primary.text : theme.text.tertiary)} />
            {parent.label}
          </button>
        ))}
      </div>

      {/* Sub-Navigation (Pills) */}
      {activeParentTab && activeParentTab.subTabs && activeParentTab.subTabs.length > 1 && (
        <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surface.highlight, theme.border.default)}>
          {activeParentTab.subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DiscoveryView)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                activeTab === tab.id
                  ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border)
                  : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`)
              )}
            >
              <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)} />
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

// Re-export utilities for backwards compatibility
// New code should import directly from '@/utils/discoveryNavigation'
export { getFirstTabOfParent, getParentTabForView } from '@/utils/discoveryNavigation';

export default DiscoveryNavigation;
