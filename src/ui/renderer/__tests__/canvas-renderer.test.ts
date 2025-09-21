/**
 * Canvas renderer tests
 */

import { CanvasRenderer } from '../canvas-renderer';

// Mock HTMLCanvasElement and CanvasRenderingContext2D
const mockCanvas = {
  width: 0,
  height: 0,
  style: { width: '', height: '' },
  getContext: jest.fn(),
  getBoundingClientRect: jest.fn(() => ({ width: 400, height: 400 })),
} as unknown as HTMLCanvasElement;

const mockContext = {
  imageSmoothingEnabled: false,
  textBaseline: 'top',
  scale: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  fillText: jest.fn(),
  strokeStyle: '',
  lineWidth: 0,
  fillStyle: '',
  font: '',
  textAlign: 'left',
} as unknown as CanvasRenderingContext2D & {
  moveTo: jest.MockedFunction<(x: number, y: number) => void>;
  lineTo: jest.MockedFunction<(x: number, y: number) => void>;
  beginPath: jest.MockedFunction<() => void>;
  stroke: jest.MockedFunction<() => void>;
  fillRect: jest.MockedFunction<(x: number, y: number, width: number, height: number) => void>;
  strokeRect: jest.MockedFunction<(x: number, y: number, width: number, height: number) => void>;
  arc: jest.MockedFunction<
    (x: number, y: number, radius: number, startAngle: number, endAngle: number) => void
  >;
};

// Mock document.getElementById
const originalGetElementById = document.getElementById;
beforeAll(() => {
  document.getElementById = jest.fn((id: string) => {
    if (id === 'gameCanvas') {
      return mockCanvas;
    }
    return null;
  });
});

afterAll(() => {
  document.getElementById = originalGetElementById;
});

describe('CanvasRenderer', () => {
  let renderer: CanvasRenderer;

  beforeEach(() => {
    (mockCanvas.getContext as jest.Mock).mockReturnValue(mockContext);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default grid size', () => {
      renderer = new CanvasRenderer('gameCanvas');
      expect(renderer).toBeDefined();
    });

    it('should initialize with custom grid size', () => {
      renderer = new CanvasRenderer('gameCanvas', 15);
      expect(renderer).toBeDefined();
    });

    it('should throw error if canvas element not found', () => {
      (document.getElementById as jest.Mock).mockReturnValueOnce(null);
      expect(() => new CanvasRenderer('nonexistent')).toThrow(
        "Canvas element with id 'nonexistent' not found"
      );
    });

    it('should throw error if context not available', () => {
      (mockCanvas.getContext as jest.Mock).mockReturnValueOnce(null);
      expect(() => new CanvasRenderer('gameCanvas')).toThrow(
        'Failed to get 2D context from canvas'
      );
    });
  });

  describe('resize', () => {
    beforeEach(() => {
      renderer = new CanvasRenderer('gameCanvas', 20);
    });

    it('should resize canvas to fit container size', () => {
      const containerSize = 500;
      renderer.resize(containerSize, containerSize);

      expect(mockCanvas.width).toBe(containerSize);
      expect(mockCanvas.height).toBe(containerSize);
      expect(mockCanvas.style.width).toBe(`${containerSize}px`);
      expect(mockCanvas.style.height).toBe(`${containerSize}px`);
    });

    it('should use smaller dimension when container is smaller than grid', () => {
      const smallSize = 200;
      renderer.resize(smallSize, smallSize);

      expect(mockCanvas.width).toBe(smallSize);
      expect(mockCanvas.height).toBe(smallSize);
    });

    it('should calculate cell size dynamically', () => {
      const containerSize = 500;
      renderer.resize(containerSize, containerSize);

      // Cell size should be calculated to fit the grid in the container
      const expectedCellSize = Math.floor(containerSize / 20) - 2; // containerSize / gridSize - padding
      expect(renderer['cellSize']).toBe(expectedCellSize);
    });
  });

  describe('grid rendering', () => {
    beforeEach(() => {
      renderer = new CanvasRenderer('gameCanvas', 10);
      // Set up canvas dimensions and calculate cell size
      mockCanvas.width = 400;
      mockCanvas.height = 400;
      renderer['cellSize'] = Math.floor(400 / 10) - 2; // Calculate cell size
    });

    it('should draw correct number of grid lines', () => {
      renderer['drawGrid']();

      // Should draw 11 vertical lines (0 to 10 inclusive)
      expect(mockContext.beginPath).toHaveBeenCalledTimes(22); // 11 vertical + 11 horizontal
      expect(mockContext.moveTo).toHaveBeenCalledTimes(22);
      expect(mockContext.lineTo).toHaveBeenCalledTimes(22);
      expect(mockContext.stroke).toHaveBeenCalledTimes(22);
    });

    it('should fill the canvas with grid', () => {
      renderer['drawGrid']();

      // Grid should fill the canvas, so first vertical line should be at x=0
      const verticalCalls = mockContext.moveTo.mock.calls.filter((call) => {
        // Find calls where y coordinate is the same for moveTo and lineTo (vertical lines)
        const moveToCall = call;
        const lineToCall = mockContext.lineTo.mock.calls.find(
          (ltCall) => ltCall[0] === moveToCall[0] && ltCall[1] !== moveToCall[1]
        );
        return lineToCall !== undefined;
      });

      expect(verticalCalls.length).toBeGreaterThan(0);
      // First vertical line should start at x=0 (no centering needed)
      const firstVerticalCall = verticalCalls[0];
      expect(firstVerticalCall[0]).toBe(0);
    });
  });

  describe('snake rendering', () => {
    beforeEach(() => {
      renderer = new CanvasRenderer('gameCanvas', 20);
      // Set up canvas dimensions and calculate cell size
      mockCanvas.width = 500;
      mockCanvas.height = 500;
      renderer['cellSize'] = Math.floor(500 / 20) - 2;
    });

    it('should render snake head at correct position', () => {
      const position = { x: 5, y: 3 };
      renderer['drawSnakeHead'](position);

      // Position should be calculated using getCellPosition method
      const { x, y } = renderer['getCellPosition'](5, 3);
      expect(mockContext.fillRect).toHaveBeenCalledWith(
        x + 1,
        y + 1,
        renderer['cellSize'] - 2,
        renderer['cellSize'] - 2
      );
      expect(mockContext.strokeRect).toHaveBeenCalledWith(
        x + 1,
        y + 1,
        renderer['cellSize'] - 2,
        renderer['cellSize'] - 2
      );
    });

    it('should render snake body at correct position', () => {
      const position = { x: 4, y: 3 };
      renderer['drawSnakeBody'](position, 1);

      // Position should be calculated using getCellPosition method
      const { x, y } = renderer['getCellPosition'](4, 3);
      expect(mockContext.fillRect).toHaveBeenCalledWith(
        x + 1,
        y + 1,
        renderer['cellSize'] - 2,
        renderer['cellSize'] - 2
      );
    });
  });

  describe('food rendering', () => {
    beforeEach(() => {
      renderer = new CanvasRenderer('gameCanvas', 20);
      // Set up canvas dimensions and calculate cell size
      mockCanvas.width = 500;
      mockCanvas.height = 500;
      renderer['cellSize'] = Math.floor(500 / 20) - 2;
    });

    it('should render food at correct position', () => {
      const food = { position: { x: 7, y: 9 }, type: 'REGULAR' };
      renderer['drawFood'](food);

      // Position should be calculated using getCellPosition method
      const { x, y } = renderer['getCellPosition'](7, 9);
      const centerX = x + renderer['cellSize'] / 2;
      const centerY = y + renderer['cellSize'] / 2;
      const radius = renderer['cellSize'] / 2 - 2;

      expect(mockContext.arc).toHaveBeenCalledWith(centerX, centerY, radius, 0, 2 * Math.PI);
    });
  });
});
