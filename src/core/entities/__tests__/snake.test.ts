/**
 * Snake entity tests
 */

import { Direction } from '../../interfaces/game.types';
import { Position } from '../position';
import { Snake } from '../snake';

describe('Snake', () => {
  let snake: Snake;
  const config = {
    gridSize: 10,
    gameSpeed: 100,
    initialSnakeLength: 3,
    snakeColor: '#4CAF50',
    foodColor: '#F44336',
    backgroundColor: '#000',
    specialFoodColor: '#FF9800',
    specialFoodSpawnChance: 0.1,
  };

  beforeEach(() => {
    snake = new Snake(config);
  });

  describe('initialization', () => {
    it('should initialize with correct length', () => {
      expect(snake.getLength()).toBe(3);
    });

    it('should have head at first position', () => {
      const segments = snake.getSegments();
      expect(segments[0].isHead).toBe(true);
      expect(segments[1].isHead).toBe(false);
      expect(segments[2].isHead).toBe(false);
    });

    it('should start at center of grid', () => {
      const headPosition = snake.getHeadPosition();
      expect(headPosition.x).toBe(5); // center of 10x10 grid
      expect(headPosition.y).toBe(5);
    });
  });

  describe('movement', () => {
    it('should move in the correct direction', () => {
      const initialHead = snake.getHeadPosition();
      snake.changeDirection(Direction.DOWN);
      snake.move();

      const newHead = snake.getHeadPosition();
      expect(newHead.y).toBe(initialHead.y + 1);
      expect(newHead.x).toBe(initialHead.x);
    });

    it('should not reverse into itself', () => {
      // Snake starts moving right
      snake.changeDirection(Direction.LEFT); // Should be ignored (reverse direction)

      // Move should continue right, not left
      snake.move();
      const head = snake.getHeadPosition();
      expect(head.x).toBe(6); // Should continue right to 6
    });

    it('should prevent reverse direction', () => {
      // Snake starts moving right
      snake.changeDirection(Direction.LEFT); // Should be ignored (reverse)

      // Move should continue right
      snake.move();
      const head = snake.getHeadPosition();
      expect(head.x).toBe(6); // Should continue right to 6
    });

    it('should allow valid direction changes', () => {
      // Snake starts at (5,5) moving right
      const initialPosition = snake.getHeadPosition();
      expect(initialPosition.x).toBe(5);

      // Change direction to up (valid)
      snake.changeDirection(Direction.UP);

      // Move should go up
      snake.move();
      const head = snake.getHeadPosition();
      expect(head.y).toBe(4); // Should move up to 4
    });

    it('should change direction to up', () => {
      // Snake starts at (5,5) moving right
      const initialPosition = snake.getHeadPosition();
      expect(initialPosition.x).toBe(5);
      expect(initialPosition.y).toBe(5);

      // Change direction to up
      snake.changeDirection(Direction.UP);

      // Move should go up, not right
      snake.move();
      const head = snake.getHeadPosition();
      expect(head.x).toBe(5); // X should stay the same
      expect(head.y).toBe(4); // Y should decrease (up)
    });

    it('should change direction to down', () => {
      // Snake starts at (5,5) moving right
      const initialPosition = snake.getHeadPosition();
      expect(initialPosition.x).toBe(5);
      expect(initialPosition.y).toBe(5);

      // Change direction to down
      snake.changeDirection(Direction.DOWN);

      // Move should go down, not right
      snake.move();
      const head = snake.getHeadPosition();
      expect(head.x).toBe(5); // X should stay the same
      expect(head.y).toBe(6); // Y should increase (down)
    });

    it('should prevent reverse direction from right to left', () => {
      // Snake starts moving right
      snake.changeDirection(Direction.LEFT); // Should be ignored (reverse)

      // Move should continue right
      snake.move();
      const head = snake.getHeadPosition();
      expect(head.x).toBe(6); // Should continue right to 6
    });

    it('should maintain segment count during movement', () => {
      const initialLength = snake.getLength();
      snake.move();
      expect(snake.getLength()).toBe(initialLength);
    });

    it('should update head flag correctly', () => {
      snake.move();
      const segments = snake.getSegments();
      expect(segments[0].isHead).toBe(true);
      expect(segments[1].isHead).toBe(false);
    });
  });

  describe('growth', () => {
    it('should grow when food is consumed', () => {
      const initialLength = snake.getLength();
      snake.grow();
      expect(snake.getLength()).toBe(initialLength + 1);
    });

    it('should add new segment at tail', () => {
      const tailPosition = snake.getSegments()[snake.getLength() - 1].position;
      snake.grow();
      const newTailPosition = snake.getSegments()[snake.getLength() - 1].position;
      expect(
        new Position(newTailPosition.x, newTailPosition.y).equals(
          new Position(tailPosition.x, tailPosition.y)
        )
      ).toBe(true);
    });
  });

  describe('collision detection', () => {
    it('should detect self collision', () => {
      // Grow snake first to make collision possible
      snake.grow();
      snake.grow();
      snake.grow();

      // Create a scenario where snake collides with itself
      snake.changeDirection(Direction.UP);
      snake.move();
      snake.changeDirection(Direction.RIGHT);
      snake.move();
      snake.changeDirection(Direction.DOWN);
      snake.move();
      snake.changeDirection(Direction.LEFT);
      snake.move();

      expect(snake.hasSelfCollision()).toBe(true);
    });

    it('should not detect collision when not colliding', () => {
      expect(snake.hasSelfCollision()).toBe(false);
    });
  });

  describe('position checking', () => {
    it('should contain its own positions', () => {
      const segments = snake.getSegments();
      segments.forEach((segment) => {
        expect(snake.containsPosition(new Position(segment.position.x, segment.position.y))).toBe(
          true
        );
      });
    });

    it('should not contain positions outside snake', () => {
      const outsidePosition = new Position(0, 0);
      expect(snake.containsPosition(outsidePosition)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      snake.changeDirection(Direction.UP);
      snake.move();
      snake.grow();

      snake.reset();

      expect(snake.getLength()).toBe(3);
      expect(snake.getHeadPosition().x).toBe(5);
      expect(snake.getHeadPosition().y).toBe(5);
    });
  });
});
