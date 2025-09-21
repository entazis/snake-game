/**
 * Score manager tests
 */

import { ScoreManager } from '../score-manager';
import { Storage } from '../storage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ScoreManager', () => {
  let scoreManager: ScoreManager;
  let storage: Storage;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    storage = new Storage();
    scoreManager = new ScoreManager(storage);
  });

  describe('initialization', () => {
    it('should start with zero score', () => {
      expect(scoreManager.getCurrentScore()).toBe(0);
      expect(scoreManager.getHighScore()).toBe(0);
    });

    it('should load high score from storage', () => {
      localStorageMock.getItem.mockReturnValue('100');
      const newScoreManager = new ScoreManager(storage);
      expect(newScoreManager.getHighScore()).toBe(100);
    });
  });

  describe('score management', () => {
    it('should add points correctly', () => {
      scoreManager.addPoints(10);
      expect(scoreManager.getCurrentScore()).toBe(10);
    });

    it('should update high score when current score exceeds it', () => {
      scoreManager.addPoints(50);
      expect(scoreManager.getHighScore()).toBe(50);
    });

    it('should not update high score when current score is lower', () => {
      scoreManager.addPoints(50);
      scoreManager.resetScore();
      scoreManager.addPoints(30);
      expect(scoreManager.getHighScore()).toBe(50);
    });
  });

  describe('game statistics', () => {
    it('should track food eaten', () => {
      scoreManager.incrementFoodEaten();
      scoreManager.incrementFoodEaten();
      const score = scoreManager.getScore();
      expect(score.foodEaten).toBe(2);
    });

    it('should track snake length', () => {
      scoreManager.updateSnakeLength(5);
      const score = scoreManager.getScore();
      expect(score.snakeLength).toBe(5);
    });

    it('should track game time', () => {
      scoreManager.startGameTimer();
      scoreManager.updateGameTime(5);
      const score = scoreManager.getScore();
      expect(score.gameTime).toBe(5);
    });
  });

  describe('score reset', () => {
    it('should reset current score', () => {
      scoreManager.addPoints(50);
      scoreManager.resetScore();
      expect(scoreManager.getCurrentScore()).toBe(0);
    });

    it('should reset game statistics', () => {
      scoreManager.incrementFoodEaten();
      scoreManager.updateSnakeLength(5);
      scoreManager.resetScore();

      const score = scoreManager.getScore();
      expect(score.foodEaten).toBe(0);
      expect(score.snakeLength).toBe(3);
      expect(score.gameTime).toBe(0);
    });
  });

  describe('score persistence', () => {
    it('should save high score', () => {
      scoreManager.addPoints(100);
      scoreManager.saveHighScore();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('snake-game-high-score', '100');
    });

    it('should get game statistics', () => {
      const stats = scoreManager.getGameStats();
      expect(stats).toHaveProperty('totalGames');
      expect(stats).toHaveProperty('lastPlayed');
    });
  });

  describe('complete score data', () => {
    it('should return complete score information', () => {
      scoreManager.addPoints(25);
      scoreManager.incrementFoodEaten();
      scoreManager.updateSnakeLength(4);
      scoreManager.startGameTimer();

      const score = scoreManager.getScore();
      expect(score.currentScore).toBe(25);
      expect(score.highScore).toBe(25);
      expect(score.snakeLength).toBe(4);
      expect(score.foodEaten).toBe(1);
      expect(score.gameTime).toBeGreaterThanOrEqual(0);
    });
  });
});
