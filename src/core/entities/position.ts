/**
 * Position utility class with helper methods
 */

import { Position as IPosition } from '../interfaces/game.types';

export class Position implements IPosition {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Check if this position equals another position
   */
  public equals(other: IPosition): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Create a new position with offset
   */
  public add(offset: IPosition): Position {
    return new Position(this.x + offset.x, this.y + offset.y);
  }

  /**
   * Create a new position with negative offset
   */
  public subtract(offset: IPosition): Position {
    return new Position(this.x - offset.x, this.y - offset.y);
  }

  /**
   * Get distance to another position
   */
  public distanceTo(other: IPosition): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if position is within bounds
   */
  public isWithinBounds(minX: number, minY: number, maxX: number, maxY: number): boolean {
    return this.x >= minX && this.x < maxX && this.y >= minY && this.y < maxY;
  }

  /**
   * Create a copy of this position
   */
  public clone(): Position {
    return new Position(this.x, this.y);
  }

  /**
   * Convert to string representation
   */
  public toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
