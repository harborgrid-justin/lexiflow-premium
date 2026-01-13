# Litigation Components - TypeScript Code Extraction

## Summary

Successfully extracted TypeScript utility code from litigation component files into a new `utils/` directory. This refactoring improves code organization, reusability, and maintainability.

## Files Created

### 1. `/components/litigation/utils/ganttTransformUtils.ts`
**Purpose**: Transformation logic for converting strategy nodes into Gantt timeline data.

**Exported Functions**:
- `calculatePixelsPerDay(zoom)` - Calculates pixel-to-day ratio based on zoom level
- `getNodeDurationDays(nodeType)` - Returns duration in days for different node types
- `transformNodesToGantt(nodes, connections)` - Main transformation from workflow graph to Gantt data
- `calculateNodePositionFromDate(startDateStr, referenceDate)` - Converts dates back to canvas positions

**Used By**: `LitigationGanttView.tsx`

### 2. `/components/litigation/utils/canvasUtils.ts`
**Purpose**: Canvas interaction logic including drag-and-drop and context menus.

**Exported Functions**:
- `calculateDropPosition(event, canvasElement, pan, scale)` - Calculates position from drop events
- `calculateCanvasMousePosition(event, canvasElement, pan, scale)` - Transforms mouse to canvas coords
- `generateNodeContextMenuItems(nodeId, callbacks)` - Creates context menu for nodes
- `generateCanvasContextMenuItems(position, onAddNode)` - Creates context menu for canvas background

**Used By**: `StrategyCanvas.tsx`

### 3. `/components/litigation/utils/playbookHelpers.ts`
**Purpose**: Playbook library filtering, categorization, and styling utilities.

**Exported Functions**:
- `getDifficultyColor(difficulty)` - Returns CSS classes for difficulty badges
- `getDifficultyBorderColor(difficulty)` - Returns border color class for difficulty
- `filterPlaybooks(playbooks, searchTerm, category, difficulty)` - Filters playbook list
- `extractCategories(playbooks)` - Extracts unique categories from playbooks

**Used By**: `PlaybookLibrary.tsx`

### 4. `/components/litigation/utils/minimapUtils.ts`
**Purpose**: Minimap viewport calculations and coordinate transformations.

**Exported Functions**:
- `calculateMinimapBoundsAndScale(nodes, width, height, padding)` - Computes minimap scale
- `minimapToCanvasCoordinates(mapX, mapY, bounds, scale, padding)` - Maps minimap to canvas
- `calculateCenterPan(targetX, targetY, viewport)` - Centers viewport on position
- `nodeToMinimapPosition(node, bounds, scale, padding)` - Transforms node to minimap
- `viewportToMinimapPosition(viewport, bounds, scale, padding)` - Transforms viewport to minimap

**Constants**: `MINIMAP_WIDTH`, `MINIMAP_HEIGHT`, `MINIMAP_PADDING`

**Used By**: `Minimap.tsx`

### 5. `/components/litigation/utils/index.ts`
Barrel export file for convenient imports.

## Components Refactored

### LitigationGanttView.tsx
**Changes**:
- Replaced ~60 lines of inline transformation logic with `transformNodesToGantt()`
- Replaced inline zoom calculation with `calculatePixelsPerDay()`
- Replaced task update calculation with `calculateNodePositionFromDate()`
- **Lines Reduced**: ~45 lines

### StrategyCanvas.tsx
**Changes**:
- Replaced drop position calculation with `calculateDropPosition()`
- Replaced mouse position calculations with `calculateCanvasMousePosition()`
- Replaced context menu generation logic with `generateNodeContextMenuItems()` and `generateCanvasContextMenuItems()`
- Removed unused icon imports
- **Lines Reduced**: ~30 lines

### PlaybookLibrary.tsx
**Changes**:
- Replaced inline filtering logic with `filterPlaybooks()`
- Replaced category extraction with `extractCategories()`
- Replaced inline difficulty color function with `getDifficultyColor()` and `getDifficultyBorderColor()`
- **Lines Reduced**: ~15 lines

### Minimap.tsx
**Changes**:
- Replaced bounds/scale calculation with `calculateMinimapBoundsAndScale()`
- Replaced coordinate transformations with utility functions
- Replaced viewport positioning with `viewportToMinimapPosition()`
- Replaced node positioning with `nodeToMinimapPosition()`
- **Lines Reduced**: ~20 lines

## Benefits

1. **Improved Testability**: Utility functions can be unit tested independently
2. **Better Reusability**: Functions can be reused across components
3. **Enhanced Maintainability**: Business logic separated from UI logic
4. **Clearer Intent**: Named functions make code more self-documenting
5. **Reduced Complexity**: Component files are now more focused on UI concerns
6. **Type Safety**: All utilities maintain strict TypeScript typing

## Total Impact

- **New Files**: 5 utility files (4 modules + 1 barrel export)
- **Components Updated**: 4 files
- **Lines of Code Reduced**: ~110 lines across all components
- **No Breaking Changes**: All components maintain identical behavior
- **Zero Compilation Errors**: All refactorings passed type checking

## Usage Example

Before:
```typescript
const { phases, tasks } = useMemo(() => {
  // 50+ lines of transformation logic
}, [nodes, connections]);
```

After:
```typescript
import { transformNodesToGantt } from './utils';

const { phases, tasks } = useMemo(() => 
  transformNodesToGantt(nodes, connections), 
  [nodes, connections]
);
```
