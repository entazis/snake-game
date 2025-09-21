/**
 * Core game types and interfaces
 */

// Position interface for grid coordinates
export interface Position {
  readonly x: number;
  readonly y: number;
}

// Direction enum for snake movement
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

// Game state enum
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  SETTINGS = 'SETTINGS',
}

// Snake segment interface
export interface SnakeSegment {
  readonly position: Position;
  readonly isHead: boolean;
}

// Food types
export enum FoodType {
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL',
}

// Food interface
export interface Food {
  readonly position: Position;
  readonly type: FoodType;
  readonly points: number;
}

// Game configuration
export interface GameConfig {
  readonly gridSize: number;
  readonly gameSpeed: number;
  readonly initialSnakeLength: number;
  readonly snakeColor: string;
  readonly foodColor: string;
  readonly backgroundColor: string;
  readonly specialFoodColor: string;
  readonly specialFoodSpawnChance: number;
}

// Score data
export interface ScoreData {
  readonly currentScore: number;
  readonly highScore: number;
  readonly snakeLength: number;
  readonly foodEaten: number;
  readonly gameTime: number;
}

// Game render data
export interface GameRenderData {
  readonly snake: readonly SnakeSegment[];
  readonly food: Food;
  readonly score: ScoreData;
  readonly gameState: GameState;
}

// Difficulty levels
export enum DifficultyLevel {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

// Game settings
export interface GameSettings {
  readonly difficulty: DifficultyLevel;
  readonly soundEnabled: boolean;
  readonly gridSize: number;
  readonly snakeColor: string;
  readonly foodColor: string;
  readonly backgroundColor: string;
}
