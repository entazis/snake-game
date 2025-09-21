/**
 * Snake entity with movement, growth, and collision detection
 */

import {
  Direction,
  GameConfig,
  Position as IPosition,
  SnakeSegment,
} from '../interfaces/game.types';
import { ISnake } from '../interfaces/services.types';
import { Position } from './position';

export class Snake implements ISnake {
  private readonly config: GameConfig;
  private segments: Array<{ position: Position; isHead: boolean }> = [];
  private direction: Direction = Direction.RIGHT;
  private nextDirection: Direction = Direction.RIGHT;

  constructor(config: GameConfig) {
    this.config = config;
    this.initializeSnake();
  }

  /**
   * Initialize snake with initial segments
   */
  private initializeSnake(): void {
    this.segments = [];
    const centerX = Math.floor(this.config.gridSize / 2);
    const centerY = Math.floor(this.config.gridSize / 2);

    for (let i = 0; i < this.config.initialSnakeLength; i++) {
      this.segments.push({
        position: new Position(centerX - i, centerY),
        isHead: i === 0,
      });
    }
  }

  /**
   * Move snake in current direction
   */
  public move(): void {
    this.direction = this.nextDirection;
    const head = this.segments[0];
    const newHeadPosition = this.calculateNewHeadPosition(head.position);

    // Add new head
    this.segments.unshift({
      position: newHeadPosition,
      isHead: true,
    });

    // Remove tail
    this.segments.pop();

    // Update head flag for previous head
    if (this.segments.length > 1) {
      this.segments[1] = { ...this.segments[1], isHead: false };
    }
  }

  /**
   * Calculate new head position based on current direction
   */
  private calculateNewHeadPosition(currentPosition: Position): Position {
    switch (this.direction) {
      case Direction.UP:
        return new Position(currentPosition.x, currentPosition.y - 1);
      case Direction.DOWN:
        return new Position(currentPosition.x, currentPosition.y + 1);
      case Direction.LEFT:
        return new Position(currentPosition.x - 1, currentPosition.y);
      case Direction.RIGHT:
        return new Position(currentPosition.x + 1, currentPosition.y);
      default:
        return currentPosition;
    }
  }

  /**
   * Change snake direction
   */
  public changeDirection(newDirection: Direction): void {
    // Prevent reversing into itself
    if (this.isOppositeDirection(newDirection)) {
      return;
    }
    this.nextDirection = newDirection;
  }

  /**
   * Check if direction is opposite to current direction
   */
  private isOppositeDirection(direction: Direction): boolean {
    const opposites: Record<Direction, Direction> = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT,
    };
    return opposites[this.direction] === direction;
  }

  /**
   * Grow snake by adding a segment
   */
  public grow(): void {
    const tail = this.segments[this.segments.length - 1];
    this.segments.push({
      position: new Position(tail.position.x, tail.position.y),
      isHead: false,
    });
  }

  /**
   * Check if snake has collided with itself
   */
  public hasSelfCollision(): boolean {
    const head = this.segments[0];
    return this.segments.slice(1).some((segment) => segment.position.equals(head.position));
  }

  /**
   * Get head position
   */
  public getHeadPosition(): Position {
    return this.segments[0].position;
  }

  /**
   * Get all snake segments
   */
  public getSegments(): readonly SnakeSegment[] {
    return this.segments.map((segment) => ({
      position: segment.position as IPosition,
      isHead: segment.isHead,
    }));
  }

  /**
   * Get snake length
   */
  public getLength(): number {
    return this.segments.length;
  }

  /**
   * Reset snake to initial state
   */
  public reset(): void {
    this.direction = Direction.RIGHT;
    this.nextDirection = Direction.RIGHT;
    this.initializeSnake();
  }

  /**
   * Get current direction
   */
  public getDirection(): Direction {
    return this.direction;
  }

  /**
   * Check if snake contains position
   */
  public containsPosition(position: Position): boolean {
    return this.segments.some((segment) => segment.position.equals(position));
  }
}
