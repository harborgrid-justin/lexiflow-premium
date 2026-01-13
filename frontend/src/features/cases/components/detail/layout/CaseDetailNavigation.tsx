/**
 * CaseDetailNavigation.tsx
 *
 * Two-level navigation component for case detail tabs with parent/child hierarchy
 * and active state indicators.
 *
 * @module components/case-detail/layout/CaseDetailNavigation
 * @category Case Management - Navigation
 */

// External Dependencies
import { useMemo } from 'react';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/features/theme';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';
import { CASE_DETAIL_TABS } from '../CaseDetailConfig';

interface CaseDetailNavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onParentTabChange: (parentId: string) => void;
}

export const CaseDetailNavigation: React.FC<CaseDetailNavigationProps> = ({
    activeTab, setActiveTab, onParentTabChange
}) => {
    const { theme } = useTheme();

    const activeParentTab = useMemo(() =>
        CASE_DETAIL_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || CASE_DETAIL_TABS[0],
        [activeTab]);

    if (!activeParentTab) return null;

    return (
        <div className="px-6 pt-2 shrink-0">
            <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
                {CASE_DETAIL_TABS.map(parent => (
                    <button
                        key={parent.id}
                        onClick={() => onParentTabChange(parent.id)}
                        className={cn(
                            "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                            activeParentTab.id === parent.id
                                ? cn("border-current", theme.primary.text)
                                : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                        )}
                    >
                        <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)} />
                        {parent.label}
                    </button>
                ))}
            </div>

            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surface.highlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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
        </div>
    );
};
