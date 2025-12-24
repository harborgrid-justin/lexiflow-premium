/**
 * @module components/rules/RulesPlatform
 * @category Rules & Procedures
 * @description Procedural rules platform with federal, state, and local rules.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, lazy, useMemo, useCallback, useEffect, useState, useTransition } from 'react';
import { Plus, Filter } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';

// Components
import { PageHeader } from '../../common/PageHeader';
import { Button } from '../../common/Button';
import { LazyLoader } from '../../common/LazyLoader';
import { RulesPlatformContent } from './RulesPlatformContent';

// Utils & Config
import { cn } from '@/utils/cn';
import { RULES_PLATFORM_TABS, RulesView } from '../../../config/tabs.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface RulesPlatformProps {
    /** Optional initial tab to display. */
    initialTab?: RulesView;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RulesPlatform: React.FC<RulesPlatformProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<RulesView>('dashboard');

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    RULES_PLATFORM_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || RULES_PLATFORM_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = RULES_PLATFORM_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as RulesView);
    }
  }, []);

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
            title="Legal Authority Management" 
            subtitle="Comprehensive legal authority management, compliance tracking, and judicial standing orders."
            actions={
              <div className="flex gap-2">
                  <Button variant="secondary" icon={Filter}>My Jurisdictions</Button>
                  <Button variant="primary" icon={Plus}>Add Rule Set</Button>
              </div>
            }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {RULES_PLATFORM_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surface.highlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as RulesView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
            <Suspense fallback={<LazyLoader message="Loading Rules Module..." />}>
                <RulesPlatformContent activeTab={activeTab} setActiveTab={setActiveTab} />
            </Suspense>
        </div>
      </div>
    </div>
  );
};
export default RulesPlatform;
