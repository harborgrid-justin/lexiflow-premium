
export class DisjointSet {
    private parent: Map<string, string> = new Map();
    private rank: Map<string, number> = new Map();

    constructor(items: string[] = []) {
        items.forEach(item => this.makeSet(item));
    }

    makeSet(item: string) {
        if (!this.parent.has(item)) {
            this.parent.set(item, item);
            this.rank.set(item, 0);
        }
    }

    find(item: string): string {
        this.makeSet(item); // Ensure item exists
        if (this.parent.get(item) === item) {
            return item;
        }
        // Path compression
        const root = this.find(this.parent.get(item)!);
        this.parent.set(item, root);
        return root;
    }

    union(item1: string, item2: string) {
        const root1 = this.find(item1);
        const root2 = this.find(item2);

        if (root1 !== root2) {
            const rank1 = this.rank.get(root1)!;
            const rank2 = this.rank.get(root2)!;

            // Union by rank
            if (rank1 < rank2) {
                this.parent.set(root1, root2);
            } else if (rank1 > rank2) {
                this.parent.set(root2, root1);
            } else {
                this.parent.set(root2, root1);
                this.rank.set(root1, rank1 + 1);
            }
        }
    }

    getConnectedComponents(): string[][] {
        const components: Map<string, string[]> = new Map();
        for (const item of this.parent.keys()) {
            const root = this.find(item);
            if (!components.has(root)) {
                components.set(root, []);
            }
            components.get(root)!.push(item);
        }
        return Array.from(components.values());
    }
}
