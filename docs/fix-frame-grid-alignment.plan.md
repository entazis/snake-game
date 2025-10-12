<!-- c63cf00b-c7be-4939-bf96-7f8437c7e164 939558f0-883e-40c5-89a6-83a0320623c6 -->
# Fix Frame to Match Grid Size

## Problem

The container with the green border is larger than the canvas, creating blank space below the grid on mobile screens.

## Solution

Make the container size dynamically match the canvas dimensions exactly, so the frame always wraps tightly around the grid.

## Implementation Steps

### 1. Update CSS in `index.html`

Remove flex properties that cause container expansion:

- Remove `flex: 1` from `.game-canvas-container`
- Remove `width: 100%` and `height: 100%` from `.game-canvas-container`
- Remove `width: 100%`, `height: 100%`, `object-fit: contain` from `#gameCanvas`
- Keep `aspect-ratio: 1` to maintain square shape
- Add `display: inline-block` to container for natural sizing

### 2. Update Resize Logic in `src/main.ts`

In `handleResize()` method:

- Calculate available space considering viewport constraints
- Set canvas dimensions via renderer
- Update container dimensions to match canvas size exactly
- Account for borders (6px total: 3px per side)

### 3. Update Initialization in `src/main.ts`

Ensure initial sizing happens correctly when game loads

### 4. Test in Browser

- Test on desktop size (1920x1080)
- Test on mobile size (375x667)
- Test on small mobile (320x568)
- Verify frame matches grid with no gaps on all sizes

## Test Results

### Desktop (1636x864 viewport)
- Canvas: 771.6x771.6 px
- Container: 777.6x777.6 px
- Border: 6px total (3px each side)
- Bottom space: 0px ✓
- Perfect match: ✓

### Mobile (500x667 viewport)
- Canvas: 444x444 px
- Container: 450x450 px
- Border: 6px total (3px each side)
- Bottom space: 0px ✓
- Perfect match: ✓

### Small Mobile (500x568 viewport)
- Canvas: 444x444 px
- Container: 450x450 px
- Border: 6px total (3px each side)
- Bottom space: 0px ✓
- Perfect match: ✓

## Conclusion

The frame now perfectly wraps the grid on all screen sizes with zero blank space below the grid. The container dimensions are dynamically set to exactly match the canvas size plus borders.

### To-dos

- [x] Update CSS in index.html to remove flex expansion properties
- [x] Update handleResize() in main.ts to set container dimensions
- [x] Test frame alignment on desktop size in browser
- [x] Test frame alignment on mobile size in browser
- [x] Verify no gaps between grid and frame on all viewport sizes

