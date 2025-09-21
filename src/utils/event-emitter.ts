/**
 * Event emitter implementation for game events
 */

import { IEventEmitter } from '../core/interfaces/events.types';

export class EventEmitter<T extends Record<string, any>> implements IEventEmitter<T> {
  private listeners: Map<keyof T, Array<(data: T[keyof T]) => void>> = new Map();

  /**
   * Add event listener
   */
  public on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as (data: T[keyof T]) => void);
  }

  /**
   * Remove event listener
   */
  public off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback as (data: T[keyof T]) => void);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  public emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data as T[keyof T]);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners
   */
  public removeAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get listener count for event
   */
  public getListenerCount<K extends keyof T>(event: K): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.length : 0;
  }

  /**
   * Check if event has listeners
   */
  public hasListeners<K extends keyof T>(event: K): boolean {
    return this.getListenerCount(event) > 0;
  }
}
