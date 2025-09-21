/**
 * Service interfaces
 */

import {
  Direction,
  FoodType,
  GameRenderData,
  GameState,
  Position,
  ScoreData,
  SnakeSegment,
} from './game.types';

// Game engine interface
export interface IGameEngine {
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(): void;
  update(deltaTime: number): void;
  changeDirection(direction: Direction): void;
  getState(): GameState;
  getScore(): ScoreData;
  getRenderData(): GameRenderData;
  togglePause(): void;
}

// Input handler interface
export interface IInputHandler {
  onDirectionChange(callback: (direction: Direction) => void): void;
  onPauseToggle(callback: () => void): void;
  onGameStart(callback: () => void): void;
  onGameReset(callback: () => void): void;
  destroy(): void;
}

// Renderer interface
export interface IRenderer {
  render(gameData: GameRenderData): void;
  clear(): void;
  resize(width: number, height: number): void;
  destroy(): void;
  showMainMenu(): void;
  showGameOver(score: ScoreData): void;
  showPause(): void;
}

// Score manager interface
export interface IScoreManager {
  addPoints(points: number): void;
  getCurrentScore(): number;
  getHighScore(): number;
  getScore(): ScoreData;
  saveHighScore(): void;
  resetScore(): void;
  incrementFoodEaten(): void;
  updateGameTime(time: number): void;
  startGameTimer(): void;
  updateTimer(): void;
  updateSnakeLength(length: number): void;
}

// Storage interface
export interface IStorage {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

// Game board interface
export interface IGameBoard {
  isOutOfBounds(position: Position): boolean;
  getEmptyPositions(): Position[];
  getGridSize(): number;
  isValidPosition(position: Position): boolean;
}

// Snake interface
export interface ISnake {
  move(): void;
  grow(): void;
  changeDirection(direction: Direction): void;
  hasSelfCollision(): boolean;
  getHeadPosition(): Position;
  getSegments(): readonly SnakeSegment[];
  getLength(): number;
  reset(): void;
}

// Food interface
export interface IFood {
  getPosition(): Position;
  getType(): FoodType;
  getPoints(): number;
  respawn(availablePositions: Position[]): void;
  isAtPosition(position: Position): boolean;
}
