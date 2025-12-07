
const createCryptoWorker = () => {
    const code = `
      self.onmessage = async function(e) {
        const { fileChunk, id } = e.data;
        
        try {
            // SHA-256 Hashing
            const hashBuffer = await crypto.subtle.digest('SHA-256', fileChunk);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            self.postMessage({ id, hash: hashHex, status: 'success' });
        } catch (error) {
            self.postMessage({ id, error: error.message, status: 'error' });
        }
      };
    `;
    const blob = new Blob([code], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
};
  
export const CryptoWorker = {
    create: createCryptoWorker
};
