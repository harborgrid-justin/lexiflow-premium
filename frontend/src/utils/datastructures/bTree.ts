
// Simplified B-Tree implementation for demonstration
class BTreeNode<K, V> {
    keys: K[] = [];
    values: V[] = [];
    children: BTreeNode<K, V>[] = [];
    
    constructor(public isLeaf: boolean) {}
}

export class BTree<K, V> {
    private readonly root: BTreeNode<K, V>;
    private readonly t: number; // Minimum degree (defines the range for # of keys)

    constructor(t: number) {
        this.t = t;
        this.root = new BTreeNode<K, V>(true);
    }
    
    search(key: K): V | null {
        return this._search(this.root, key);
    }

    private _search(node: BTreeNode<K, V>, key: K): V | null {
        let i = 0;
        while (i < node.keys.length && key > node.keys[i]) {
            i++;
        }
        if (i < node.keys.length && key === node.keys[i]) {
            return node.values[i];
        }
        if (node.isLeaf) {
            return null;
        }
        return this._search(node.children[i], key);
    }
    
    // Insert and split logic is complex and omitted for this demonstration.
    // This class primarily shows the structure and search capability.
    insert(key: K, value: V) {
        // A full implementation would handle node splitting and balancing.
        // For demo purposes, we will just add to the root if not full.
        if(this.root.keys.length < (2 * this.t -1)) {
            const i = this.root.keys.findIndex(k => k > key);
            if (i === -1) {
                this.root.keys.push(key);
                this.root.values.push(value);
            } else {
                this.root.keys.splice(i, 0, key);
                this.root.values.splice(i, 0, value);
            }
        } else {
             console.warn("B-Tree insert logic simplified: root is full.");
        }
    }
    
    // A simplified range query for demonstration
    rangeSearch(startKey: K, endKey: K): V[] {
        const results: V[] = [];
        this._rangeSearch(this.root, startKey, endKey, results);
        return results;
    }
    
    private _rangeSearch(node: BTreeNode<K, V>, startKey: K, endKey: K, results: V[]) {
        let i = 0;
        while(i < node.keys.length && startKey > node.keys[i]) i++;

        if (!node.isLeaf) {
            this._rangeSearch(node.children[i], startKey, endKey, results);
        }
        
        while(i < node.keys.length && node.keys[i] <= endKey) {
            results.push(node.values[i]);
            if (!node.isLeaf) {
                this._rangeSearch(node.children[i+1], startKey, endKey, results);
            }
            i++;
        }
    }
}
