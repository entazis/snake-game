/**
 * Tests for MobileControls component
 */

import { MobileControls } from '../mobile-controls';

// Mock DOM methods
const mockAddEventListener = jest.fn();
const mockRemoveChild = jest.fn();

// Mock document.createElement
const mockCreateElement = jest.fn(() => ({
  addEventListener: mockAddEventListener,
  querySelectorAll: jest.fn(() => []),
  setAttribute: jest.fn(),
  innerHTML: '',
  style: {},
  parentNode: {
    removeChild: mockRemoveChild,
  },
}));

// Mock document.body
Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

describe('MobileControls', () => {
  let mobileControls: MobileControls;

  beforeEach(() => {
    jest.clearAllMocks();
    mobileControls = new MobileControls();
  });

  afterEach(() => {
    mobileControls.destroy();
  });

  describe('constructor', () => {
    it('should create mobile controls container with hint text', () => {
      expect(mockCreateElement).toHaveBeenCalledWith('div');
    });

    it('should append container to document body', () => {
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('show and hide', () => {
    it('should show controls', () => {
      mobileControls.show();
      expect(mobileControls.isControlsVisible()).toBe(true);
    });

    it('should hide controls', () => {
      mobileControls.show();
      mobileControls.hide();
      expect(mobileControls.isControlsVisible()).toBe(false);
    });
  });

  describe('event callbacks', () => {
    it('should register direction change callback', () => {
      const callback = jest.fn();
      mobileControls.onDirectionChange(callback);

      // Simulate direction change
      const directionCallbacks = (mobileControls as any).directionCallbacks;
      expect(directionCallbacks).toContain(callback);
    });

    it('should register pause toggle callback', () => {
      const callback = jest.fn();
      mobileControls.onPauseToggle(callback);

      const pauseCallbacks = (mobileControls as any).pauseCallbacks;
      expect(pauseCallbacks).toContain(callback);
    });

    it('should register game start callback', () => {
      const callback = jest.fn();
      mobileControls.onGameStart(callback);

      const gameStartCallbacks = (mobileControls as any).gameStartCallbacks;
      expect(gameStartCallbacks).toContain(callback);
    });

    it('should register game reset callback', () => {
      const callback = jest.fn();
      mobileControls.onGameReset(callback);

      const gameResetCallbacks = (mobileControls as any).gameResetCallbacks;
      expect(gameResetCallbacks).toContain(callback);
    });
  });

  describe('destroy', () => {
    it('should clear all callbacks', () => {
      const directionCallback = jest.fn();
      const pauseCallback = jest.fn();
      const startCallback = jest.fn();
      const resetCallback = jest.fn();

      mobileControls.onDirectionChange(directionCallback);
      mobileControls.onPauseToggle(pauseCallback);
      mobileControls.onGameStart(startCallback);
      mobileControls.onGameReset(resetCallback);

      mobileControls.destroy();

      const directionCallbacks = (mobileControls as any).directionCallbacks;
      const pauseCallbacks = (mobileControls as any).pauseCallbacks;
      const gameStartCallbacks = (mobileControls as any).gameStartCallbacks;
      const gameResetCallbacks = (mobileControls as any).gameResetCallbacks;

      expect(directionCallbacks).toHaveLength(0);
      expect(pauseCallbacks).toHaveLength(0);
      expect(gameStartCallbacks).toHaveLength(0);
      expect(gameResetCallbacks).toHaveLength(0);
    });

    it('should remove container from DOM', () => {
      mobileControls.destroy();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });
});
