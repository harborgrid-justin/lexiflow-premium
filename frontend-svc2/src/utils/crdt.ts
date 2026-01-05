/**
 * @module utils/crdt
 * @category Utils - Distributed Systems
 * @description Conflict-free Replicated Data Type (CRDT) implementation with Last-Write-Wins (LWW) Map.
 * Provides eventual consistency for distributed state synchronization using timestamp-based conflict
 * resolution. Supports set/get operations with automatic timestamp tracking and merge for combining
 * remote state changes.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface LWWRegister<T> {
    value: T;
    timestamp: number;
}

// ============================================================================
// LWW MAP CLASS
// ============================================================================
/**
 * Last-Write-Wins Map
 * Useful for syncing object fields where the latest timestamp wins.
 */
export class LWWMap<K, V> {
    private data: Map<K, LWWRegister<V>> = new Map();

    set(key: K, value: V, timestamp: number = Date.now()) {
        const existing = this.data.get(key);
        if (!existing || existing.timestamp < timestamp) {
            this.data.set(key, { value, timestamp });
        }
    }

    get(key: K): V | undefined {
        return this.data.get(key)?.value;
    }

    getState() {
        return this.data;
    }

    merge(other: LWWMap<K, V>) {
        other.getState().forEach((remoteReg, key) => {
            const localReg = this.data.get(key);
            if (!localReg || localReg.timestamp < remoteReg.timestamp) {
                this.data.set(key, remoteReg);
            }
        });
    }
}
