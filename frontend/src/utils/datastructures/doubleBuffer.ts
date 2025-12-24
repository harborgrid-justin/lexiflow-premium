
// Double Buffer for smooth canvas animation
export class DoubleBuffer<T> {
    private readBuffer: T;
    private writeBuffer: T;
    private dirty: boolean = false;

    constructor(initialState: T) {
        this.readBuffer = JSON.parse(JSON.stringify(initialState));
        this.writeBuffer = JSON.parse(JSON.stringify(initialState));
    }

    // Get the stable buffer for reading/rendering
    getReadBuffer(): T {
        return this.readBuffer;
    }

    // Get the buffer for writing/updating state
    getWriteBuffer(): T {
        this.dirty = true;
        return this.writeBuffer;
    }

    // Swap buffers if the write buffer has been modified
    swap() {
        if (this.dirty) {
            [this.readBuffer, this.writeBuffer] = [this.writeBuffer, this.readBuffer];
            this.dirty = false;
        }
    }
    
    // Direct update for simple cases
    update(updater: (state: T) => void) {
        const buffer = this.getWriteBuffer();
        updater(buffer);
        this.swap();
    }
}
