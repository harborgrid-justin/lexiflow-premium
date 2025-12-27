
// Fenwick Tree or Binary Indexed Tree (BIT)
export class FenwickTree {
    private readonly bit: number[];
    private readonly size: number;

    constructor(size: number) {
        this.size = size;
        this.bit = new Array(size + 1).fill(0);
    }

    // Update value at index i by delta
    update(index: number, delta: number) {
        index++; // 1-based indexing
        while (index <= this.size) {
            this.bit[index] += delta;
            index += index & -index; // Add last set bit
        }
    }

    // Get sum from 0 to index
    query(index: number): number {
        index++; // 1-based indexing
        let sum = 0;
        while (index > 0) {
            sum += this.bit[index];
            index -= index & -index; // Subtract last set bit
        }
        return sum;
    }
    
    // Get sum of a range [start, end]
    queryRange(start: number, end: number): number {
        return this.query(end) - this.query(start - 1);
    }
}
