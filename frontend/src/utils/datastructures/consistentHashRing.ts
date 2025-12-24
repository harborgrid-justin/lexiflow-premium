
// Consistent Hashing Ring
export class ConsistentHashRing {
    private ring: Map<number, string> = new Map();
    private sortedKeys: number[] = [];
    private replicas: number;

    constructor(replicas = 3) {
        this.replicas = replicas;
    }

    private hash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    addNode(node: string) {
        for (let i = 0; i < this.replicas; i++) {
            const hash = this.hash(`${node}:${i}`);
            this.ring.set(hash, node);
        }
        this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    removeNode(node: string) {
        for (let i = 0; i < this.replicas; i++) {
            const hash = this.hash(`${node}:${i}`);
            this.ring.delete(hash);
        }
        this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
    }

    getNode(key: string): string | null {
        if (this.sortedKeys.length === 0) return null;
        const hash = this.hash(key);
        const index = this.binarySearch(this.sortedKeys, hash);
        return this.ring.get(this.sortedKeys[index])!;
    }
    
    // Custom binary search to find the next highest key
    private binarySearch(arr: number[], value: number): number {
        let low = 0, high = arr.length;
        while (low < high) {
            const mid = (low + high) >> 1;
            if (arr[mid] >= value) high = mid;
            else low = mid + 1;
        }
        return low % arr.length;
    }

    getRingState() {
        return { ring: this.ring, sortedKeys: this.sortedKeys };
    }
}
