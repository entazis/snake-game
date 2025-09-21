/**
 * Food entity tests
 */

import { FoodType } from '../../interfaces/game.types';
import { Food } from '../food';
import { Position } from '../position';

describe('Food', () => {
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

  describe('regular food', () => {
    let food: Food;

    beforeEach(() => {
      food = new Food(config, new Position(5, 5), FoodType.REGULAR);
    });

    it('should have correct position', () => {
      expect(food.getPosition().x).toBe(5);
      expect(food.getPosition().y).toBe(5);
    });

    it('should have correct type', () => {
      expect(food.getType()).toBe(FoodType.REGULAR);
    });

    it('should have correct points', () => {
      expect(food.getPoints()).toBe(10);
    });

    it('should detect position correctly', () => {
      expect(food.isAtPosition(new Position(5, 5))).toBe(true);
      expect(food.isAtPosition(new Position(4, 5))).toBe(false);
    });

    it('should respawn to new position', () => {
      const newPositions = [new Position(1, 1), new Position(2, 2)];
      food.respawn(newPositions);

      const position = food.getPosition();
      expect(newPositions.some((pos) => pos.equals(position))).toBe(true);
    });
  });

  describe('special food', () => {
    let food: Food;

    beforeEach(() => {
      food = new Food(config, new Position(3, 3), FoodType.SPECIAL);
    });

    it('should have correct type', () => {
      expect(food.getType()).toBe(FoodType.SPECIAL);
    });

    it('should have correct points', () => {
      expect(food.getPoints()).toBe(25);
    });

    it('should have correct color', () => {
      expect(food.getColor(config)).toBe('#FF9800');
    });

    it('should have size multiplier', () => {
      expect(food.getSizeMultiplier()).toBe(1.2);
    });
  });

  describe('random food creation', () => {
    it('should create random food with correct type', () => {
      const position = new Position(1, 1);
      const food = Food.createRandomFood(config, position);

      expect(food.getPosition().equals(position)).toBe(true);
      expect([FoodType.REGULAR, FoodType.SPECIAL]).toContain(food.getType());
    });
  });

  describe('error handling', () => {
    it('should throw error when respawning with no positions', () => {
      const food = new Food(config, new Position(5, 5));

      expect(() => {
        food.respawn([]);
      }).toThrow('No available positions for food spawn');
    });
  });
});
