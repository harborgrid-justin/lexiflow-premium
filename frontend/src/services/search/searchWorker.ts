/**
 * SYSTEMS ENGINEERING: OFF-MAIN-THREAD SEARCH ENGINE
 * This worker handles CPU-intensive string matching, Levenshtein distance calculation,
 * and filtering to keep the UI thread (60fps) completely unblocked.
 */

const createSearchWorker = (): Worker | null => {
  // Check if Worker API is available (not available in SSR)
  if (typeof Worker === "undefined") {
    console.warn("[SearchWorker] Worker API not available (SSR mode)");
    return null;
  }

  const code = `
      let itemsCache = [];
      let fieldsCache = [];
      let idKeyCache = 'id';

      // Advanced Levenshtein Distance for fuzzy matching
      // Implemented in Worker to avoid main-thread blocking during matrix calculation
      function levenshtein(a: string, b: string): number {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
          matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
          matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                Math.min(
                  matrix[i][j - 1] + 1,
                  matrix[i - 1][j] + 1
                )
              );
            }
          }
        }
        return matrix[b.length][a.length];
      }

      function calculateScore(text: string | unknown, query: string): number {
          const t = String(text).toLowerCase();
          const q = query.toLowerCase();

          if (t === q) return 100; // Exact match
          if (t.startsWith(q)) return 80; // Prefix match
          if (t.includes(q)) return 60; // Substring match

          // Only run expensive Levenshtein if lengths are somewhat close
          if (Math.abs(t.length - q.length) > 5) return 0;

          const dist = levenshtein(t, q);
          if (dist <= 2) return 40; // Fuzzy match

          return 0;
      }

      self.onmessage = function(e) {
        const { type, payload } = e.data;

        // 1. Data Ingestion (Heavy, Infrequent)
        if (type === 'UPDATE') {
            // Flatten or prepare data if necessary
            itemsCache = payload.items || [];
            fieldsCache = payload.fields || [];
            idKeyCache = payload.idKey || 'id';
            return;
        }

        // 2. Query Execution (Light, Frequent)
        if (type === 'SEARCH') {
            const { query, requestId } = payload;

            if (!query || itemsCache.length === 0) {
                // If query empty, return all (up to limit) or empty depending on UX requirement.
                // Here we return top 20 unsorted.
                self.postMessage({ results: itemsCache.slice(0, 20), requestId });
                return;
            }

            const results = [];
            const len = itemsCache.length;

            for (let i = 0; i < len; i++) {
                const item = itemsCache[i];
                let maxScore = 0;

                // Search strategy: Check specific fields if provided, else check all own properties
                const searchFields = fieldsCache.length > 0 ? fieldsCache : Object.keys(item);

                for (let j = 0; j < searchFields.length; j++) {
                    const field = searchFields[j];
                    const val = item[field];
                    if (val) {
                        const score = calculateScore(val, query);
                        if (score > maxScore) maxScore = score;
                        if (maxScore === 100) break; // Optimization: early exit
                    }
                }

                if (maxScore > 0) {
                    // Inject score into result for sorting later
                    results.push({ ...item, _score: maxScore });
                }
            }

            // Sort by score descending
            results.sort((a, b) => b._score - a._score);

            self.postMessage({ results: results.slice(0, 50), requestId });
        }
      };
    `;
  try {
    const blob = new Blob([code], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url); // Clean up immediately
    return worker;
  } catch (error) {
    console.error("[SearchWorker] Failed to create worker:", error);
    return null;
  }
};

export const SearchWorker = {
  create: createSearchWorker,
};
