/**
 * @module utils/layoutAlgorithms
 * @category Utils - Layout
 * @description Layout algorithms for automatic element positioning. Provides grid-based auto-arrangement
 * with configurable container width, item dimensions, and padding. Calculates row/column positions for
 * responsive table/card layouts in schema diagrams and visual editors.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TablePosition {
  x: number;
  y: number;
}

// ============================================================================
// ALGORITHMS
// ============================================================================
export const LayoutAlgorithms = {
  /**
   * Arranges tables in a grid layout.
   * @param count Number of items to arrange
   * @param containerWidth Width of the container
   * @param itemWidth Width of a single item
   * @param itemHeight Height of a single item
   * @param padding Padding between items
   * @returns Array of position objects {x, y}
   */
  autoArrangeGrid: (
    count: number, 
    containerWidth: number = 1600, 
    itemWidth: number = 256, 
    itemHeight: number = 300, 
    padding: number = 80
  ): TablePosition[] => {
    const positions: TablePosition[] = [];
    const tablesPerRow = Math.floor(containerWidth / (itemWidth + padding));
    
    for (let index = 0; index < count; index++) {
        const row = Math.floor(index / tablesPerRow);
        const col = index % tablesPerRow;
        positions.push({
            x: col * (itemWidth + padding) + padding,
            y: row * (itemHeight + padding) + padding
        });
    }
    return positions;
  }
};
