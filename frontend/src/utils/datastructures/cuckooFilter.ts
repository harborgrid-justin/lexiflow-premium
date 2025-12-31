export class CuckooFilter {
    private readonly buckets: (string | null)[][];
    private readonly bucketSize: number;
    private readonly numBuckets: number;
    private readonly maxKicks: number;

    constructor(capacity: number, bucketSize = 4, maxKicks = 500) {
        this.bucketSize = bucketSize;
        this.numBuckets = Math.ceil(capacity / bucketSize);
        this.buckets = Array.from({ length: this.numBuckets }, () => Array(bucketSize).fill(null));
        this.maxKicks = maxKicks;
    }

    private hash(item: string): number {
        let hash = 0;
        for (let i = 0; i < item.length; i++) {
            hash = (hash << 5) - hash + item.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    private fingerprint(item: string): string {
        // Simple fingerprint, a more robust one would be better
        return this.hash(item).toString(16).slice(0, 4);
    }

    private getIndices(item: string): [number, number] {
        const h1 = this.hash(item) % this.numBuckets;
        const fp = this.fingerprint(item);
        const h2 = (h1 ^ this.hash(fp)) % this.numBuckets;
        return [h1, h2];
    }

    add(item: string): boolean {
        const fp = this.fingerprint(item);
        const [i1, i2] = this.getIndices(item);

        if (this.insert(fp, i1)) return true;
        if (this.insert(fp, i2)) return true;

        let i = Math.random() < 0.5 ? i1 : i2;
        for (let k = 0; k < this.maxKicks; k++) {
            const kickedIndex = Math.floor(Math.random() * this.bucketSize);
            const kickedFp = this.buckets[i]![kickedIndex];
            this.buckets[i]![kickedIndex] = fp;

            const kickedItem = kickedFp!; // In a real scenario, we'd need a way to get the item from fp. This is a simplification.
            i = (i ^ this.hash(kickedItem)) % this.numBuckets;
            if (this.insert(kickedFp!, i)) return true;
        }
        return false; // Filter is full
    }

    private insert(fp: string, index: number): boolean {
        const bucket = this.buckets[index]!;
        for (let i = 0; i < this.bucketSize; i++) {
            if (bucket[i] === null) {
                bucket[i]! = fp;
                return true;
            }
        }
        return false;
    }

    contains(item: string): boolean {
        const fp = this.fingerprint(item);
        const [i1, i2] = this.getIndices(item);
        return (this.buckets[i1]?.includes(fp) || false) || (this.buckets[i2]?.includes(fp) || false);
    }

    remove(item: string): boolean {
        const fp = this.fingerprint(item);
        const [i1, i2] = this.getIndices(item);

        for (let i = 0; i < this.bucketSize; i++) {
            if (this.buckets[i1]![i] === fp) {
                this.buckets[i1]![i] = null;
                return true;
            }
            if (this.buckets[i2]![i] === fp) {
                this.buckets[i2]![i] = null;
                return true;
            }
        }
        return false;
    }
}
