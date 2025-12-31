export interface SimulationParams {
  low: number;
  high: number;
  liabilityProb: number;
  iterations: number;
}

export interface SimulationMetrics {
  ev: number;
  p25: number;
  p75: number;
  results: { range: string; count: number; value: number }[];
}

export const SimulationEngine = {
  /**
   * Runs a Monte Carlo simulation for legal settlement value estimation.
   * Uses Box-Muller transform for normal distribution skew.
   */
  runSettlementSimulation: (params: SimulationParams): SimulationMetrics => {
    const { low, high, liabilityProb, iterations } = params;
    const data: number[] = [];

    for (let i = 0; i < iterations; i++) {
        // Liability Check
        const isLiable = Math.random() * 100 < liabilityProb;
        if (isLiable) {
            // Box-Muller transform
            const u = 1 - Math.random();
            const v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            
            const mean = (high + low) / 2;
            const stdDev = (high - low) / 4; // Assume 95% falls within range
            let val = mean + z * stdDev;
            
            // Clamp
            val = Math.max(low * 0.8, Math.min(high * 1.2, val));
            data.push(val);
        } else {
            data.push(0);
        }
    }
    
    data.sort((a, b) => a - b);
    
    // Metrics
    const sum = data.reduce((a, b) => a + b, 0);
    const ev = sum / iterations;
    const p25 = data[Math.floor(iterations * 0.25)];
    const p75 = data[Math.floor(iterations * 0.75)];
    
    // Build Histogram Data
    const buckets = 20;
    const minVal = 0;
    const maxVal = high * 1.2;
    const bucketSize = (maxVal - minVal) / buckets;
    
    const histData = Array.from({ length: buckets }, (_, i) => {
        const start = minVal + i * bucketSize;
        const end = start + bucketSize;
        const count = data.filter(v => v >= start && v < end).length;
        return {
            range: `$${(start/1000).toFixed(0)}k`,
            count: count,
            value: start
        };
    });

    return { ev, p25, p75, results: histData };
  }
};
