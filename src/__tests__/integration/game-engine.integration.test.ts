/**
 * Game engine integration tests
 */

import { GameEvents } from '../../core/interfaces/events.types';
import { Direction, GameState } from '../../core/interfaces/game.types';
import { GameEngine } from '../../core/services/game-engine';
import { ScoreManager } from '../../core/services/score-manager';
import { Storage } from '../../core/services/storage';
import { EventEmitter } from '../../utils/event-emitter';

// Mock performance.now
const mockPerformanceNow = jest.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn();
const mockCancelAnimationFrame = jest.fn();
Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
});
Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
});

describe('GameEngine Integration', () => {
  let gameEngine: GameEngine;
  let scoreManager: ScoreManager;
  let storage: Storage;
  let eventEmitter: EventEmitter<GameEvents>;
  let config: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 0);
      return 1;
    });

    storage = new Storage();
    scoreManager = new ScoreManager(storage);
    eventEmitter = new EventEmitter<GameEvents>();

    config = {
      gridSize: 10,
      gameSpeed: 100,
      initialSnakeLength: 3,
      snakeColor: '#4CAF50',
      foodColor: '#F44336',
      backgroundColor: '#000',
      specialFoodColor: '#FF9800',
      specialFoodSpawnChance: 0.1,
    };

    gameEngine = new GameEngine(config, scoreManager, eventEmitter);
  });

  describe('game lifecycle', () => {
    it('should start in menu state', () => {
      expect(gameEngine.getState()).toBe(GameState.MENU);
    });

    it('should start game and change state', () => {
      gameEngine.start();
      expect(gameEngine.getState()).toBe(GameState.PLAYING);
    });

    it('should not start if already playing', () => {
      gameEngine.start();
      const initialState = gameEngine.getState();
      gameEngine.start(); // Try to start again
      expect(gameEngine.getState()).toBe(initialState);
    });

    it('should pause and resume correctly', () => {
      gameEngine.start();
      expect(gameEngine.getState()).toBe(GameState.PLAYING);

      gameEngine.pause();
      expect(gameEngine.getState()).toBe(GameState.PAUSED);

      gameEngine.resume();
      expect(gameEngine.getState()).toBe(GameState.PLAYING);
    });

    it('should toggle pause correctly', () => {
      gameEngine.start();
      expect(gameEngine.getState()).toBe(GameState.PLAYING);

      gameEngine.togglePause();
      expect(gameEngine.getState()).toBe(GameState.PAUSED);

      gameEngine.togglePause();
      expect(gameEngine.getState()).toBe(GameState.PLAYING);
    });

    it('should reset game to initial state', () => {
      gameEngine.start();
      gameEngine.changeDirection(Direction.UP);
      gameEngine.reset();

      expect(gameEngine.getState()).toBe(GameState.MENU);
      const score = gameEngine.getScore();
      expect(score.currentScore).toBe(0);
    });
  });

  describe('game events', () => {
    it('should emit game start event', (done) => {
      eventEmitter.on('game:start', (data) => {
        expect(data.config).toBeDefined();
        done();
      });

      gameEngine.start();
    });

    it('should emit pause and resume events', (done) => {
      let eventCount = 0;

      eventEmitter.on('game:pause', () => {
        eventCount++;
        if (eventCount === 2) done();
      });

      eventEmitter.on('game:resume', () => {
        eventCount++;
        if (eventCount === 2) done();
      });

      gameEngine.start();
      gameEngine.pause();
      gameEngine.resume();
    });

    it('should emit snake move events', (done) => {
      eventEmitter.on('snake:move', (data) => {
        expect(data.position).toBeDefined();
        done();
      });

      gameEngine.start();
      gameEngine.update(100);
    });

    it('should emit score update events', (done) => {
      eventEmitter.on('score:update', (data) => {
        expect(data.score).toBeDefined();
        done();
      });

      gameEngine.start();
      gameEngine.update(100);
    });
  });

  describe('game mechanics', () => {
    it('should update game state correctly', () => {
      gameEngine.start();
      const initialRenderData = gameEngine.getRenderData();

      gameEngine.update(150);

      const newRenderData = gameEngine.getRenderData();
      expect(newRenderData.gameState).toBe(GameState.PLAYING);
      expect(newRenderData.snake.length).toBeGreaterThanOrEqual(3);
    });

    it('should change snake direction', () => {
      gameEngine.start();
      const initialRenderData = gameEngine.getRenderData();

      gameEngine.changeDirection(Direction.UP);
      gameEngine.update(100);

      const newRenderData = gameEngine.getRenderData();
      expect(newRenderData).toBeDefined();
    });

    it('should provide render data', () => {
      const renderData = gameEngine.getRenderData();
      expect(renderData).toHaveProperty('snake');
      expect(renderData).toHaveProperty('food');
      expect(renderData).toHaveProperty('score');
      expect(renderData).toHaveProperty('gameState');
    });
  });

  describe('error handling', () => {
    it('should handle invalid operations gracefully', () => {
      // Try to pause when not playing
      expect(() => gameEngine.pause()).not.toThrow();

      // Try to resume when not paused
      expect(() => gameEngine.resume()).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should stop game and clean up resources', () => {
      gameEngine.start();
      gameEngine.stop();

      expect(gameEngine.getState()).toBe(GameState.MENU);
      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });
});
