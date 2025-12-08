
// High-Performance Structure-of-Arrays (SoA) Physics Engine
// Optimized with Spatial Hashing for O(N) performance.

export const NODE_STRIDE = 6; // x, y, vx, vy, radius, type
// Offsets
const O_X = 0;
const O_Y = 1;
const O_VX = 2;
const O_VY = 3;
const O_RAD = 4;
const O_TYPE = 5;

// Physics Constants
const REPULSION = 800; // Adjusted for spatial accuracy
const SPRING_LENGTH = 150;
const SPRING_STRENGTH = 0.05;
const DAMPING = 0.85;
const CENTER_PULL = 0.03;
const ALPHA_DECAY = 0.015;
const MIN_ALPHA = 0.001;
const GRID_CELL_SIZE = 100; // Tuning for spatial bucket size

export interface SerializedNode {
  id: string;
  label: string;
  type: 'party' | 'org' | 'evidence' | 'root';
}

export interface NexusLink {
    sourceIndex: number;
    targetIndex: number;
    strength: number;
}

export const NexusPhysics = {
  MIN_ALPHA,

  initSystem: (data: any[], width: number, height: number) => {
    const count = data.length;
    const buffer = new Float32Array(count * NODE_STRIDE);
    const idMap = new Map<string, number>();
    const meta: SerializedNode[] = [];

    data.forEach((d, i) => {
      const idx = i * NODE_STRIDE;
      idMap.set(d.id, i);
      meta.push({ id: d.id, label: d.label, type: d.type });

      buffer[idx + O_X] = width / 2 + (Math.random() - 0.5) * 200;
      buffer[idx + O_Y] = height / 2 + (Math.random() - 0.5) * 200;
      buffer[idx + O_VX] = 0;
      buffer[idx + O_VY] = 0;
      
      if (d.type === 'root') { buffer[idx + O_RAD] = 40; buffer[idx + O_TYPE] = 0; } 
      else if (d.type === 'org') { buffer[idx + O_RAD] = 30; buffer[idx + O_TYPE] = 1; } 
      else if (d.type === 'party') { buffer[idx + O_RAD] = 25; buffer[idx + O_TYPE] = 2; } 
      else { buffer[idx + O_RAD] = 18; buffer[idx + O_TYPE] = 3; }
    });

    return { buffer, idMap, meta };
  },

  simulate: (
    buffer: Float32Array, 
    links: NexusLink[], 
    count: number, 
    width: number, 
    height: number, 
    alpha: number
  ): number => {
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Build Spatial Grid (Hash Map)
    // Map integer hash key -> array of node indices
    // Key formula: (gx * 4000) + gy to avoid string alloc
    // Assuming grid dimension max 4000x4000 cells (plenty)
    const grid = new Map<number, number[]>();
    
    for (let i = 0; i < count; i++) {
        const idx = i * NODE_STRIDE;
        const x = buffer[idx + O_X];
        const y = buffer[idx + O_Y];
        
        // Calculate Grid Key
        const gx = Math.floor(x / GRID_CELL_SIZE);
        const gy = Math.floor(y / GRID_CELL_SIZE);
        const key = (gx * 4000) + gy;
        
        let cellNodes = grid.get(key);
        if (!cellNodes) {
             cellNodes = [];
             grid.set(key, cellNodes);
        }
        cellNodes.push(i);
        
        // Center Gravity (done here to save a loop)
        const dxCenter = centerX - x;
        const dyCenter = centerY - y;
        buffer[idx + O_VX] += dxCenter * CENTER_PULL * alpha;
        buffer[idx + O_VY] += dyCenter * CENTER_PULL * alpha;
    }

    // 2. Optimized Repulsion (Only check neighbors)
    for (let i = 0; i < count; i++) {
      const idxI = i * NODE_STRIDE;
      const x = buffer[idxI + O_X];
      const y = buffer[idxI + O_Y];
      
      const gx = Math.floor(x / GRID_CELL_SIZE);
      const gy = Math.floor(y / GRID_CELL_SIZE);

      // Check 3x3 neighbor grid
      for (let nx = gx - 1; nx <= gx + 1; nx++) {
        for (let ny = gy - 1; ny <= gy + 1; ny++) {
             const key = (nx * 4000) + ny;
             const cellNodes = grid.get(key);
             if (!cellNodes) continue;
             
             const len = cellNodes.length;
             for (let k = 0; k < len; k++) {
                 const j = cellNodes[k];
                 if (i === j) continue;
                 const idxJ = j * NODE_STRIDE;
                 
                 const dx = x - buffer[idxJ + O_X];
                 const dy = y - buffer[idxJ + O_Y];
                 let distSq = dx * dx + dy * dy;
                 if (distSq < 0.1) distSq = 0.1;
                 
                 // Limit repulsion range to keep O(1) local cost
                 if (distSq > (GRID_CELL_SIZE * GRID_CELL_SIZE)) continue;

                 const force = (REPULSION / distSq) * alpha;
                 const dist = Math.sqrt(distSq);
                 const fx = (dx / dist) * force;
                 const fy = (dy / dist) * force;

                 buffer[idxI + O_VX] += fx;
                 buffer[idxI + O_VY] += fy;
             }
        }
      }
    }

    // 3. Spring Forces
    const linkCount = links.length;
    for (let i = 0; i < linkCount; i++) {
        const link = links[i];
        const idxS = link.sourceIndex * NODE_STRIDE;
        const idxT = link.targetIndex * NODE_STRIDE;

        const dx = buffer[idxT + O_X] - buffer[idxS + O_X];
        const dy = buffer[idxT + O_Y] - buffer[idxS + O_Y];
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const stretch = dist - SPRING_LENGTH;
        const force = stretch * SPRING_STRENGTH * link.strength * alpha;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        buffer[idxS + O_VX] += fx;
        buffer[idxS + O_VY] += fy;
        buffer[idxT + O_VX] -= fx;
        buffer[idxT + O_VY] -= fy;
    }

    // 4. Integration
    for (let i = 0; i < count; i++) {
        const idx = i * NODE_STRIDE;
        buffer[idx + O_VX] *= DAMPING;
        buffer[idx + O_VY] *= DAMPING;
        buffer[idx + O_X] += buffer[idx + O_VX];
        buffer[idx + O_Y] += buffer[idx + O_VY];

        // Bounds
        const r = buffer[idx + O_RAD];
        if (buffer[idx + O_X] < r) { buffer[idx + O_X] = r; buffer[idx + O_VX] *= -0.5; }
        if (buffer[idx + O_X] > width - r) { buffer[idx + O_X] = width - r; buffer[idx + O_VX] *= -0.5; }
        if (buffer[idx + O_Y] < r) { buffer[idx + O_Y] = r; buffer[idx + O_VY] *= -0.5; }
        if (buffer[idx + O_Y] > height - r) { buffer[idx + O_Y] = height - r; buffer[idx + O_VY] *= -0.5; }
    }

    return Math.max(0, alpha * (1 - ALPHA_DECAY));
  }
};
