/**
 * Main game engine coordinating all game components
 */

import { Food } from '../entities/food';
import { GameBoard } from '../entities/game-board';
import { Snake } from '../entities/snake';
import { GameEvents, IEventEmitter } from '../interfaces/events.types';
import {
  Direction,
  GameConfig,
  GameRenderData,
  GameState,
  ScoreData,
} from '../interfaces/game.types';
import { IGameEngine, IScoreManager } from '../interfaces/services.types';

export class GameEngine implements IGameEngine {
  private readonly config: GameConfig;
  private readonly snake: Snake;
  private food: Food;
  private readonly gameBoard: GameBoard;
  private readonly scoreManager: IScoreManager;
  private readonly eventEmitter: IEventEmitter<GameEvents>;

  private gameState: GameState = GameState.MENU;
  private lastUpdateTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(
    config: GameConfig,
    scoreManager: IScoreManager,
    eventEmitter: IEventEmitter<GameEvents>
  ) {
    this.config = config;
    this.scoreManager = scoreManager;
    this.eventEmitter = eventEmitter;
    this.snake = new Snake(config);
    this.gameBoard = new GameBoard(config.gridSize);
    this.food = this.createInitialFood();
  }

  /**
   * Start the game
   */
  public start(): void {
    if (this.gameState !== GameState.MENU && this.gameState !== GameState.GAME_OVER) {
      return;
    }

    this.reset();
    this.gameState = GameState.PLAYING;
    this.lastUpdateTime = performance.now();
    this.scoreManager.startGameTimer();
    this.gameLoop();

    this.eventEmitter.emit('game:start', { config: this.config });
  }

  /**
   * Pause the game
   */
  public pause(): void {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }

    this.gameState = GameState.PAUSED;
    this.eventEmitter.emit('game:pause', { timestamp: performance.now() });
  }

  /**
   * Resume the game
   */
  public resume(): void {
    if (this.gameState !== GameState.PAUSED) {
      return;
    }

    this.gameState = GameState.PLAYING;
    this.lastUpdateTime = performance.now();
    this.gameLoop();
    this.eventEmitter.emit('game:resume', { timestamp: performance.now() });
  }

  /**
   * Toggle pause/resume
   */
  public togglePause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.pause();
    } else if (this.gameState === GameState.PAUSED) {
      this.resume();
    }
  }

  /**
   * Stop the game
   */
  public stop(): void {
    this.gameState = GameState.MENU;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Reset the game
   */
  public reset(): void {
    this.snake.reset();
    this.scoreManager.resetScore();
    this.food = this.createInitialFood();
    this.gameState = GameState.MENU;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.eventEmitter.emit('game:reset', { timestamp: performance.now() });
  }

  /**
   * Update game state
   */
  public update(deltaTime: number): void {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }

    this.snake.move();
    this.checkCollisions();
    this.checkFoodConsumption();
    this.updateScore();

    this.eventEmitter.emit('snake:move', { position: this.snake.getHeadPosition() });
  }

  /**
   * Change snake direction
   */
  public changeDirection(direction: Direction): void {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }

    this.snake.changeDirection(direction);
    this.eventEmitter.emit('snake:direction-change', { direction });
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    return this.gameState;
  }

  /**
   * Get current score data
   */
  public getScore(): ScoreData {
    return this.scoreManager.getScore();
  }

  /**
   * Get render data for UI
   */
  public getRenderData(): GameRenderData {
    return {
      snake: this.snake.getSegments(),
      food: this.food,
      score: this.scoreManager.getScore(),
      gameState: this.gameState,
    };
  }

  /**
   * Main game loop
   */
  private gameLoop(): void {
    if (this.gameState !== GameState.PLAYING) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    if (deltaTime >= this.config.gameSpeed) {
      this.update(deltaTime);
      this.lastUpdateTime = currentTime;
    }

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Check for collisions
   */
  private checkCollisions(): void {
    const headPosition = this.snake.getHeadPosition();

    if (this.gameBoard.isOutOfBounds(headPosition) || this.snake.hasSelfCollision()) {
      this.gameOver();
    }
  }

  /**
   * Check for food consumption
   */
  private checkFoodConsumption(): void {
    if (this.snake.getHeadPosition().equals(this.food.getPosition())) {
      this.snake.grow();
      this.scoreManager.addPoints(this.food.getPoints());
      this.scoreManager.incrementFoodEaten();
      this.scoreManager.updateSnakeLength(this.snake.getLength());

      this.eventEmitter.emit('food:eaten', {
        food: this.food,
        score: this.scoreManager.getCurrentScore(),
      });

      this.spawnNewFood();
    }
  }

  /**
   * Update score data
   */
  private updateScore(): void {
    this.scoreManager.updateTimer();
    this.scoreManager.updateSnakeLength(this.snake.getLength());
    this.eventEmitter.emit('score:update', { score: this.scoreManager.getScore() });
  }

  /**
   * Handle game over
   */
  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    this.scoreManager.saveHighScore();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.eventEmitter.emit('game:over', { score: this.scoreManager.getScore() });
  }

  /**
   * Create initial food
   */
  private createInitialFood(): Food {
    const emptyPositions = this.gameBoard.getEmptyPositionsExcludingSnake(this.snake.getSegments());
    const randomPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    return Food.createRandomFood(this.config, randomPosition);
  }

  /**
   * Spawn new food
   */
  private spawnNewFood(): void {
    const emptyPositions = this.gameBoard.getEmptyPositionsExcludingSnake(this.snake.getSegments());

    if (emptyPositions.length === 0) {
      // No empty positions, game won
      this.gameOver();
      return;
    }

    this.food = Food.createRandomFood(
      this.config,
      emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
    );
    this.eventEmitter.emit('food:spawn', { food: this.food });
  }
}
