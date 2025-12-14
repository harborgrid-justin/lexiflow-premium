/**
 * @module utils/trie
 * @category Utils - Data Structures
 * @description Trie (prefix tree) implementation for efficient prefix-based autocomplete and search.
 * Provides case-insensitive insert, prefix search with result collection, and clear for reset. Uses
 * Map-based children for O(m) insert/search where m is key length. Stores arbitrary data at terminal
 * nodes for autocomplete payloads.
 */

// ============================================================================
// TRIE NODE CLASS
// ============================================================================
class TrieNode {
    children: Map<string, TrieNode>;
    isEndOfWord: boolean;
    data: any;

    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.data = null;
    }
}

// ============================================================================
// TRIE CLASS
// ============================================================================
export class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    insert(key: string, data: any) {
        let node = this.root;
        const lowerKey = key.toLowerCase();
        for (const char of lowerKey) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }
        node.isEndOfWord = true;
        node.data = data;
    }

    search(prefix: string): any[] {
        let node = this.root;
        const lowerPrefix = prefix.toLowerCase();
        for (const char of lowerPrefix) {
            if (!node.children.has(char)) {
                return [];
            }
            node = node.children.get(char)!;
        }
        return this._collect(node);
    }

    private _collect(node: TrieNode): any[] {
        let results: any[] = [];
        if (node.isEndOfWord) {
            results.push(node.data);
        }
        for (const childNode of node.children.values()) {
            results = results.concat(this._collect(childNode));
        }
        return results;
    }
    
    clear() {
        this.root = new TrieNode();
    }
}