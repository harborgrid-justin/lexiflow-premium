// Simplified Suffix Tree implementation using a Map-based trie.
// A full Ukkonen's algorithm implementation is highly complex.

class SuffixTreeNode {
    children: Map<string, SuffixTreeNode> = new Map();
}

export class SuffixTree {
    private root: SuffixTreeNode = new SuffixTreeNode();
    private text: string;

    constructor(text: string) {
        this.text = text + '$'; // Add terminator
        for (let i = 0; i < this.text.length; i++) {
            this.insertSuffix(this.text.substring(i));
        }
    }

    private insertSuffix(suffix: string) {
        let node = this.root;
        for (const char of suffix) {
            if (!node.children.has(char)) {
                node.children.set(char, new SuffixTreeNode());
            }
            node = node.children.get(char)!;
        }
    }

    hasSubstring(substring: string): boolean {
        let node = this.root;
        for (const char of substring) {
            if (!node.children.has(char)) {
                return false;
            }
            node = node.children.get(char)!;
        }
        return true;
    }
}
