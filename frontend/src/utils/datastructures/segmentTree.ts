// Segment Tree for Range Queries
export class SegmentTree {
    private readonly tree: number[];
    private readonly size: number;
    private readonly operation: (a: number, b: number) => number;

    constructor(arr: number[], operation: (a: number, b: number) => number) {
        this.size = arr.length;
        this.operation = operation;
        this.tree = new Array(4 * this.size);
        this.build(arr, 0, 0, this.size - 1);
    }

    private build(arr: number[], node: number, start: number, end: number) {
        if (start === end) {
            this.tree[node] = arr[start]!;
            return;
        }
        const mid = Math.floor((start + end) / 2);
        this.build(arr, 2 * node + 1, start, mid);
        this.build(arr, 2 * node + 2, mid + 1, end);
        this.tree[node] = this.operation(this.tree[2 * node + 1]!, this.tree[2 * node + 2]!);
    }

    query(l: number, r: number): number {
        return this._query(0, 0, this.size - 1, l, r);
    }

    private _query(node: number, start: number, end: number, l: number, r: number): number {
        if (r < start || end < l) {
            return this.operation === Math.max ? -Infinity : Infinity; // Identity
        }
        if (l <= start && end <= r) {
            return this.tree[node]!;
        }
        const mid = Math.floor((start + end) / 2);
        const p1 = this._query(2 * node + 1, start, mid, l, r);
        const p2 = this._query(2 * node + 2, mid + 1, end, l, r);
        return this.operation(p1, p2);
    }
}
