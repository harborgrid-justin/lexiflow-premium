export class CountMinSketch {
    private readonly width: number;
    private readonly depth: number;
    private readonly table: number[][];
    private readonly seeds: number[];

    constructor(width: number, depth: number) {
        this.width = width;
        this.depth = depth;
        this.table = Array.from({ length: depth }, () => Array(width).fill(0));
        this.seeds = Array.from({ length: depth }, () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    }

    // Simple string hash
    private hash(str: string, seed: number): number {
        let hash = 0;
        for(let i = 0; i < str.length; i++) {
            hash = (hash * seed + str.charCodeAt(i)) | 0;
        }
        return Math.abs(hash);
    }

    add(item: string) {
        for (let i = 0; i < this.depth; i++) {
            const index = this.hash(item, this.seeds[i]!) % this.width;
            this.table[i]![index]!++;
        }
    }

    estimate(item: string): number {
        let min = Infinity;
        for (let i = 0; i < this.depth; i++) {
            const index = this.hash(item, this.seeds[i]!) % this.width;
            min = Math.min(min, this.table[i]![index]!);
        }
        return min;
    }
}
