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
  private touchStartTime = 0;
  private readonly minSwipeDistance = 50;
  private readonly maxTapDistance = 20;
  private readonly maxTapDuration = 300;
  private isTouchDevice = false;
  private mouseStartX = 0;
  private mouseStartY = 0;
  private mouseStartTime = 0;
  private isMouseDown = false;

  constructor() {
    this.detectTouchDevice();
    this.bindKeyboardEvents();
    this.bindTouchEvents();
    this.bindMouseEvents();
  }

  /**
   * Bind keyboard events
   */
  private bindKeyboardEvents(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Detect if device supports touch
   */
  private detectTouchDevice(): void {
    this.isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
  }

  /**
   * Bind touch events for mobile
   */
  private bindTouchEvents(): void {
    if (!this.isTouchDevice) return;

    // Use passive: false to allow preventDefault and eliminate 300ms tap delay
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
  }

  /**
   * Bind mouse events for desktop testing
   */
  private bindMouseEvents(): void {
    // Always bind mouse events for testing, but prioritize touch events on touch devices
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
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

    // Prevent default to eliminate 300ms tap delay
    event.preventDefault();

    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  /**
   * Handle touch move (prevent default scrolling during swipes)
   */
  private handleTouchMove(event: TouchEvent): void {
    if (this.isDestroyed || event.touches.length === 0) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    const deltaY = Math.abs(touch.clientY - this.touchStartY);

    // If we're making a significant swipe gesture, prevent default scrolling
    if (deltaX > 10 || deltaY > 10) {
      event.preventDefault();
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (this.isDestroyed || event.changedTouches.length === 0) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const touchDuration = Date.now() - this.touchStartTime;

    // Check if it's a tap (small movement and short duration)
    if (
      Math.abs(deltaX) < this.maxTapDistance &&
      Math.abs(deltaY) < this.maxTapDistance &&
      touchDuration < this.maxTapDuration
    ) {
      // Prevent default to eliminate 300ms tap delay
      event.preventDefault();
      this.handleTap();
      return;
    }

    // Check if it's a swipe
    if (Math.abs(deltaX) > this.minSwipeDistance || Math.abs(deltaY) > this.minSwipeDistance) {
      event.preventDefault();
      this.handleSwipe(deltaX, deltaY);
    }
  }

  /**
   * Handle tap gesture
   */
  private handleTap(): void {
    // On mobile, tap toggles pause/play or starts the game
    this.emitPause();
  }

  /**
   * Handle swipe gesture
   */
  private handleSwipe(deltaX: number, deltaY: number): void {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      this.emitDirection(deltaX > 0 ? Direction.RIGHT : Direction.LEFT);
    } else {
      // Vertical swipe
      this.emitDirection(deltaY > 0 ? Direction.DOWN : Direction.UP);
    }
  }

  /**
   * Handle mouse down
   */
  private handleMouseDown(event: MouseEvent): void {
    if (this.isDestroyed) return;

    this.mouseStartX = event.clientX;
    this.mouseStartY = event.clientY;
    this.mouseStartTime = Date.now();
    this.isMouseDown = true;
  }

  /**
   * Handle mouse move
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.isDestroyed || !this.isMouseDown) return;

    const deltaX = Math.abs(event.clientX - this.mouseStartX);
    const deltaY = Math.abs(event.clientY - this.mouseStartY);

    // If we're making a significant movement, prevent default
    if (deltaX > 10 || deltaY > 10) {
      event.preventDefault();
    }
  }

  /**
   * Handle mouse up
   */
  private handleMouseUp(event: MouseEvent): void {
    if (this.isDestroyed || !this.isMouseDown) return;

    this.isMouseDown = false;
    const deltaX = event.clientX - this.mouseStartX;
    const deltaY = event.clientY - this.mouseStartY;
    const mouseDuration = Date.now() - this.mouseStartTime;

    // Check if it's a click (small movement and short duration)
    if (
      Math.abs(deltaX) < this.maxTapDistance &&
      Math.abs(deltaY) < this.maxTapDistance &&
      mouseDuration < this.maxTapDuration
    ) {
      this.handleTap();
      return;
    }

    // Check if it's a swipe
    if (Math.abs(deltaX) > this.minSwipeDistance || Math.abs(deltaY) > this.minSwipeDistance) {
      this.handleSwipe(deltaX, deltaY);
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
   * Check if device supports touch
   */
  public isTouchDeviceSupported(): boolean {
    return this.isTouchDevice;
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
