// BitSet for efficient storage of boolean flags
export class BitSet {
    private readonly buffer: Uint32Array;

    constructor(size: number) {
        this.buffer = new Uint32Array(Math.ceil(size / 32));
    }

    set(index: number) {
        const i = Math.floor(index / 32);
        const bit = index % 32;
        this.buffer[i]! |= (1 << bit);
    }

    clear(index: number) {
        const i = Math.floor(index / 32);
        const bit = index % 32;
        this.buffer[i]! &= ~(1 << bit);
    }

    get(index: number): boolean {
        const i = Math.floor(index / 32);
        const bit = index % 32;
        return (this.buffer[i]! & (1 << bit)) !== 0;
    }

    toggle(index: number) {
        const i = Math.floor(index / 32);
        const bit = index % 32;
        this.buffer[i]! ^= (1 << bit);
    }
}
