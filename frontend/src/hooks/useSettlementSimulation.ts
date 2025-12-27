/**
 * useSettlementSimulation.ts
 * 
 * Custom hook for Monte Carlo settlement simulation
 * Separates simulation logic from presentation
 */

import { useState, useCallback, useMemo } from 'react';
import { SimulationEngine, SimulationMetrics as EngineMetrics } from '../utils/simulationEngine';
import { Scheduler } from '@/utils';

interface SimulationMetrics {
  ev: number;    // Expected value
  p25: number;   // 25th percentile (conservative)
  p75: number;   // 75th percentile (aggressive)
}

interface SimulationResult {
  range: string;
  count: number;
  value: number;
}

interface SimulationParams {
  low: number;
  high: number;
  liabilityProb: number;
  iterations: number;
}

interface UseSettlementSimulationOptions {
  initialParams?: Partial<SimulationParams>;
  autoRunOnMount?: boolean;
}

export const useSettlementSimulation = (options: UseSettlementSimulationOptions = {}) => {
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
};
