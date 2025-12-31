// Simplified Linear Hashing implementation for dynamic resizing
export class LinearHash<K, V> {
    private buckets: Map<K, V>[];
    private level: number = 0;
    private splitPointer: number = 0;
    private numItems: number = 0;
    private readonly loadFactor: number = 0.75;

    constructor() {
        this.buckets = [new Map()];
    }

    private hash(key: K, level: number): number {
        const strKey = String(key);
        let hash = 0;
        for (let i = 0; i < strKey.length; i++) {
            hash = (hash << 5) - hash + strKey.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % (1 << level);
    }

    private getAddress(key: K): number {
        let h = this.hash(key, this.level);
        if (h < this.splitPointer) {
            h = this.hash(key, this.level + 1);
        }
        return h;
    }

    set(key: K, value: V) {
        const index = this.getAddress(key);
        if(!this.buckets[index]) this.buckets[index] = new Map();
        this.buckets[index].set(key, value);
        this.numItems++;

        if (this.numItems / this.buckets.length > this.loadFactor) {
            this.split();
        }
    }

    get(key: K): V | undefined {
        const index = this.getAddress(key);
        return this.buckets[index]?.get(key);
    }

    delete(key: K): boolean {
        const index = this.getAddress(key);
        const bucket = this.buckets[index];
        if (bucket && bucket.has(key)) {
            bucket.delete(key);
            this.numItems--;
            return true;
        }
        return false;
    }

    size(): number {
        return this.numItems;
    }

    keys(): K[] {
        const allKeys: K[] = [];
        for (const bucket of this.buckets) {
            if (bucket) {
                for (const key of bucket.keys()) {
                    allKeys.push(key);
                }
            }
        }
        return allKeys;
    }

    clear() {
        this.buckets = [new Map()];
        this.level = 0;
        this.splitPointer = 0;
        this.numItems = 0;
    }

    private split() {
        this.buckets.push(new Map());
        const oldBucket = this.buckets[this.splitPointer]!;
        this.buckets[this.splitPointer] = new Map();
        this.numItems -= oldBucket.size;

        for (const [key, value] of oldBucket.entries()) {
            this.set(key, value);
        }

        this.splitPointer++;
        if (this.splitPointer === (1 << this.level)) {
            this.level++;
            this.splitPointer = 0;
        }
    }
}
