/**
 * Game board entity for managing grid boundaries and empty positions
 */

import { SnakeSegment } from '../interfaces/game.types';
import { IGameBoard } from '../interfaces/services.types';
import { Position } from './position';

export class GameBoard implements IGameBoard {
  private readonly gridSize: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  /**
   * Check if position is out of bounds
   */
  public isOutOfBounds(position: Position): boolean {
    return (
      position.x < 0 || position.x >= this.gridSize || position.y < 0 || position.y >= this.gridSize
    );
  }

  /**
   * Check if position is valid (within bounds)
   */
  public isValidPosition(position: Position): boolean {
    return !this.isOutOfBounds(position);
  }

  /**
   * Get all empty positions on the board
   */
  public getEmptyPositions(): Position[] {
    const emptyPositions: Position[] = [];

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        emptyPositions.push(new Position(x, y));
      }
    }

    return emptyPositions;
  }

  /**
   * Get empty positions excluding snake segments
   */
  public getEmptyPositionsExcludingSnake(snakeSegments: readonly SnakeSegment[]): Position[] {
    const snakePositions = new Set(
      snakeSegments.map((segment) => `${segment.position.x},${segment.position.y}`)
    );

    const emptyPositions: Position[] = [];

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const positionKey = `${x},${y}`;
        if (!snakePositions.has(positionKey)) {
          emptyPositions.push(new Position(x, y));
        }
      }
    }

    return emptyPositions;
  }

  /**
   * Get grid size
   */
  public getGridSize(): number {
    return this.gridSize;
  }

  /**
   * Get center position of the board
   */
  public getCenterPosition(): Position {
    const centerX = Math.floor(this.gridSize / 2);
    const centerY = Math.floor(this.gridSize / 2);
    return new Position(centerX, centerY);
  }

  /**
   * Get random empty position
   */
  public getRandomEmptyPosition(snakeSegments: readonly SnakeSegment[]): Position | null {
    const emptyPositions = this.getEmptyPositionsExcludingSnake(snakeSegments);

    if (emptyPositions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    return emptyPositions[randomIndex];
  }
}
