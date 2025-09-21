/**
 * Game board tests
 */

import { SnakeSegment } from '../../interfaces/game.types';
import { GameBoard } from '../game-board';
import { Position } from '../position';

describe('GameBoard', () => {
  let gameBoard: GameBoard;

  beforeEach(() => {
    gameBoard = new GameBoard(10);
  });

  describe('boundary checking', () => {
    it('should detect out of bounds positions', () => {
      expect(gameBoard.isOutOfBounds(new Position(-1, 5))).toBe(true);
      expect(gameBoard.isOutOfBounds(new Position(5, -1))).toBe(true);
      expect(gameBoard.isOutOfBounds(new Position(10, 5))).toBe(true);
      expect(gameBoard.isOutOfBounds(new Position(5, 10))).toBe(true);
    });

    it('should detect valid positions', () => {
      expect(gameBoard.isOutOfBounds(new Position(0, 0))).toBe(false);
      expect(gameBoard.isOutOfBounds(new Position(5, 5))).toBe(false);
      expect(gameBoard.isOutOfBounds(new Position(9, 9))).toBe(false);
    });

    it('should validate positions correctly', () => {
      expect(gameBoard.isValidPosition(new Position(5, 5))).toBe(true);
      expect(gameBoard.isValidPosition(new Position(-1, 5))).toBe(false);
    });
  });

  describe('empty positions', () => {
    it('should return all positions for empty board', () => {
      const emptyPositions = gameBoard.getEmptyPositions();
      expect(emptyPositions).toHaveLength(100); // 10x10 grid
    });

    it('should exclude snake positions', () => {
      const snakeSegments: SnakeSegment[] = [
        { position: new Position(5, 5), isHead: true },
        { position: new Position(4, 5), isHead: false },
        { position: new Position(3, 5), isHead: false },
      ];

      const emptyPositions = gameBoard.getEmptyPositionsExcludingSnake(snakeSegments);
      expect(emptyPositions).toHaveLength(97); // 100 - 3 snake segments

      // Check that snake positions are not included
      snakeSegments.forEach((segment) => {
        expect(emptyPositions.some((pos) => pos.equals(segment.position))).toBe(false);
      });
    });
  });

  describe('center position', () => {
    it('should return correct center position', () => {
      const center = gameBoard.getCenterPosition();
      expect(center.x).toBe(5);
      expect(center.y).toBe(5);
    });
  });

  describe('random empty position', () => {
    it('should return random position when available', () => {
      const snakeSegments: SnakeSegment[] = [{ position: new Position(5, 5), isHead: true }];

      const randomPosition = gameBoard.getRandomEmptyPosition(snakeSegments);
      expect(randomPosition).not.toBeNull();
      expect(randomPosition?.x).toBeGreaterThanOrEqual(0);
      expect(randomPosition?.x).toBeLessThan(10);
      expect(randomPosition?.y).toBeGreaterThanOrEqual(0);
      expect(randomPosition?.y).toBeLessThan(10);
    });

    it('should return null when no empty positions', () => {
      // Fill entire board with snake segments
      const snakeSegments: SnakeSegment[] = [];
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          snakeSegments.push({ position: new Position(x, y), isHead: x === 0 && y === 0 });
        }
      }

      const randomPosition = gameBoard.getRandomEmptyPosition(snakeSegments);
      expect(randomPosition).toBeNull();
    });
  });

  describe('grid size', () => {
    it('should return correct grid size', () => {
      expect(gameBoard.getGridSize()).toBe(10);
    });
  });
});
