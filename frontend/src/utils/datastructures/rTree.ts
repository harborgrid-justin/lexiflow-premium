
// Simplified R-Tree (QuadTree) for 2D spatial indexing demonstration

interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Point<T> {
    x: number;
    y: number;
    data: T;
}

class QuadTreeNode<T> {
    bounds: Bounds;
    points: Point<T>[] = [];
    children: (QuadTreeNode<T> | null)[] = [null, null, null, null];
    
    constructor(bounds: Bounds, public capacity: number = 4) {
        this.bounds = bounds;
    }

    insert(point: Point<T>): boolean {
        if (!this.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (!this.children[0]) {
            this.subdivide();
        }

        for (const child of this.children) {
            if (child!.insert(point)) {
                return true;
            }
        }
        return false;
    }
    
    subdivide() {
        const { x, y, width, height } = this.bounds;
        const hw = width / 2;
        const hh = height / 2;
        
        this.children[0] = new QuadTreeNode({ x, y, width: hw, height: hh }, this.capacity);
        this.children[1] = new QuadTreeNode({ x: x + hw, y, width: hw, height: hh }, this.capacity);
        this.children[2] = new QuadTreeNode({ x, y: y + hh, width: hw, height: hh }, this.capacity);
        this.children[3] = new QuadTreeNode({ x: x + hw, y: y + hh, width: hw, height: hh }, this.capacity);
    }
    
    query(range: Bounds): T[] {
        const found: T[] = [];
        if (!this.intersects(range)) {
            return found;
        }
        
        for (const p of this.points) {
            if (this.pointInRange(p, range)) {
                found.push(p.data);
            }
        }
        
        if (this.children[0]) {
            for (const child of this.children) {
                found.push(...child!.query(range));
            }
        }
        return found;
    }

    private contains(point: Point<T>): boolean {
        const { x, y, width, height } = this.bounds;
        return (point.x >= x && point.x < x + width && point.y >= y && point.y < y + height);
    }
    
    private pointInRange(point: Point<T>, range: Bounds): boolean {
        return (point.x >= range.x && point.x < range.x + range.width && point.y >= range.y && point.y < range.y + range.height);
    }

    private intersects(range: Bounds): boolean {
        const { x, y, width, height } = this.bounds;
        return !(range.x > x + width || range.x + range.width < x || range.y > y + height || range.y + range.height < y);
    }
}

export class RTree<T> {
    private root: QuadTreeNode<T>;

    constructor(bounds: Bounds) {
        this.root = new QuadTreeNode<T>(bounds);
    }
    
    insert(x: number, y: number, data: T) {
        this.root.insert({x, y, data});
    }
    
    query(range: Bounds): T[] {
        return this.root.query(range);
    }
}
