/**
 * Cache policy configuration
 */

export interface CachePolicy {
  staleTime: number; // Time before data is considered stale
  cacheTime: number; // Time before cached data is garbage collected
}

export const cachePolicy = {
  default: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  } as CachePolicy,

  short: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  } as CachePolicy,

  long: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  } as CachePolicy,

  infinite: {
    staleTime: Infinity,
    cacheTime: Infinity,
  } as CachePolicy,
};
