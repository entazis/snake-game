/**
 * Tests for InputHandler mobile functionality
 */

import { Direction } from '../../../core/interfaces/game.types';
import { InputHandler } from '../input-handler';

// Mock touch events
const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  return new TouchEvent(type, {
    touches: touches as any,
    changedTouches: touches as any,
  });
};

// Mock navigator
Object.defineProperty(navigator, 'maxTouchPoints', {
  value: 1,
  writable: true,
});

describe('InputHandler Mobile', () => {
  let inputHandler: InputHandler;
  let directionCallback: jest.Mock;
  let pauseCallback: jest.Mock;

  beforeEach(() => {
    directionCallback = jest.fn();
    pauseCallback = jest.fn();
    inputHandler = new InputHandler();
    inputHandler.onDirectionChange(directionCallback);
    inputHandler.onPauseToggle(pauseCallback);
  });

  afterEach(() => {
    inputHandler.destroy();
  });

  describe('touch device detection', () => {
    it('should detect touch device', () => {
      expect(inputHandler.isTouchDeviceSupported()).toBe(true);
    });
  });

  describe('touch events', () => {
    it('should handle swipe up', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]);

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchEnd'](touchEnd);

      expect(directionCallback).toHaveBeenCalledWith(Direction.UP);
    });

    it('should handle swipe down', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 200 }]);

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchEnd'](touchEnd);

      expect(directionCallback).toHaveBeenCalledWith(Direction.DOWN);
    });

    it('should handle swipe left', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]);

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchEnd'](touchEnd);

      expect(directionCallback).toHaveBeenCalledWith(Direction.LEFT);
    });

    it('should handle swipe right', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]);

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchEnd'](touchEnd);

      expect(directionCallback).toHaveBeenCalledWith(Direction.RIGHT);
    });

    it('should handle tap (pause)', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 105, clientY: 105 }]);

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchEnd'](touchEnd);

      expect(pauseCallback).toHaveBeenCalled();
    });

    it('should not trigger direction for small movements', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 110, clientY: 110 }]);

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchEnd'](touchEnd);

      expect(directionCallback).not.toHaveBeenCalled();
    });

    it('should not trigger direction for very short swipes', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchEnd = createTouchEvent('touchend', [{ clientX: 120, clientY: 100 }]);

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchEnd'](touchEnd);

      expect(directionCallback).not.toHaveBeenCalled();
    });
  });

  describe('touch move prevention', () => {
    it('should prevent default on significant movement', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchMove = createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]);

      const preventDefaultSpy = jest.spyOn(touchMove, 'preventDefault');

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchMove'](touchMove);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent default on small movement', () => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      const touchMove = createTouchEvent('touchmove', [{ clientX: 105, clientY: 100 }]);

      const preventDefaultSpy = jest.spyOn(touchMove, 'preventDefault');

      inputHandler['handleTouchStart'](touchStart);
      inputHandler['handleTouchMove'](touchMove);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});
