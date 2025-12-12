/**
 * FeatureFlagsContext.tsx
 * Feature flag management for controlled rollouts and A/B testing
 * Supports remote config, user targeting, and gradual rollouts
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetRoles?: string[];
  enabledForEnvironments?: ('development' | 'staging' | 'production')[];
  metadata?: Record<string, any>;
}

export interface FeatureFlagsState {
  flags: Record<string, FeatureFlag>;
  loading: boolean;
  error: Error | null;
  lastFetch: Date | null;
}

interface FeatureFlagsContextType {
  state: FeatureFlagsState;
  isEnabled: (flagKey: string) => boolean;
  getFlag: (flagKey: string) => FeatureFlag | undefined;
  enableFlag: (flagKey: string) => void;
  disableFlag: (flagKey: string) => void;
  refreshFlags: () => Promise<void>;
  overrideFlag: (flagKey: string, enabled: boolean) => void;
  clearOverrides: () => void;
}

// ============================================================================
// Default Flags
// ============================================================================

const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  // AI Features
  ai_document_analysis: {
    key: 'ai_document_analysis',
    enabled: true,
    description: 'AI-powered document analysis and insights',
    rolloutPercentage: 100,
  },
  ai_case_prediction: {
    key: 'ai_case_prediction',
    enabled: true,
    description: 'AI case outcome prediction',
    rolloutPercentage: 100,
  },
  ai_contract_review: {
    key: 'ai_contract_review',
    enabled: true,
    description: 'Automated contract review and clause extraction',
    rolloutPercentage: 100,
  },

  // Advanced Features
  advanced_analytics: {
    key: 'advanced_analytics',
    enabled: true,
    description: 'Advanced analytics dashboard',
    rolloutPercentage: 100,
  },
  real_time_collaboration: {
    key: 'real_time_collaboration',
    enabled: true,
    description: 'Real-time collaborative editing',
    rolloutPercentage: 100,
  },
  offline_mode: {
    key: 'offline_mode',
    enabled: true,
    description: 'Offline mode with sync',
    rolloutPercentage: 100,
  },

  // Beta Features
  war_room_video: {
    key: 'war_room_video',
    enabled: false,
    description: 'Video conferencing in war room',
    rolloutPercentage: 50,
    targetRoles: ['admin', 'attorney'],
  },
  voice_commands: {
    key: 'voice_commands',
    enabled: false,
    description: 'Voice command support',
    rolloutPercentage: 25,
  },
  blockchain_evidence: {
    key: 'blockchain_evidence',
    enabled: false,
    description: 'Blockchain-based evidence verification',
    rolloutPercentage: 10,
    targetRoles: ['admin'],
  },

  // Experimental Features
  quantum_search: {
    key: 'quantum_search',
    enabled: false,
    description: 'Quantum-enhanced legal research',
    rolloutPercentage: 0,
    enabledForEnvironments: ['development'],
  },
  predictive_scheduling: {
    key: 'predictive_scheduling',
    enabled: false,
    description: 'AI predictive calendar scheduling',
    rolloutPercentage: 5,
  },
};

// ============================================================================
// Context Creation
// ============================================================================

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  FLAGS: 'feature_flags',
  OVERRIDES: 'feature_flag_overrides',
  LAST_FETCH: 'feature_flags_last_fetch',
};

// ============================================================================
// Helper Functions
// ============================================================================

function getUserId(): string | null {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.id || null;
    }
  } catch (error) {
    console.error('Failed to get user ID:', error);
  }
  return null;
}

function getUserRole(): string | null {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.role || null;
    }
  } catch (error) {
    console.error('Failed to get user role:', error);
  }
  return null;
}

function getEnvironment(): 'development' | 'staging' | 'production' {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('staging')) {
    return 'staging';
  }
  return 'production';
}

function checkRollout(flag: FeatureFlag, userId: string | null): boolean {
  // Check environment
  if (flag.enabledForEnvironments && !flag.enabledForEnvironments.includes(getEnvironment())) {
    return false;
  }

  // Check user targeting
  if (flag.targetUsers && userId && flag.targetUsers.includes(userId)) {
    return true;
  }

  // Check role targeting
  const userRole = getUserRole();
  if (flag.targetRoles && userRole && flag.targetRoles.includes(userRole)) {
    return true;
  }

  // Check rollout percentage
  if (flag.rolloutPercentage !== undefined && userId) {
    // Deterministic hash-based rollout
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bucket = hash % 100;
    return bucket < flag.rolloutPercentage;
  }

  return flag.enabled;
}

// ============================================================================
// Provider Component
// ============================================================================

interface FeatureFlagsProviderProps {
  children: ReactNode;
  apiEndpoint?: string;
  refreshInterval?: number; // in milliseconds
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({
  children,
  apiEndpoint = '/api/feature-flags',
  refreshInterval = 300000, // 5 minutes
}) => {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  // ============================================================================
  // Load persisted data
  // ============================================================================

  useEffect(() => {
    try {
      const savedFlags = localStorage.getItem(STORAGE_KEYS.FLAGS);
      if (savedFlags) {
        setFlags(JSON.parse(savedFlags));
      }

      const savedOverrides = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
      if (savedOverrides) {
        setOverrides(JSON.parse(savedOverrides));
      }

      const savedLastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
      if (savedLastFetch) {
        setLastFetch(new Date(savedLastFetch));
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
  }, []);

  // ============================================================================
  // Fetch Flags from Server
  // ============================================================================

  const refreshFlags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch feature flags: ${response.statusText}`);
      }

      const data = await response.json();
      const newFlags = { ...DEFAULT_FLAGS, ...data.flags };

      setFlags(newFlags);
      localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(newFlags));

      const now = new Date();
      setLastFetch(now);
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH, now.toISOString());
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Keep using cached flags on error
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  // ============================================================================
  // Auto-refresh interval
  // ============================================================================

  useEffect(() => {
    // Initial fetch
    refreshFlags();

    // Set up interval
    const interval = setInterval(refreshFlags, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshFlags, refreshInterval]);

  // ============================================================================
  // Check if Flag is Enabled
  // ============================================================================

  const isEnabled = useCallback(
    (flagKey: string): boolean => {
      // Check for override first
      if (overrides[flagKey] !== undefined) {
        return overrides[flagKey];
      }

      const flag = flags[flagKey];
      if (!flag) {
        return false; // Default to disabled for unknown flags
      }

      const userId = getUserId();
      return checkRollout(flag, userId);
    },
    [flags, overrides]
  );

  // ============================================================================
  // Get Flag
  // ============================================================================

  const getFlag = useCallback(
    (flagKey: string): FeatureFlag | undefined => {
      return flags[flagKey];
    },
    [flags]
  );

  // ============================================================================
  // Enable/Disable Flags (local override)
  // ============================================================================

  const enableFlag = useCallback((flagKey: string) => {
    setOverrides(prev => {
      const newOverrides = { ...prev, [flagKey]: true };
      localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(newOverrides));
      return newOverrides;
    });
  }, []);

  const disableFlag = useCallback((flagKey: string) => {
    setOverrides(prev => {
      const newOverrides = { ...prev, [flagKey]: false };
      localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(newOverrides));
      return newOverrides;
    });
  }, []);

  // ============================================================================
  // Override Flag (for testing)
  // ============================================================================

  const overrideFlag = useCallback((flagKey: string, enabled: boolean) => {
    setOverrides(prev => {
      const newOverrides = { ...prev, [flagKey]: enabled };
      localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(newOverrides));
      return newOverrides;
    });
  }, []);

  // ============================================================================
  // Clear All Overrides
  // ============================================================================

  const clearOverrides = useCallback(() => {
    setOverrides({});
    localStorage.removeItem(STORAGE_KEYS.OVERRIDES);
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const state: FeatureFlagsState = {
    flags,
    loading,
    error,
    lastFetch,
  };

  const value: FeatureFlagsContextType = {
    state,
    isEnabled,
    getFlag,
    enableFlag,
    disableFlag,
    refreshFlags,
    overrideFlag,
    clearOverrides,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
};

// ============================================================================
// Convenience Hook for Single Flag
// ============================================================================

export const useFeatureFlag = (flagKey: string): boolean => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagKey);
};

export default FeatureFlagsContext;
