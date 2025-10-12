/**
 * Main application entry point
 */

import { createGameConfig, defaultGameSettings } from './config/game-config';
import { GameEvents } from './core/interfaces/events.types';
import { GameState } from './core/interfaces/game.types';
import { GameEngine } from './core/services/game-engine';
import { ScoreManager } from './core/services/score-manager';
import { Storage } from './core/services/storage';
import { InputHandler } from './ui/input/input-handler';
import { MobileControls } from './ui/input/mobile-controls';
import { CanvasRenderer } from './ui/renderer/canvas-renderer';
import { EventEmitter } from './utils/event-emitter';

class SnakeGame {
  private readonly gameEngine!: GameEngine;
  private readonly inputHandler!: InputHandler;
  private readonly mobileControls!: MobileControls;
  private readonly renderer!: CanvasRenderer;
  private readonly eventEmitter!: EventEmitter<GameEvents>;
  private readonly storage!: Storage;
  private readonly scoreManager!: ScoreManager;

  private isInitialized = false;
  private gameConfig = createGameConfig(defaultGameSettings);
  private resizeTimeout: number | null = null;

  constructor() {
    try {
      this.storage = new Storage();
      this.scoreManager = new ScoreManager(this.storage);
      this.eventEmitter = new EventEmitter<GameEvents>();
      this.gameEngine = new GameEngine(this.gameConfig, this.scoreManager, this.eventEmitter);
      this.inputHandler = new InputHandler();
      this.mobileControls = new MobileControls();
      this.renderer = new CanvasRenderer('gameCanvas', this.gameConfig.gridSize);

      this.setupEventListeners();
      this.setupUI();
      this.initialize();
    } catch (error) {
      this.handleError('Failed to initialize game', error);
    }
  }

  /**
   * Initialize the game
   */
  private async initialize(): Promise<void> {
    try {
      this.renderer.initialize();
      this.updateScoreDisplay();
      this.updateUI(); // Ensure UI state is correct on initialization
      this.showGameContainer();

      // Show mobile controls if on touch device
      if (this.inputHandler.isTouchDeviceSupported()) {
        this.mobileControls.show();
      }

      // Resize canvas after container is shown, then show main menu
      setTimeout(() => {
        this.handleResize();
        this.renderer.showMainMenu();
      }, 100);

      this.isInitialized = true;
    } catch (error) {
      this.handleError('Failed to initialize game components', error);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Input events
    this.inputHandler.onDirectionChange((direction) => {
      this.gameEngine.changeDirection(direction);
    });

    this.inputHandler.onPauseToggle(() => {
      this.handleTapOrPause();
    });

    this.inputHandler.onGameStart(() => {
      this.startGame();
    });

    this.inputHandler.onGameReset(() => {
      this.resetGame();
    });

    // Mobile controls events
    this.mobileControls.onDirectionChange((direction) => {
      this.gameEngine.changeDirection(direction);
    });

    this.mobileControls.onPauseToggle(() => {
      this.handleTapOrPause();
    });

    this.mobileControls.onGameStart(() => {
      this.startGame();
    });

    this.mobileControls.onGameReset(() => {
      this.resetGame();
    });

    // Game events
    this.eventEmitter.on('game:start', () => {
      this.renderer.startRendering();
      // Render initial game state
      this.renderer.render(this.gameEngine.getRenderData());
      this.updateUI();
    });

    this.eventEmitter.on('game:pause', () => {
      this.updateUI();
    });

    this.eventEmitter.on('game:resume', () => {
      this.updateUI();
    });

    this.eventEmitter.on('game:over', ({ score }) => {
      this.renderer.stopRendering();
      this.renderer.showGameOver(score);
      this.updateUI();
    });

    this.eventEmitter.on('snake:move', () => {
      this.renderer.render(this.gameEngine.getRenderData());
    });

    this.eventEmitter.on('score:update', ({ score }) => {
      this.updateScoreDisplay(score);
    });

    this.eventEmitter.on('food:eaten', ({ score }) => {
      this.updateScoreDisplay(score);
    });
  }

  /**
   * Setup UI event listeners
   */
  private setupUI(): void {
    // Window resize with debouncing
    window.addEventListener('resize', () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = window.setTimeout(() => {
        this.handleResize();
        this.resizeTimeout = null;
      }, 100); // Debounce resize events by 100ms
    });
  }

  /**
   * Handle tap or pause based on game state
   */
  private handleTapOrPause(): void {
    if (!this.isInitialized) return;

    const gameState = this.gameEngine.getState();

    if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
      // Start the game if in menu or game over state
      this.startGame();
    } else if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
      // Toggle pause if game is playing or paused
      this.gameEngine.togglePause();
    }
  }

  /**
   * Start the game
   */
  private startGame(): void {
    if (!this.isInitialized) return;

    try {
      this.gameEngine.start();
      this.updateUI();
    } catch (error) {
      this.handleError('Failed to start game', error);
    }
  }

  /**
   * Reset the game
   */
  private resetGame(): void {
    if (!this.isInitialized) return;

    try {
      this.gameEngine.reset();
      this.renderer.showMainMenu();
      this.updateUI();
    } catch (error) {
      this.handleError('Failed to reset game', error);
    }
  }

  /**
   * Update UI state
   */
  private updateUI(): void {
    const gameState = this.gameEngine.getState();
    const scoreDisplay = document.getElementById('scoreDisplay');

    // Show/hide score display based on game state
    if (scoreDisplay) {
      if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
        scoreDisplay.classList.add('visible');
      } else {
        scoreDisplay.classList.remove('visible');
      }
    }
  }

  /**
   * Update score display
   */
  private updateScoreDisplay(score?: any): void {
    const currentScore = document.getElementById('currentScore');
    const highScore = document.getElementById('highScore');
    const snakeLength = document.getElementById('snakeLength');
    const gameTime = document.getElementById('gameTime');

    if (score) {
      if (currentScore) currentScore.textContent = score.currentScore.toString();
      if (highScore) highScore.textContent = score.highScore.toString();
      if (snakeLength) snakeLength.textContent = score.snakeLength.toString();
      if (gameTime) gameTime.textContent = score.gameTime.toString();
    } else {
      const gameScore = this.gameEngine.getScore();
      if (currentScore) currentScore.textContent = gameScore.currentScore.toString();
      if (highScore) highScore.textContent = gameScore.highScore.toString();
      if (snakeLength) snakeLength.textContent = gameScore.snakeLength.toString();
      if (gameTime) gameTime.textContent = gameScore.gameTime.toString();
    }
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    if (!this.isInitialized) return;

    try {
      const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
      if (canvas) {
        const container = canvas.parentElement;
        if (container && typeof container.getBoundingClientRect === 'function') {
          // Get computed styles to account for border
          const computedStyle = window.getComputedStyle(container);
          const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
          const borderRight = parseFloat(computedStyle.borderRightWidth) || 0;
          const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
          const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;

          const totalBorderWidth = borderLeft + borderRight;
          const totalBorderHeight = borderTop + borderBottom;

          // Calculate available space from viewport
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Account for padding and space for controls
          const maxWidth = Math.min(viewportWidth * 0.9, viewportHeight * 0.9);
          const maxHeight = Math.min(viewportWidth * 0.9, viewportHeight * 0.9);

          // Calculate canvas size (square)
          const minSize = 200;
          const maxSize = Math.min(maxWidth - totalBorderWidth, maxHeight - totalBorderHeight);
          const canvasSize = Math.max(minSize, maxSize);

          // Resize the canvas via renderer
          this.renderer.resize(canvasSize, canvasSize);

          // Set container dimensions to exactly match canvas + borders
          container.style.width = `${canvasSize + totalBorderWidth}px`;
          container.style.height = `${canvasSize + totalBorderHeight}px`;
        }
      }
    } catch (error) {
      console.warn('Failed to handle resize:', error);
    }
  }

  /**
   * Show game container
   */
  private showGameContainer(): void {
    const loading = document.getElementById('loading');
    const gameContainer = document.getElementById('gameContainer');
    const errorContainer = document.getElementById('errorContainer');

    if (loading) loading.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'flex';
    if (errorContainer) errorContainer.style.display = 'none';
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);

    const loading = document.getElementById('loading');
    const gameContainer = document.getElementById('gameContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');

    if (loading) loading.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'none';
    if (errorContainer) errorContainer.style.display = 'block';
    if (errorMessage) errorMessage.textContent = `${message}: ${error.message || error}`;
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    try {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      this.gameEngine.stop();
      this.inputHandler.destroy();
      this.mobileControls.destroy();
      this.renderer.destroy();
      this.eventEmitter.removeAllListeners();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new SnakeGame();

    // Make game available globally for debugging
    (window as any).snakeGame = game;

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      game.destroy();
    });
  } catch (error) {
    console.error('Failed to initialize Snake Game:', error);

    const loading = document.getElementById('loading');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');

    if (loading) loading.style.display = 'none';
    if (errorContainer) errorContainer.style.display = 'block';
    if (errorMessage) errorMessage.textContent = `Failed to initialize game: ${error}`;
  }
});
