/**
 * Mobile touch controls overlay component
 */

import { Direction } from '../../core/interfaces/game.types';

export interface IMobileControls {
  show(): void;
  hide(): void;
  destroy(): void;
  onDirectionChange(callback: (direction: Direction) => void): void;
  onPauseToggle(callback: () => void): void;
  onGameStart(callback: () => void): void;
  onGameReset(callback: () => void): void;
}

export class MobileControls implements IMobileControls {
  private readonly container: HTMLElement;
  private readonly directionCallbacks: ((direction: Direction) => void)[] = [];
  private readonly pauseCallbacks: (() => void)[] = [];
  private readonly gameStartCallbacks: (() => void)[] = [];
  private readonly gameResetCallbacks: (() => void)[] = [];
  private isVisible = false;

  constructor() {
    this.container = this.createControlsContainer();
    this.bindEvents();
  }

  /**
   * Create the mobile controls container
   */
  private createControlsContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'mobileControls';
    container.className = 'mobile-controls';
    container.innerHTML = `
      <div class="mobile-controls-overlay">
        <div class="mobile-controls-content">
          <!-- Mobile controls overlay - no additional UI needed -->
        </div>
      </div>
    `;

    document.body.appendChild(container);
    return container;
  }

  /**
   * Bind touch events to control buttons
   */
  private bindEvents(): void {
    // No button events needed - only swipe and tap gestures handled by InputHandler
  }

  /**
   * Show mobile controls
   */
  public show(): void {
    this.container.style.display = 'block';
    this.isVisible = true;
  }

  /**
   * Hide mobile controls
   */
  public hide(): void {
    this.container.style.display = 'none';
    this.isVisible = false;
  }

  /**
   * Check if controls are visible
   */
  public isControlsVisible(): boolean {
    return this.isVisible;
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
   * Destroy mobile controls
   */
  public destroy(): void {
    this.directionCallbacks.length = 0;
    this.pauseCallbacks.length = 0;
    this.gameStartCallbacks.length = 0;
    this.gameResetCallbacks.length = 0;

    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
