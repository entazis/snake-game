/**
 * Game configuration and settings
 */

import { DifficultyLevel, GameConfig, GameSettings } from '../core/interfaces/game.types';

// Default game configuration
export const defaultGameConfig: GameConfig = {
  gridSize: 20,
  gameSpeed: 150, // milliseconds
  initialSnakeLength: 3,
  snakeColor: '#4CAF50',
  foodColor: '#F44336',
  backgroundColor: '#1a1a1a',
  specialFoodColor: '#FF9800',
  specialFoodSpawnChance: 0.1, // 10% chance
};

// Difficulty configurations
export const difficultyConfigs: Record<DifficultyLevel, Partial<GameConfig>> = {
  [DifficultyLevel.EASY]: {
    gridSize: 15,
    gameSpeed: 200,
    specialFoodSpawnChance: 0.15,
  },
  [DifficultyLevel.NORMAL]: {
    gridSize: 20,
    gameSpeed: 150,
    specialFoodSpawnChance: 0.1,
  },
  [DifficultyLevel.HARD]: {
    gridSize: 25,
    gameSpeed: 100,
    specialFoodSpawnChance: 0.05,
  },
  [DifficultyLevel.EXPERT]: {
    gridSize: 30,
    gameSpeed: 80,
    specialFoodSpawnChance: 0.02,
  },
};

// Default game settings
export const defaultGameSettings: GameSettings = {
  difficulty: DifficultyLevel.NORMAL,
  soundEnabled: true,
  gridSize: 20,
  snakeColor: '#4CAF50',
  foodColor: '#F44336',
  backgroundColor: '#1a1a1a',
};

// Color themes
export const colorThemes = {
  classic: {
    snakeColor: '#4CAF50',
    foodColor: '#F44336',
    backgroundColor: '#1a1a1a',
    specialFoodColor: '#FF9800',
  },
  neon: {
    snakeColor: '#00FF00',
    foodColor: '#FF0080',
    backgroundColor: '#000000',
    specialFoodColor: '#00FFFF',
  },
  retro: {
    snakeColor: '#00FF00',
    foodColor: '#FF0000',
    backgroundColor: '#000000',
    specialFoodColor: '#FFFF00',
  },
  pastel: {
    snakeColor: '#81C784',
    foodColor: '#F48FB1',
    backgroundColor: '#F3E5F5',
    specialFoodColor: '#FFB74D',
  },
};

/**
 * Create game configuration from settings
 */
export function createGameConfig(settings: GameSettings): GameConfig {
  const difficultyConfig = difficultyConfigs[settings.difficulty];
  const theme = colorThemes.classic; // Default theme

  return {
    ...defaultGameConfig,
    ...difficultyConfig,
    gridSize: settings.gridSize,
    snakeColor: settings.snakeColor,
    foodColor: settings.foodColor,
    backgroundColor: settings.backgroundColor,
  };
}

/**
 * Get configuration for difficulty level
 */
export function getConfigForDifficulty(difficulty: DifficultyLevel): GameConfig {
  const difficultyConfig = difficultyConfigs[difficulty];
  return {
    ...defaultGameConfig,
    ...difficultyConfig,
  };
}

/**
 * Validate game configuration
 */
export function validateGameConfig(config: Partial<GameConfig>): config is GameConfig {
  return (
    typeof config.gridSize === 'number' &&
    config.gridSize > 0 &&
    typeof config.gameSpeed === 'number' &&
    config.gameSpeed > 0 &&
    typeof config.initialSnakeLength === 'number' &&
    config.initialSnakeLength > 0 &&
    typeof config.snakeColor === 'string' &&
    typeof config.foodColor === 'string' &&
    typeof config.backgroundColor === 'string' &&
    typeof config.specialFoodColor === 'string' &&
    typeof config.specialFoodSpawnChance === 'number' &&
    config.specialFoodSpawnChance >= 0 &&
    config.specialFoodSpawnChance <= 1
  );
}
