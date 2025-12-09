
/**
 * SYSTEMS ENGINEERING: OFF-MAIN-THREAD SEARCH ENGINE
 * This worker handles CPU-intensive string matching and filtering
 * to keep the UI thread (60fps) completely unblocked during typing.
 * 
 * OPTIMIZATION: State caching prevents main-thread serialization blocks on repeated queries.
 */

const createSearchWorker = () => {
    const code = `
      let itemsCache = [];
      let fieldsCache = [];
      let idKeyCache = 'id';

      self.onmessage = function(e) {
        const { type, payload } = e.data;

        // 1. Data Ingestion (Heavy, Infrequent)
        if (type === 'UPDATE') {
            itemsCache = payload.items || [];
            fieldsCache = payload.fields || [];
            idKeyCache = payload.idKey || 'id';
            return;
        }
        
        // 2. Query Execution (Light, Frequent)
        if (type === 'SEARCH') {
            const { query, requestId } = payload;
            
            if (!query || itemsCache.length === 0) {
                self.postMessage({ results: itemsCache, requestId });
                return;
            }
    
            const lowerQuery = query.toLowerCase();
            const results = [];
            
            // Optimized loop for throughput
            // We avoid .filter() to reduce allocation overhead of boolean arrays
            const len = itemsCache.length;
            for (let i = 0; i < len; i++) {
                const item = itemsCache[i];
                let match = false;
        
                // Check specific fields if provided
                if (fieldsCache.length > 0) {
                    for (let j = 0; j < fieldsCache.length; j++) {
                        const val = item[fieldsCache[j]];
                        if (val && String(val).toLowerCase().includes(lowerQuery)) {
                            match = true;
                            break;
                        }
                    }
                } else {
                    // Deep search (expensive, hence why we are in a worker)
                    const values = Object.values(item);
                    for (let j = 0; j < values.length; j++) {
                        const val = values[j];
                        if (val && String(val).toLowerCase().includes(lowerQuery)) {
                            match = true;
                            break;
                        }
                    }
                }
        
                if (match) {
                    results.push(item);
                }
            }
    
            self.postMessage({ results: results, requestId });
        }
      };
    `;
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url); // Clean up immediately
    return worker;
  };
  
  export const SearchWorker = {
    create: createSearchWorker
  };
