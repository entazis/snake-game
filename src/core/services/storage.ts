/**
 * Local storage service for persisting game data
 */

import { IStorage } from '../interfaces/services.types';

export class Storage implements IStorage {
  private readonly prefix: string;

  constructor(prefix: string = 'snake-game-') {
    this.prefix = prefix;
  }

  /**
   * Get value from storage
   */
  public get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set value in storage
   */
  public set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  }

  /**
   * Remove value from storage
   */
  public remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  }

  /**
   * Clear all storage items with prefix
   */
  public clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }

  /**
   * Check if storage is available
   */
  public isAvailable(): boolean {
    try {
      const testKey = this.prefix + 'test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all keys with prefix
   */
  public getKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter((key) => key.startsWith(this.prefix))
        .map((key) => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Error getting storage keys', error);
      return [];
    }
  }
}
