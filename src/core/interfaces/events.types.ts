/**
 * Event system types and interfaces
 */

import { Food, GameConfig, Position, ScoreData } from './game.types';

// Game events
export interface GameEvents {
  'game:start': { config: GameConfig };
  'game:pause': { timestamp: number };
  'game:resume': { timestamp: number };
  'game:over': { score: ScoreData };
  'game:reset': { timestamp: number };
  'snake:move': { position: Position };
  'snake:grow': { newLength: number };
  'snake:direction-change': { direction: string };
  'food:eaten': { food: Food; score: number };
  'food:spawn': { food: Food };
  'score:update': { score: ScoreData };
  'settings:change': { settings: any };
}

// Event emitter interface
export interface IEventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
  removeAllListeners(): void;
}
