/**
 * geoMapUtils.ts
 * 
 * Utility functions for geographic jurisdiction map physics and rendering.
 * 
 * @module components/jurisdiction/utils/geoMapUtils
 */

export interface MapNode {
  x: number;
  y: number;
  label: string;
  type: 'federal' | 'state';
  radius: number;
  vx: number;
  vy: number;
}

/**
 * Initializes velocity for map nodes with random values
 */
export const initializeNodeVelocity = (nodes: unknown[]): MapNode[] => {
  return nodes.map((n: unknown) => ({
    ...(n && typeof n === 'object' ? n : {}),
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5
  }));
};

/**
 * Updates node physics with wall collision detection
 */
export const updateNodePhysics = (
  nodes: MapNode[], 
  canvasWidth: number, 
  canvasHeight: number
): void => {
  nodes.forEach(node => {
    node.x += node.vx;
    node.y += node.vy;

    // Bounce off walls
    if (node.x < 20 || node.x > canvasWidth - 20) node.vx *= -1;
    if (node.y < 20 || node.y > canvasHeight - 20) node.vy *= -1;
  });
};

/**
 * Detects if a click position intersects with a node
 */
export const findClickedNode = (
  nodes: MapNode[], 
  clickX: number, 
  clickY: number,
  tolerancePadding: number = 5
): MapNode | undefined => {
  return nodes.find(node => {
    const dx = node.x - clickX;
    const dy = node.y - clickY;
    return Math.sqrt(dx * dx + dy * dy) < node.radius + tolerancePadding;
  });
};

/**
 * Draws connection lines between nearby nodes with distance-based opacity
 */
export const drawNodeConnections = (
  ctx: CanvasRenderingContext2D,
  nodes: MapNode[],
  maxDistance: number = 300
): void => {
  ctx.lineWidth = 1;
  nodes.forEach((nodeA, i) => {
    nodes.slice(i + 1).forEach(nodeB => {
      const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
      if (dist < maxDistance) {
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.strokeStyle = `rgba(148, 163, 184, ${1 - dist / maxDistance})`; // Fade by distance
        ctx.stroke();
      }
    });
  });
};

/**
 * Gets fill color for node based on type
 */
export const getNodeColor = (type: 'federal' | 'state'): string => {
  return type === 'federal' ? '#3b82f6' : '#10b981'; // Blue vs Emerald
};

/**
 * Draws a single map node with label
 */
export const drawMapNode = (
  ctx: CanvasRenderingContext2D,
  node: MapNode
): void => {
  // Draw circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
  ctx.fillStyle = getNodeColor(node.type);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';
  ctx.stroke();

  // Draw label
  ctx.fillStyle = '#475569';
  ctx.font = '10px Inter';
  ctx.fillText(node.label, node.x + 12, node.y + 3);
};

/**
 * Draws all nodes on the canvas
 */
export const drawAllNodes = (
  ctx: CanvasRenderingContext2D,
  nodes: MapNode[]
): void => {
  nodes.forEach(node => drawMapNode(ctx, node));
};

/**
 * Handles canvas resize to match parent element dimensions
 */
export const resizeCanvas = (canvas: HTMLCanvasElement): void => {
  if (canvas.parentElement) {
    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 500;
  }
};

/**
 * Main render loop for the jurisdiction map
 */
export const renderJurisdictionMap = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  nodes: MapNode[]
): void => {
  // 1. Clear Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 2. Update Physics
  updateNodePhysics(nodes, canvas.width, canvas.height);
  
  // 3. Draw Connections
  drawNodeConnections(ctx, nodes);
  
  // 4. Draw Nodes
  drawAllNodes(ctx, nodes);
};
