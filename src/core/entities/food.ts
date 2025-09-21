/**
 * Food entity with spawning and collision detection
 */

import { FoodType, GameConfig } from '../interfaces/game.types';
import { IFood } from '../interfaces/services.types';
import { Position } from './position';

export class Food implements IFood {
  public readonly position: Position;
  public readonly type: FoodType;
  public readonly points: number;

  constructor(config: GameConfig, position: Position, type: FoodType = FoodType.REGULAR) {
    this.position = position;
    this.type = type;
    this.points = this.calculatePoints(type);
  }

  /**
   * Calculate points based on food type
   */
  private calculatePoints(type: FoodType): number {
    switch (type) {
      case FoodType.REGULAR:
        return 10;
      case FoodType.SPECIAL:
        return 25;
      default:
        return 10;
    }
  }

  /**
   * Get food position
   */
  public getPosition(): Position {
    return this.position;
  }

  /**
   * Get food type
   */
  public getType(): FoodType {
    return this.type;
  }

  /**
   * Get food points
   */
  public getPoints(): number {
    return this.points;
  }

  /**
   * Respawn food at new position
   */
  public respawn(availablePositions: Position[]): void {
    if (availablePositions.length === 0) {
      throw new Error('No available positions for food spawn');
    }

    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    (this as any).position = availablePositions[randomIndex];
  }

  /**
   * Check if food is at specific position
   */
  public isAtPosition(position: Position): boolean {
    return this.position.equals(position);
  }

  /**
   * Create random food type based on spawn chance
   */
  public static createRandomFood(config: GameConfig, position: Position): Food {
    const isSpecial = Math.random() < config.specialFoodSpawnChance;
    const type = isSpecial ? FoodType.SPECIAL : FoodType.REGULAR;
    return new Food(config, position, type);
  }

  /**
   * Get food color based on type
   */
  public getColor(config: GameConfig): string {
    return this.type === FoodType.REGULAR ? config.foodColor : config.specialFoodColor;
  }

  /**
   * Get food size multiplier for rendering
   */
  public getSizeMultiplier(): number {
    return this.type === FoodType.SPECIAL ? 1.2 : 1.0;
  }
}
