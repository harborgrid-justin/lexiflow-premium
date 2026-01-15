/**
 * @module hooks/useSettlementSimulation
 * @category Hooks - Analytics
 * 
 * Provides Monte Carlo settlement simulation for legal case analysis.
 * Calculates expected values and risk percentiles.
 * 
 * @example
 * ```typescript
 * const simulation = useSettlementSimulation({
 *   initialParams: {
 *     low: 500000,
 *     high: 1500000,
 *     liabilityProb: 75
 *   }
 * });
 * 
 * <button onClick={simulation.runSimulation}>Run Simulation</button>
 * <div>Expected Value: ${simulation.metrics.ev}</div>
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import { SimulationEngine } from '@/utils/simulationEngine';
import { Scheduler } from '@/utils/scheduler';

// ============================================================================
// TYPES
// ============================================================================

export interface SimulationMetrics {
  /** Expected value */
  ev: number;
  /** 25th percentile (conservative) */
  p25: number;
  /** 75th percentile (aggressive) */
  p75: number;
}

export interface SimulationResult {
  /** Value range label */
  range: string;
  /** Number of results in range */
  count: number;
  /** Representative value */
  value: number;
}

export interface SimulationParams {
  /** Low estimate */
  low: number;
  /** High estimate */
  high: number;
  /** Liability probability (0-100) */
  liabilityProb: number;
  /** Number of iterations */
  iterations: number;
}

export interface UseSettlementSimulationOptions {
  /** Initial parameter values */
  initialParams?: Partial<SimulationParams>;
  /** Auto-run simulation on mount */
  autoRunOnMount?: boolean;
}

/**
 * Return type for useSettlementSimulation hook
 */
export interface UseSettlementSimulationReturn {
  /** Current simulation parameters */
  params: SimulationParams;
  /** Update single parameter */
  updateParam: (key: keyof SimulationParams, value: number) => void;
  /** Update multiple parameters */
  updateParams: (newParams: Partial<SimulationParams>) => void;
  /** Whether simulation is running */
  isCalculating: boolean;
  /** Simulation results */
  results: SimulationResult[];
  /** Calculated metrics */
  metrics: SimulationMetrics;
  /** Run simulation with current parameters */
  runSimulation: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages Monte Carlo settlement simulation.
 * 
 * @param options - Configuration options
 * @returns Object with simulation state and control methods
 */
export function useSettlementSimulation(
  options: UseSettlementSimulationOptions = {}
): UseSettlementSimulationReturn {
  const {
    initialParams = {},
    autoRunOnMount = true
  } = options;

  const [params, setParams] = useState<SimulationParams>({
    low: initialParams.low ?? 500000,
    high: initialParams.high ?? 1500000,
    liabilityProb: initialParams.liabilityProb ?? 75,
    iterations: initialParams.iterations ?? 1000
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [metrics, setMetrics] = useState<SimulationMetrics>({ 
    ev: 0, 
    p25: 0, 
    p75: 0 
  });

  const runSimulation = useCallback(async () => {
    setIsCalculating(true);
    
    try {
      const simulationResults = await Scheduler.scheduleTask(() => {
        return SimulationEngine.runSettlementSimulation({
          low: params.low,
          high: params.high,
          liabilityProb: params.liabilityProb,
          iterations: params.iterations
        });
      });

      setResults(simulationResults.results);
      setMetrics({
        ev: simulationResults.ev,
        p25: simulationResults.p25,
        p75: simulationResults.p75
      });
    } finally {
      setIsCalculating(false);
    }
  }, [params]);

  const updateParam = useCallback((key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateParams = useCallback((newParams: Partial<SimulationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Auto-run on mount if requested
  useMemo(() => {
    if (autoRunOnMount && results.length === 0) {
      runSimulation();
    }
  }, [autoRunOnMount, results.length, runSimulation]);

  return {
    params,
    updateParam,
    updateParams,
    isCalculating,
    results,
    metrics,
    runSimulation
  };
}
