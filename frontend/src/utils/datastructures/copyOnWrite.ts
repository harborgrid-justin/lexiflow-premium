// Copy-on-Write (CoW) wrapper for demonstrating efficient snapshots
export class CoW<T extends object> {
    private data: T;
    private shared: boolean;

    constructor(data: T) {
        this.data = data;
        this.shared = false;
    }

    // Create a cheap snapshot (just shares the reference)
    snapshot(): CoW<T> {
        this.shared = true;
        const newSnapshot = new CoW<T>(this.data);
        newSnapshot.shared = true;
        return newSnapshot;
    }

    // Modify a field, performing a copy if the data is shared
    set<K extends keyof T>(key: K, value: T[K]) {
        if (this.shared) {
            // Data is shared, so we must copy before writing
            this.data = { ...this.data };
            this.shared = false;
        }
        this.data[key] = value;
    }

    get<K extends keyof T>(key: K): T[K] {
        return this.data[key];
    }
    
    read(): T {
        return this.data;
    }
}
