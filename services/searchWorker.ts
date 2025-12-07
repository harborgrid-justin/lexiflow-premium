
/**
 * SYSTEMS ENGINEERING: OFF-MAIN-THREAD SEARCH ENGINE
 * This worker handles CPU-intensive string matching and filtering
 * to keep the UI thread (60fps) completely unblocked during typing.
 */

const createSearchWorker = () => {
    const code = `
      self.onmessage = function(e) {
        const { items, query, fields, idKey } = e.data;
        
        if (!query || !items || items.length === 0) {
          self.postMessage({ results: items });
          return;
        }
  
        const lowerQuery = query.toLowerCase();
        const results = [];
        
        // Optimized loop for throughput
        // We avoid .filter() to reduce allocation overhead of boolean arrays
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          let match = false;
  
          // Check specific fields if provided
          if (fields && fields.length > 0) {
            for (let j = 0; j < fields.length; j++) {
              const val = item[fields[j]];
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
  
        self.postMessage({ results: results });
      };
    `;
    const blob = new Blob([code], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  };
  
  export const SearchWorker = {
    create: createSearchWorker
  };