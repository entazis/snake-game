/**
 * Event emitter tests
 */

import { EventEmitter } from '../event-emitter';

describe('EventEmitter', () => {
  interface TestEvents {
    'test:event': { message: string };
    'test:data': { value: number };
  }

  let eventEmitter: EventEmitter<TestEvents>;

  beforeEach(() => {
    eventEmitter = new EventEmitter<TestEvents>();
  });

  describe('event subscription', () => {
    it('should add event listeners', () => {
      const callback = jest.fn();
      eventEmitter.on('test:event', callback);

      expect(eventEmitter.getListenerCount('test:event')).toBe(1);
      expect(eventEmitter.hasListeners('test:event')).toBe(true);
    });

    it('should add multiple listeners for same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventEmitter.on('test:event', callback1);
      eventEmitter.on('test:event', callback2);

      expect(eventEmitter.getListenerCount('test:event')).toBe(2);
    });

    it('should not have listeners for unsubscribed events', () => {
      expect(eventEmitter.hasListeners('test:event')).toBe(false);
      expect(eventEmitter.getListenerCount('test:event')).toBe(0);
    });
  });

  describe('event emission', () => {
    it('should call registered listeners', () => {
      const callback = jest.fn();
      eventEmitter.on('test:event', callback);

      eventEmitter.emit('test:event', { message: 'test' });

      expect(callback).toHaveBeenCalledWith({ message: 'test' });
    });

    it('should call multiple listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventEmitter.on('test:event', callback1);
      eventEmitter.on('test:event', callback2);

      eventEmitter.emit('test:event', { message: 'test' });

      expect(callback1).toHaveBeenCalledWith({ message: 'test' });
      expect(callback2).toHaveBeenCalledWith({ message: 'test' });
    });

    it('should not call listeners for different events', () => {
      const callback = jest.fn();
      eventEmitter.on('test:event', callback);

      eventEmitter.emit('test:data', { value: 42 });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle errors in listeners gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const callback = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      eventEmitter.on('test:event', callback);
      eventEmitter.emit('test:event', { message: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in event listener for test:event:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('event unsubscription', () => {
    it('should remove specific listener', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventEmitter.on('test:event', callback1);
      eventEmitter.on('test:event', callback2);
      eventEmitter.off('test:event', callback1);

      eventEmitter.emit('test:event', { message: 'test' });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith({ message: 'test' });
    });

    it('should handle removing non-existent listener', () => {
      const callback = jest.fn();

      // Should not throw error
      expect(() => {
        eventEmitter.off('test:event', callback);
      }).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should remove all listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventEmitter.on('test:event', callback1);
      eventEmitter.on('test:data', callback2);

      eventEmitter.removeAllListeners();

      expect(eventEmitter.getListenerCount('test:event')).toBe(0);
      expect(eventEmitter.getListenerCount('test:data')).toBe(0);
      expect(eventEmitter.hasListeners('test:event')).toBe(false);
      expect(eventEmitter.hasListeners('test:data')).toBe(false);
    });
  });

  describe('type safety', () => {
    it('should enforce correct event data types', () => {
      const callback = jest.fn();
      eventEmitter.on('test:event', callback);

      // This should compile without errors
      eventEmitter.emit('test:event', { message: 'test' });

      expect(callback).toHaveBeenCalledWith({ message: 'test' });
    });
  });
});
