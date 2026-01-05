class SkipNode<T> {
    constructor(
        public value: T,
        public next: (SkipNode<T> | null | undefined)[] = []
    ) {}
}

export class SkipList<T> {
    private readonly head: SkipNode<T>;
    private readonly maxLevel: number;
    private readonly p: number;

    constructor(maxLevel = 16, p = 0.5) {
        this.maxLevel = maxLevel;
        this.p = p;
        this.head = new SkipNode<T>(null as unknown as T, Array(maxLevel).fill(null));
    }

    private randomLevel(): number {
        let level = 1;
        while (Math.random() < this.p && level < this.maxLevel) {
            level++;
        }
        return level;
    }

    insert(value: T) {
        const update: (SkipNode<T> | null)[] = Array(this.maxLevel).fill(null);
        let current: SkipNode<T> | null = this.head;

        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (current && current.next[i] && current.next[i]!.value < value) {
                current = current.next[i] || null;
            }
            update[i] = current;
        }

        const level = this.randomLevel();
        const newNode = new SkipNode(value, Array(level).fill(null));

        for (let i = 0; i < level; i++) {
            newNode.next[i] = update[i]!.next[i];
            update[i]!.next[i] = newNode;
        }
    }

    search(value: T): boolean {
        let current: SkipNode<T> | null = this.head;
        for (let i = this.maxLevel - 1; i >= 0; i--) {
            while (current && current.next[i] && current.next[i]!.value < value) {
                current = current.next[i] || null;
            }
        }
        current = current ? (current.next[0] || null) : null;
        return current !== null && current.value === value;
    }

    // Return all items in sorted order
    toArray(): T[] {
        const arr: T[] = [];
        let current = this.head.next[0];
        while(current) {
            arr.push(current.value);
            current = current.next[0];
        }
        return arr;
    }
}
