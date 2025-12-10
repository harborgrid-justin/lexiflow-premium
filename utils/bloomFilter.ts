// A simple Bloom Filter implementation using FNV-1a and MurmurHash3-like approximations
export class BloomFilter {
    private size: number;
    private hashes: number;
    private buffer: Uint8Array;
  
    constructor(expectedItems: number, falsePositiveRate: number) {
      this.size = Math.ceil(-1 * (expectedItems * Math.log(falsePositiveRate)) / (Math.log(2) ** 2));
      this.hashes = Math.ceil((this.size / expectedItems) * Math.log(2));
      this.buffer = new Uint8Array(Math.ceil(this.size / 8));
    }
  
    // FNV-1a Hash
    private hash1(str: string): number {
      let hash = 0x811c9dc5;
      for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
      }
      return hash >>> 0;
    }
  
    // Simple variant for second hash
    private hash2(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return hash >>> 0;
    }
  
    add(item: string) {
      const h1 = this.hash1(item);
      const h2 = this.hash2(item);
  
      for (let i = 0; i < this.hashes; i++) {
        const hash = (h1 + i * h2) % this.size;
        const byteIndex = Math.floor(hash / 8);
        const bitIndex = hash % 8;
        this.buffer[byteIndex] |= (1 << bitIndex);
      }
    }
  
    test(item: string): boolean {
      const h1 = this.hash1(item);
      const h2 = this.hash2(item);
  
      for (let i = 0; i < this.hashes; i++) {
        const hash = (h1 + i * h2) % this.size;
        const byteIndex = Math.floor(hash / 8);
        const bitIndex = hash % 8;
        if ((this.buffer[byteIndex] & (1 << bitIndex)) === 0) {
          return false;
        }
      }
      return true;
    }
  }