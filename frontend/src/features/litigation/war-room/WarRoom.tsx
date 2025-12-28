/**
 * @module components/war-room/WarRoom
 * @category WarRoom
 * @description Main container for the War Room module.
 * Orchestrates sub-modules like Command Center, Evidence Wall, and Witness Prep.
 * Handles case selection and navigation between strategic views.
 *
 * THEME SYSTEM USAGE:
 * This component heavily utilizes the `useTheme` hook to apply semantic color tokens for
 * text, backgrounds, and borders, ensuring consistency across light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  Suspense,
  lazy,
} from "react";
import {
  Target,
  Monitor,
  Layers,
  FileText,
  Gavel,
  Users,
  Mic2,
  Shield,
  CheckCircle,
  Briefcase,
  Swords,
  ChevronDown,
} from "lucide-react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================

// Services & Data
import { DataService } from "@/services";
import { useQuery } from '@/hooks/useQueryHooks';
import { STORES } from "@/services";
import { queryKeys } from "@/utils/queryKeys";

// Hooks & Context
import { useTheme } from "@/providers";

// Components
import { Button } from '@/components/atoms/Button';
import { LazyLoader } from '@/components/molecules/LazyLoader';

// Utils & Constants
import { cn } from "@/utils";

// Types
import type { Case } from "@/types";

// Subcomponents (Lazy Loaded)
const CommandCenter = lazy(() =>
  import("./CommandCenter").then((m) => ({ default: m.CommandCenter })),
);
const EvidenceWall = lazy(() =>
  import("./EvidenceWall").then((m) => ({ default: m.EvidenceWall })),
);
const WitnessPrep = lazy(() =>
  import("./WitnessPrep").then((m) => ({ default: m.WitnessPrep })),
);
const TrialBinder = lazy(() =>
  import("./TrialBinder").then((m) => ({ default: m.TrialBinder })),
);
const AdvisoryBoard = lazy(() =>
  import("./AdvisoryBoard").then((m) => ({ default: m.AdvisoryBoard })),
);
const OppositionManager = lazy(() =>
  import("./OppositionManager").then((m) => ({ default: m.OppositionManager })),
);
const WarRoomSidebar = lazy(() =>
  import("./WarRoomSidebar").then((m) => ({ default: m.WarRoomSidebar })),
);

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type WarRoomView =
  | "command"
  | "evidence"
  | "witnesses"
  | "binder"
  | "advisory"
  | "opposition";

interface WarRoomProps {
  /** Optional pre-selected tab */
  initialTab?: WarRoomView;
  /** Optional direct case injection, hiding the case selector */
  caseId?: string;
}

// ============================================================================
// MODULE CONSTANTS
// ============================================================================
const PARENT_TABS = [
  {
    id: "strategy",
    label: "Strategy",
    icon: Target,
    subTabs: [
      { id: "command", label: "Command Center", icon: Monitor },
      { id: "advisory", label: "Advisory Board", icon: Briefcase },
      { id: "opposition", label: "Opposition Intel", icon: Swords },
    ],
  },
  {
    id: "presentation",
    label: "Presentation",
    icon: Layers,
    subTabs: [
      { id: "evidence", label: "Evidence Wall", icon: FileText },
      { id: "binder", label: "Trial Notebook", icon: Gavel },
    ],
  },
  {
    id: "witnesses",
    label: "Witnesses",
    icon: Users,
    subTabs: [{ id: "witnesses", label: "Witness Prep", icon: Mic2 }],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================
export function WarRoom({ initialTab, caseId }: WarRoomProps) {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [activeTab, setActiveTab] = useState<WarRoomView>("command");
  const [defcon, setDefcon] = useState<"normal" | "elevated" | "critical">(
    "elevated",
  );
  const [currentCaseId, setCurrentCaseId] = useState<string>(caseId || "");
  const [selectedWitnessId, setSelectedWitnessId] = useState<string | null>(
    null,
  );

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { data: allCasesRaw } = useQuery<Case[]>(
    [STORES.CASES, "all"],
    DataService.cases.getAll,
    { enabled: !caseId },
  );

  // Ensure allCases is always an array (defensive programming for backend data)
  const allCases = useMemo(() => {
    if (!allCasesRaw) return [];
    return Array.isArray(allCasesRaw) ? allCasesRaw : [];
  }, [allCasesRaw]);

  const {
    data: trialData,
    isLoading,
    isError,
    error,
  } = useQuery(
    [STORES.CASES, currentCaseId, "warRoom"],
    async () => {
      const warRoomService = await DataService.warRoom;
      return warRoomService.getData(currentCaseId);
    },
    { enabled: !!currentCaseId },
  );

  // Log errors for debugging
  useEffect(() => {
    if (isError) {
      console.error("[WarRoom] Failed to load war room data:", error);
    }
  }, [isError, error]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  const activeParentTab = useMemo(
    () =>
      PARENT_TABS.find((p: any) => p.subTabs.some((s: any) => s.id === activeTab)) ||
      PARENT_TABS[0],
    [activeTab],
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find((p: any) => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as WarRoomView);
    }
  }, []);

  const handleNavigate = (tab: string, context?: Record<string, unknown>) => {
    setActiveTab(tab as WarRoomView);
    if (tab === "witnesses" && context?.witnessId) {
      setSelectedWitnessId(context.witnessId as string);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (caseId) setCurrentCaseId(caseId);
  }, [caseId]);

  useEffect(() => {
    if (!caseId && allCases.length > 0) {
      if (!currentCaseId || !allCases.find((c: any) => c.id === currentCaseId)) {
        setCurrentCaseId(allCases[0].id);
      }
    }
  }, [allCases, currentCaseId, caseId]);

  // Get the current case object for display
  const currentCase = useMemo(() => {
    return allCases.find((c: any) => c.id === currentCaseId);
  }, [allCases, currentCaseId]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================
  const renderContent = () => {
    if (!trialData) return null;

    switch (activeTab) {
      case "command":
        return (
          <CommandCenter
            caseId={currentCaseId}
            warRoomData={trialData}
            onNavigate={handleNavigate}
          />
        );
      case "evidence":
        return <EvidenceWall caseId={currentCaseId} warRoomData={trialData} />;
      case "witnesses":
        return (
          <WitnessPrep
            caseId={currentCaseId}
            warRoomData={trialData}
            initialWitnessId={selectedWitnessId}
            onClearSelection={() => setSelectedWitnessId(null)}
          />
        );
      case "binder":
        return <TrialBinder caseId={currentCaseId} warRoomData={trialData} />;
      case "advisory":
        return <AdvisoryBoard caseId={currentCaseId} />;
      case "opposition":
        return <OppositionManager caseId={currentCaseId} />;
      default:
        return (
          <CommandCenter
            caseId={currentCaseId}
            warRoomData={trialData}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  if (isLoading) {
    return <LazyLoader message="Initializing War Room..." />;
  }

  if (isError) {
    return (
      <div
        className={cn(
          "h-full flex flex-col items-center justify-center p-6",
          theme.background,
        )}
      >
        <div className="text-center">
          <Target
            className={cn("h-12 w-12 mx-auto mb-4 opacity-20 text-red-500")}
          />
          <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>
            Failed to Load War Room
          </h3>
          <p className={cn("text-sm mb-4", theme.text.secondary)}>
            {error instanceof Error
              ? error.message
              : "An error occurred while loading war room data."}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!trialData) {
    return (
      <div
        className={cn(
          "h-full flex flex-col items-center justify-center p-6",
          theme.background,
        )}
      >
        <div className="text-center">
          <Target
            className={cn(
              "h-12 w-12 mx-auto mb-4 opacity-20",
              theme.text.tertiary,
            )}
          />
          <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>
            Select a Matter
          </h3>
          <p className={cn("text-sm mb-4", theme.text.secondary)}>
            Choose a case to enter the War Room.
          </p>
          <select
            value={currentCaseId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentCaseId(e.target.value)}
            className={cn(
              "p-2 border rounded-md outline-none",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
            )}
          >
            {allCases.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      className={cn("h-full flex flex-col animate-fade-in", theme.background)}
    >
      <div className="px-6 pt-6 shrink-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2
                className={cn(
                  "text-2xl font-bold tracking-tight leading-tight",
                  theme.text.primary,
                )}
              >
                Trial War Room
              </h2>
              {defcon === "critical" && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                  DEFCON 1
                </span>
              )}
              {defcon === "elevated" && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                  ACTIVE APPEAL
                </span>
              )}
              {defcon === "normal" && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  READY
                </span>
              )}
            </div>

            {/* Case Info or Selector */}
            {!caseId && currentCase ? (
              <div className="mt-2 flex items-center gap-3">
                <div className="relative group">
                  <select
                    value={currentCaseId || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentCaseId(e.target.value)}
                    className={cn(
                      "appearance-none bg-transparent font-semibold text-sm pr-6 py-1 outline-none cursor-pointer border-b border-dashed transition-colors hover:border-solid max-w-[300px] md:max-w-[500px] truncate",
                      theme.text.secondary,
                      theme.border.default,
                      `hover:${theme.text.primary}`,
                      `hover:${theme.border.default}`,
                    )}
                  >
                    {allCases.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className={cn(
                      "absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none",
                      theme.text.tertiary,
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-sm font-mono px-1.5 py-0.5 rounded border",
                    theme.surface.highlight,
                    theme.text.tertiary,
                    theme.border.default,
                  )}
                >
                  {currentCase.caseNumber}
                </span>
              </div>
            ) : (
              caseId &&
              currentCase && (
                <div className="mt-2">
                  <p
                    className={cn("font-semibold text-lg", theme.text.primary)}
                  >
                    {currentCase.title}
                  </p>
                  <p className={cn("text-sm font-mono", theme.text.secondary)}>
                    {currentCase.caseNumber}
                  </p>
                </div>
              )
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={Shield}
              className={
                defcon === "critical"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : ""
              }
              onClick={() =>
                setDefcon(defcon === "critical" ? "normal" : "critical")
              }
            >
              Escalate
            </Button>
            <Button variant="primary" size="sm" icon={CheckCircle}>
              Readiness Check
            </Button>
          </div>
        </div>

        {/* Desktop Parent Navigation */}
        <div
          className={cn(
            "hidden md:flex space-x-6 border-b mb-4",
            theme.border.default,
          )}
        >
          {PARENT_TABS.map((parent) => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                activeParentTab.id === parent.id
                  ? cn("border-current", theme.primary.text)
                  : cn(
                      "border-transparent",
                      theme.text.secondary,
                      `hover:${theme.text.primary}`,
                    ),
              )}
            >
              <parent.icon
                className={cn(
                  "h-4 w-4 mr-2",
                  activeParentTab.id === parent.id
                    ? theme.primary.text
                    : theme.text.tertiary,
                )}
              />
              {parent.label}
            </button>
          ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
          <div
            className={cn(
              "flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4",
              theme.surface.highlight,
              theme.border.default,
            )}
          >
            {activeParentTab.subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WarRoomView)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                  activeTab === tab.id
                    ? cn(
                        theme.surface.default,
                        theme.primary.text,
                        "shadow-sm border-transparent ring-1",
                        theme.primary.border,
                      )
                    : cn(
                        "bg-transparent",
                        theme.text.secondary,
                        "border-transparent",
                        `hover:${theme.surface.default}`,
                      ),
                )}
              >
                <tab.icon
                  className={cn(
                    "h-3.5 w-3.5",
                    activeTab === tab.id
                      ? theme.primary.text
                      : theme.text.tertiary,
                  )}
                />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex-1 flex overflow-hidden border-t",
          theme.border.default,
        )}
      >
        <Suspense
          fallback={
            <div
              className={cn(
                "w-64 border-r hidden md:block",
                theme.surface.highlight,
                theme.border.default,
              )}
            ></div>
          }
        >
          <WarRoomSidebar caseData={trialData.case} />
        </Suspense>
        <div
          className={cn("flex-1 overflow-y-auto px-6 py-6 custom-scrollbar")}
        >
          <Suspense
            fallback={<LazyLoader message="Loading War Room Module..." />}
          >
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default WarRoom;
