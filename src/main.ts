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
import { CanvasRenderer } from './ui/renderer/canvas-renderer';
import { EventEmitter } from './utils/event-emitter';

class SnakeGame {
  private readonly gameEngine!: GameEngine;
  private readonly inputHandler!: InputHandler;
  private readonly renderer!: CanvasRenderer;
  private readonly eventEmitter!: EventEmitter<GameEvents>;
  private readonly storage!: Storage;
  private readonly scoreManager!: ScoreManager;

  private isInitialized = false;
  private gameConfig = createGameConfig(defaultGameSettings);

  constructor() {
    try {
      this.storage = new Storage();
      this.scoreManager = new ScoreManager(this.storage);
      this.eventEmitter = new EventEmitter<GameEvents>();
      this.gameEngine = new GameEngine(this.gameConfig, this.scoreManager, this.eventEmitter);
      this.inputHandler = new InputHandler();
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
      this.gameEngine.togglePause();
    });

    this.inputHandler.onGameStart(() => {
      this.startGame();
    });

    this.inputHandler.onGameReset(() => {
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
    // Window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
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
        if (container) {
          const containerRect = container.getBoundingClientRect();
          this.renderer.resize(containerRect.width - 6, containerRect.height - 6); // Account for border
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
      this.gameEngine.stop();
      this.inputHandler.destroy();
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
