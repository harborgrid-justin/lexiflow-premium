// utils/index.ts

export * from "./apiUtils"; // Note: yieldToMain re-exported from here (duplicate exists in async.ts)
export * from "./bloomFilter";
export * from "./cacheManager";
export * from "./caseXmlParser";
export * from "./circuitBreaker";
export * from "./cn";
export * from "./crdt";
export * from "./docketValidation";
export * from "./errorHandler";
export * from "./formatters";
export * from "./scheduleHelpers";
export * from "./idGenerator";
export * from "./layoutAlgorithms";
export * from "./nexusPhysics";
export * from "./pathfinding";
export * from "./rateLimiter";
export * from "./retryWithBackoff"; // Note: retryWithBackoff re-exported from here (duplicate exists in async.ts)
export * from "./sanitize";
export * from "./scheduler";
export * from "./simulationEngine";
export * from "./sqlHelpers";
export * from "./statusRegistry";
export * from "./storage";
export * from "./stringUtils";
export * from "./templateEngine";
export * from "./trie";
export * from "./validation";

// Additional utilities - excluding yieldToMain and retryWithBackoff to avoid re-export ambiguity
export {
  asyncFilter,
  asyncMap,
  debounce,
  throttle,
  withTimeout,
} from "./async";
export * from "./caseConverter";
export * from "./chartConfig";
export * from "./dateUtils";
export * from "./discoveryNavigation";
export * from "./download";
export * from "./EventEmitter";
export * from "./formatUtils";
export * from "./LRUCache";
export * from "./memoryMonitor";
export * from "./notificationUtils";
export * from "./queryKeys";
export * from "./telemetry";
export * from "./type-mapping";

// Datastructures
// NOTE: Commented out to fix Vite module resolution issues.
// These are not currently imported anywhere in the codebase.
// If needed, import directly: import { FenwickTree } from '@/utils/datastructures/fenwickTree';

// export * from './datastructures/bTree';
// export * from './datastructures/bitSet';
// export * from './datastructures/consistentHashRing';
// export * from './datastructures/copyOnWrite';
// export * from './datastructures/countMinSketch';
// export * from './datastructures/cuckooFilter';
// export * from './datastructures/disjointSet';
// export * from './datastructures/doubleBuffer';
// export * from './datastructures/fenwickTree';
// export * from './datastructures/linearHash';
// export * from './datastructures/merkleDAG';
// export * from './datastructures/piecewiseConstant';
// export * from './datastructures/rTree';
// export * from './datastructures/segmentTree';
// export * from './datastructures/skipList';
// export * from './datastructures/suffixTree';
