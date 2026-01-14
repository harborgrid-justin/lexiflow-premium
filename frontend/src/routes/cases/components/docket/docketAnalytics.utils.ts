import { DocketEntry } from "@/types";
import { cacheRegistry } from "@/utils/cacheManager";

// Initialize caches with 10-minute TTL
const filingActivityCache = cacheRegistry.get<string, unknown>(
  "docket-filing-activity",
  {
    maxSize: 50,
    ttlMs: 10 * 60 * 1000, // 10 minutes
  }
);

const judgeRulingsCache = cacheRegistry.get<string, unknown>(
  "docket-judge-rulings",
  {
    maxSize: 50,
    ttlMs: 10 * 60 * 1000, // 10 minutes
  }
);

export const aggregateFilingActivity = (entries: DocketEntry[]) => {
  // Generate cache key from entries length and last entry ID
  const cacheKey =
    entries.length > 0
      ? `${entries.length}-${entries[entries.length - 1]?.id || ""}`
      : "empty";

  // Use getOrCompute for automatic caching
  return filingActivityCache.getOrCompute(cacheKey, () => {
    const stats: Record<string, { filings: number; orders: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    // Initialize
    months.forEach((m) => (stats[m] = { filings: 0, orders: 0 }));

    // Use for loop for better performance on large datasets
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e) continue;
      const date = new Date(e.date || e.entryDate || e.dateFiled);
      const month = date.toLocaleString("default", { month: "short" });
      if (stats[month]) {
        if (e.type === "Order") stats[month].orders++;
        else if (e.type === "Filing") stats[month].filings++;
      }
    }

    return Object.keys(stats).map((k) => ({ month: k, ...stats[k] }));
  });
};

export const aggregateJudgeRulings = (entries: DocketEntry[]) => {
  // Generate cache key from entries length and last entry ID
  const cacheKey =
    entries.length > 0
      ? `${entries.length}-${entries[entries.length - 1]?.id || ""}`
      : "empty";

  // Use getOrCompute for automatic caching
  return judgeRulingsCache.getOrCompute(cacheKey, () => {
    let granted = 0;
    let denied = 0;
    let partial = 0;

    // Use for loop for better performance
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e) continue;
      if (e.type === "Order" && e.description) {
        const desc = e.description.toLowerCase();
        if (
          desc.includes("partially") ||
          (desc.includes("granted") && desc.includes("part"))
        ) {
          partial++;
        } else if (desc.includes("granted")) {
          granted++;
        } else if (desc.includes("denied")) {
          denied++;
        }
      }
    }

    return [
      { name: "Granted", value: granted, color: "#10b981" },
      { name: "Denied", value: denied, color: "#ef4444" },
      { name: "Partial", value: partial, color: "#f59e0b" },
    ];
  });
};

// Export function to clear caches and get stats
export const clearAnalyticsCache = () => {
  filingActivityCache.clear();
  judgeRulingsCache.clear();
};

export const getAnalyticsCacheStats = () => ({
  filingActivity: filingActivityCache.getStats(),
  judgeRulings: judgeRulingsCache.getStats(),
});
