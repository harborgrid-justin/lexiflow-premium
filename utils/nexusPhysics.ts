
// High-Performance Structure-of-Arrays (SoA) Physics Engine
// Uses a single Float32Array block to manage memory, eliminating Garbage Collection pauses during simulation.

export const NODE_STRIDE = 6; // x, y, vx, vy, radius, type(0=root, 1=org, 2=party, 3=evidence)
// Offsets
const O_X = 0;
const O_Y = 1;
const O_VX = 2;
const O_VY = 3;
const O_RAD = 4;
const O_TYPE = 5;

// Physics Constants
const REPULSION = 1000;
const SPRING_LENGTH = 180;
const SPRING_STRENGTH = 0.05;
const DAMPING = 0.85;
const CENTER_PULL = 0.02;
const ALPHA_DECAY = 0.01;
const MIN_ALPHA = 0.001;

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

  /**
   * Allocates a Float32Array buffer for the simulation.
   * Returns the buffer and a map to lookup indexes by ID.
   */
  initSystem: (data: any[], width: number, height: number) => {
    const count = data.length;
    const buffer = new Float32Array(count * NODE_STRIDE);
    const idMap = new Map<string, number>();
    const meta: SerializedNode[] = [];

    data.forEach((d, i) => {
      const idx = i * NODE_STRIDE;
      idMap.set(d.id, i);
      meta.push({ id: d.id, label: d.label, type: d.type });

      // Init positions with slight jitter to prevent stacking
      buffer[idx + O_X] = width / 2 + (Math.random() - 0.5) * 150;
      buffer[idx + O_Y] = height / 2 + (Math.random() - 0.5) * 150;
      buffer[idx + O_VX] = 0;
      buffer[idx + O_VY] = 0;
      
      // Type & Radius configuration
      if (d.type === 'root') {
          buffer[idx + O_RAD] = 40;
          buffer[idx + O_TYPE] = 0;
      } else if (d.type === 'org') {
          buffer[idx + O_RAD] = 30;
          buffer[idx + O_TYPE] = 1;
      } else if (d.type === 'party') {
          buffer[idx + O_RAD] = 25;
          buffer[idx + O_TYPE] = 2;
      } else {
          buffer[idx + O_RAD] = 18; // evidence
          buffer[idx + O_TYPE] = 3;
      }
    });

    return { buffer, idMap, meta };
  },

  /**
   * Runs the physics simulation directly on the typed array.
   * Zero object allocation per tick.
   */
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

    // 1. Repulsion (N^2 optimization via unrolled loops could happen here, but basic loop is fast enough for <500 nodes)
    for (let i = 0; i < count; i++) {
      const idxI = i * NODE_STRIDE;
      
      // Center Gravity
      const dxCenter = centerX - buffer[idxI + O_X];
      const dyCenter = centerY - buffer[idxI + O_Y];
      buffer[idxI + O_VX] += dxCenter * CENTER_PULL * alpha;
      buffer[idxI + O_VY] += dyCenter * CENTER_PULL * alpha;

      for (let j = i + 1; j < count; j++) {
        const idxJ = j * NODE_STRIDE;
        const dx = buffer[idxI + O_X] - buffer[idxJ + O_X];
        const dy = buffer[idxI + O_Y] - buffer[idxJ + O_Y];
        let distSq = dx * dx + dy * dy;
        
        // Minimum distance clamp to prevent Infinity
        if (distSq < 0.1) distSq = 0.1;

        const force = (REPULSION / distSq) * alpha;
        const dist = Math.sqrt(distSq);
        
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        buffer[idxI + O_VX] += fx;
        buffer[idxI + O_VY] += fy;
        buffer[idxJ + O_VX] -= fx;
        buffer[idxJ + O_VY] -= fy;
      }
    }

    // 2. Spring Forces (Links)
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

    // 3. Integration & Boundaries
    for (let i = 0; i < count; i++) {
        const idx = i * NODE_STRIDE;

        // Apply Damping
        buffer[idx + O_VX] *= DAMPING;
        buffer[idx + O_VY] *= DAMPING;

        // Update Position
        buffer[idx + O_X] += buffer[idx + O_VX];
        buffer[idx + O_Y] += buffer[idx + O_VY];

        // Hard Boundaries (Bounce)
        const r = buffer[idx + O_RAD];
        if (buffer[idx + O_X] < r) { buffer[idx + O_X] = r; buffer[idx + O_VX] *= -0.5; }
        if (buffer[idx + O_X] > width - r) { buffer[idx + O_X] = width - r; buffer[idx + O_VX] *= -0.5; }
        if (buffer[idx + O_Y] < r) { buffer[idx + O_Y] = r; buffer[idx + O_VY] *= -0.5; }
        if (buffer[idx + O_Y] > height - r) { buffer[idx + O_Y] = height - r; buffer[idx + O_VY] *= -0.5; }
    }

    return Math.max(0, alpha * (1 - ALPHA_DECAY));
  }
};
