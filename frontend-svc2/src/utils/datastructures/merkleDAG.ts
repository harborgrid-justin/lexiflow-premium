async function sha256(str: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export class MerkleNode {
    hash: string;
    children: MerkleNode[];
    content?: string; // Optional content for leaf nodes

    constructor(hash: string, children: MerkleNode[] = [], content?: string) {
        this.hash = hash;
        this.children = children;
        this.content = content;
    }
}

export const MerkleDAG = {
    async createLeaf(content: string): Promise<MerkleNode> {
        const hash = await sha256(content);
        return new MerkleNode(hash, [], content);
    },

    async createNode(children: MerkleNode[]): Promise<MerkleNode> {
        if (children.length === 0) throw new Error("Cannot create node with no children");
        const combinedHash = children.map(c => c.hash).sort().join('');
        const hash = await sha256(combinedHash);
        return new MerkleNode(hash, children);
    },

    async verify(node: MerkleNode): Promise<boolean> {
        if (node.children.length === 0) {
            // It's a leaf, verify content if present
            if (node.content) {
                const expectedHash = await sha256(node.content);
                return node.hash === expectedHash;
            }
            return true; // Cannot verify content-less leaf, assume valid hash
        }

        // It's an internal node, verify children hashes
        const childHashes = node.children.map(c => c.hash).sort().join('');
        const expectedHash = await sha256(childHashes);
        if (node.hash !== expectedHash) return false;

        // Recursively verify children
        for (const child of node.children) {
            if (!(await this.verify(child))) return false;
        }

        return true;
    }
};
