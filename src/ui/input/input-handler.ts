/**
 * Input handler for keyboard and touch events
 */

import { Direction } from '../../core/interfaces/game.types';
import { IInputHandler } from '../../core/interfaces/services.types';

export class InputHandler implements IInputHandler {
  private readonly directionCallbacks: ((direction: Direction) => void)[] = [];
  private readonly pauseCallbacks: (() => void)[] = [];
  private readonly gameStartCallbacks: (() => void)[] = [];
  private readonly gameResetCallbacks: (() => void)[] = [];

  private isDestroyed = false;
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly minSwipeDistance = 30;

  constructor() {
    this.bindKeyboardEvents();
    this.bindTouchEvents();
  }

  /**
   * Bind keyboard events
   */
  private bindKeyboardEvents(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Bind touch events for mobile
   */
  private bindTouchEvents(): void {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }

  /**
   * Handle keyboard input
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (this.isDestroyed) return;

    switch (event.code) {
      case 'ArrowUp':
        event.preventDefault();
        this.emitDirection(Direction.UP);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.emitDirection(Direction.DOWN);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.emitDirection(Direction.LEFT);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.emitDirection(Direction.RIGHT);
        break;
      case 'Space':
        event.preventDefault();
        this.emitPause();
        break;
      case 'Enter':
        event.preventDefault();
        this.emitGameStart();
        break;
      case 'Escape':
        event.preventDefault();
        this.emitGameReset();
        break;
    }
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    if (this.isDestroyed || event.touches.length === 0) return;

    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (this.isDestroyed || event.changedTouches.length === 0) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    // Check if it's a tap (small movement)
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      this.emitPause();
      return;
    }

    // Check if it's a swipe
    if (Math.abs(deltaX) > this.minSwipeDistance || Math.abs(deltaY) > this.minSwipeDistance) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        this.emitDirection(deltaX > 0 ? Direction.RIGHT : Direction.LEFT);
      } else {
        // Vertical swipe
        this.emitDirection(deltaY > 0 ? Direction.DOWN : Direction.UP);
      }
    }
  }

  /**
   * Emit direction change
   */
  private emitDirection(direction: Direction): void {
    this.directionCallbacks.forEach((callback) => callback(direction));
  }

  /**
   * Emit pause toggle
   */
  private emitPause(): void {
    this.pauseCallbacks.forEach((callback) => callback());
  }

  /**
   * Emit game start
   */
  private emitGameStart(): void {
    this.gameStartCallbacks.forEach((callback) => callback());
  }

  /**
   * Emit game reset
   */
  private emitGameReset(): void {
    this.gameResetCallbacks.forEach((callback) => callback());
  }

  /**
   * Add direction change listener
   */
  public onDirectionChange(callback: (direction: Direction) => void): void {
    this.directionCallbacks.push(callback);
  }

  /**
   * Add pause toggle listener
   */
  public onPauseToggle(callback: () => void): void {
    this.pauseCallbacks.push(callback);
  }

  /**
   * Add game start listener
   */
  public onGameStart(callback: () => void): void {
    this.gameStartCallbacks.push(callback);
  }

  /**
   * Add game reset listener
   */
  public onGameReset(callback: () => void): void {
    this.gameResetCallbacks.push(callback);
  }

  /**
   * Destroy input handler
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.directionCallbacks.length = 0;
    this.pauseCallbacks.length = 0;
    this.gameStartCallbacks.length = 0;
    this.gameResetCallbacks.length = 0;
  }
}
