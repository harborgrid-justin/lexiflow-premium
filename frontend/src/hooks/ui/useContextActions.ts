/**
 * @module hooks/useContextActions
 * @category Hooks
 * @description Context-sensitive toolbar that adapts based on selection and user behavior.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import type React from "react";

/**
 * Icon type - can be any React component
 */
export type IconComponent = React.ComponentType<{
  className?: string;
  size?: number;
}>;

/**
 * Toolbar action definition
 */
export interface ToolbarAction {
  id: string;
  label: string;
  icon: IconComponent;
  onClick: () => void;
  category?: "edit" | "format" | "insert" | "view" | "custom";
  shortcut?: string;
  disabled?: boolean;
  badge?: string | number;
  priority?: number; // Higher = more important (0-100)
}

/**
 * Context information for toolbar adaptation
 */
export interface ToolbarContext {
  selection?: {
    type: "text" | "image" | "table" | "element" | "none";
    length?: number;
    content?: string;
  };
  document?: {
    type: string;
    canEdit: boolean;
    canComment: boolean;
  };
  userPreferences?: {
    recentActions?: string[]; // Action IDs
    favoriteActions?: string[];
    hiddenActions?: string[];
  };
}

/**
 * Action usage statistics
 */
interface ActionStats {
  actionId: string;
  useCount: number;
  lastUsed: Date;
  avgTimeBetweenUses: number; // in milliseconds
  contextPatterns: Map<string, number>; // Context signature -> count
}

/**
 * Hook options
 */
export interface UseContextToolbarOptions {
  maxVisible?: number; // Maximum visible actions before overflow
  enableLearning?: boolean; // Track and adapt to user behavior
  storageKey?: string; // LocalStorage key for persistence
  adaptationWeight?: number; // 0-1, how much to weight learning vs static priority
}

/**
 * Hook return type
 */
export interface UseContextToolbarReturn {
  visibleActions: ToolbarAction[];
  overflowActions: ToolbarAction[];
  executeAction: (actionId: string) => void;
  setContext: (context: ToolbarContext) => void;
  markFavorite: (actionId: string, isFavorite: boolean) => void;
  hideAction: (actionId: string, isHidden: boolean) => void;
  resetLayout: () => void;
  getActionStats: (actionId: string) => ActionStats | undefined;
}

/**
 * Generate context signature for pattern matching
 */
function getContextSignature(context: ToolbarContext): string {
  const parts: string[] = [];

  if (context.selection) {
    parts.push(`sel:${context.selection.type}`);
    if (context.selection.length) {
      parts.push(`len:${context.selection.length > 100 ? "long" : "short"}`);
    }
  }

  if (context.document) {
    parts.push(`doc:${context.document.type}`);
    parts.push(`edit:${context.document.canEdit}`);
  }

  return parts.join("|");
}

/**
 * Context-Sensitive Toolbar Hook
 *
 * Adapts toolbar based on:
 * - Current selection type
 * - Document type and permissions
 * - User preferences and favorites
 * - Usage patterns (ML-like learning)
 *
 * @example
 * ```tsx
 * const {
 *   visibleActions,
 *   overflowActions,
 *   executeAction,
 *   setContext
 * } = useContextToolbar(allActions, {
 *   maxVisible: 8,
 *   enableLearning: true
 * });
 *
 * // Update context when selection changes
 * useEffect(() => {
 *   setContext({
 *     selection: { type: 'text', length: 150 },
 *     document: { type: 'pleading', canEdit: true }
 *   });
 * }, [selection]);
 * ```
 */
export function useContextToolbar(
  allActions: ToolbarAction[],
  options: UseContextToolbarOptions = {}
): UseContextToolbarReturn {
  const {
    maxVisible = 8,
    enableLearning = true,
    storageKey = "toolbar-context-data",
    adaptationWeight = 0.3,
  } = options;

  const [context, setContext] = useState<ToolbarContext>({});
  const [actionStats, setActionStats] = useState<Map<string, ActionStats>>(
    new Map()
  );
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Load persisted data
  useEffect(() => {
    if (!enableLearning) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);

        // Restore stats
        interface StoredActionStats {
          lastUsed: string;
          contextPatterns?: Record<string, number>;
          [key: string]: unknown;
        }
        const statsMap = new Map<string, ActionStats>();
        Object.entries(data.stats || {}).forEach(
          ([id, stat]: [string, unknown]) => {
            const storedStat = stat as StoredActionStats;
            statsMap.set(id, {
              actionId: id,
              useCount: Number(storedStat.useCount) || 0,
              avgTimeBetweenUses: Number(storedStat.avgTimeBetweenUses) || 0,
              ...storedStat,
              lastUsed: new Date(storedStat.lastUsed),
              contextPatterns: new Map(
                Object.entries(storedStat.contextPatterns || {})
              ),
            });
          }
        );
        setActionStats(statsMap);

        // Restore preferences
        if (data.favorites) setFavorites(new Set(data.favorites));
        if (data.hidden) setHidden(new Set(data.hidden));
      }
    } catch (error) {
      console.error("Failed to load toolbar context data:", error);
    }
  }, [storageKey, enableLearning]);

  // Save data periodically
  useEffect(() => {
    if (!enableLearning) return;

    const saveTimer = setInterval(() => {
      try {
        const statsObject: Record<string, unknown> = {};
        actionStats.forEach((stat, id) => {
          statsObject[id] = {
            ...stat,
            lastUsed: stat.lastUsed.toISOString(),
            contextPatterns: Object.fromEntries(stat.contextPatterns),
          };
        });

        const data = {
          stats: statsObject,
          favorites: Array.from(favorites),
          hidden: Array.from(hidden),
        };

        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save toolbar context data:", error);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveTimer);
  }, [actionStats, favorites, hidden, storageKey, enableLearning]);

  /**
   * Calculate dynamic priority for an action
   */
  const calculateDynamicPriority = useCallback(
    (action: ToolbarAction): number => {
      let priority = action.priority ?? 50; // Base priority

      // Favorites get significant boost
      if (favorites.has(action.id)) {
        priority += 30;
      }

      // Hidden actions get heavily penalized
      if (hidden.has(action.id)) {
        priority -= 100;
      }

      if (!enableLearning) {
        return priority;
      }

      const stats = actionStats.get(action.id);
      if (!stats) return priority;

      // Recent usage boost
      const timeSinceUse = Date.now() - stats.lastUsed.getTime();
      const daysSinceUse = timeSinceUse / (1000 * 60 * 60 * 24);

      if (daysSinceUse < 1) {
        priority += 15; // Used today
      } else if (daysSinceUse < 7) {
        priority += 10; // Used this week
      } else if (daysSinceUse < 30) {
        priority += 5; // Used this month
      }

      // Frequency boost (logarithmic to avoid over-weighting high-use actions)
      const frequencyScore = Math.log10(stats.useCount + 1) * 10;
      priority += frequencyScore;

      // Context pattern matching
      const currentSignature = getContextSignature(context);
      const contextScore = stats.contextPatterns.get(currentSignature) || 0;
      priority += contextScore * 5; // Boost if commonly used in this context

      // Apply adaptation weight
      const learningBoost = priority - (action.priority ?? 50);
      priority = (action.priority ?? 50) + learningBoost * adaptationWeight;

      return priority;
    },
    [context, actionStats, favorites, hidden, enableLearning, adaptationWeight]
  );

  /**
   * Filter actions based on context
   */
  const getRelevantActions = useCallback((): ToolbarAction[] => {
    return allActions.filter((action) => {
      // Filter by context-specific rules
      if (action.disabled) return false;

      // Selection-based filtering
      if (context.selection) {
        // Example: Format actions only relevant when text is selected
        if (action.category === "format" && context.selection.type === "none") {
          return false;
        }
      }

      // Document permission filtering
      if (context.document) {
        if (action.category === "edit" && !context.document.canEdit) {
          return false;
        }
      }

      return true;
    });
  }, [allActions, context]);

  /**
   * Sort actions by calculated priority
   */
  const sortedActions = useMemo(() => {
    const relevant = getRelevantActions();

    return relevant
      .map((action) => ({
        action,
        priority: calculateDynamicPriority(action),
      }))
      .sort((a, b) => b.priority - a.priority)
      .map((item) => item.action);
  }, [getRelevantActions, calculateDynamicPriority]);

  /**
   * Split into visible and overflow
   */
  const { visibleActions, overflowActions } = useMemo(() => {
    const visible = sortedActions.slice(0, maxVisible);
    const overflow = sortedActions.slice(maxVisible);

    return { visibleActions: visible, overflowActions: overflow };
  }, [sortedActions, maxVisible]);

  /**
   * Execute an action and record usage
   */
  const executeAction = useCallback(
    (actionId: string) => {
      const action = allActions.find((a) => a.id === actionId);
      if (!action) return;

      // Execute the action
      action.onClick();

      // Record usage statistics
      if (enableLearning) {
        setActionStats((prev) => {
          const stats = prev.get(actionId) || {
            actionId,
            useCount: 0,
            lastUsed: new Date(),
            avgTimeBetweenUses: 0,
            contextPatterns: new Map(),
          };

          // Update stats
          const timeSinceLastUse = Date.now() - stats.lastUsed.getTime();
          const newUseCount = stats.useCount + 1;
          const newAvg =
            (stats.avgTimeBetweenUses * stats.useCount + timeSinceLastUse) /
            newUseCount;

          // Update context pattern
          const contextSig = getContextSignature(context);
          const contextCount = stats.contextPatterns.get(contextSig) || 0;
          stats.contextPatterns.set(contextSig, contextCount + 1);

          const updated = new Map(prev);
          updated.set(actionId, {
            actionId,
            useCount: newUseCount,
            lastUsed: new Date(),
            avgTimeBetweenUses: newAvg,
            contextPatterns: stats.contextPatterns,
          });

          return updated;
        });
      }
    },
    [allActions, context, enableLearning]
  );

  /**
   * Mark action as favorite
   */
  const markFavorite = useCallback((actionId: string, isFavorite: boolean) => {
    setFavorites((prev) => {
      const updated = new Set(prev);
      if (isFavorite) {
        updated.add(actionId);
      } else {
        updated.delete(actionId);
      }
      return updated;
    });
  }, []);

  /**
   * Hide/show action
   */
  const hideAction = useCallback((actionId: string, isHidden: boolean) => {
    setHidden((prev) => {
      const updated = new Set(prev);
      if (isHidden) {
        updated.add(actionId);
      } else {
        updated.delete(actionId);
      }
      return updated;
    });
  }, []);

  /**
   * Reset to default layout
   */
  const resetLayout = useCallback(() => {
    setActionStats(new Map());
    setFavorites(new Set());
    setHidden(new Set());
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to clear toolbar data:", error);
    }
  }, [storageKey]);

  /**
   * Get stats for a specific action
   */
  const getActionStats = useCallback(
    (actionId: string): ActionStats | undefined => {
      return actionStats.get(actionId);
    },
    [actionStats]
  );

  return {
    visibleActions,
    overflowActions,
    executeAction,
    setContext,
    markFavorite,
    hideAction,
    resetLayout,
    getActionStats,
  };
}

export default useContextToolbar;
