/**
 * Score manager for tracking game statistics
 */

import { ScoreData } from '../interfaces/game.types';
import { IScoreManager } from '../interfaces/services.types';
import { Storage } from './storage';

export class ScoreManager implements IScoreManager {
  private currentScore: number = 0;
  private highScore: number = 0;
  private snakeLength: number = 3;
  private foodEaten: number = 0;
  private gameTime: number = 0;
  private gameStartTime: number = 0;
  private readonly storage: Storage;

  private static readonly HIGH_SCORE_KEY = 'high-score';
  private static readonly STATS_KEY = 'game-stats';

  constructor(storage: Storage = new Storage()) {
    this.storage = storage;
    this.loadHighScore();
  }

  /**
   * Add points to current score
   */
  public addPoints(points: number): void {
    this.currentScore += points;
    this.updateHighScore();
  }

  /**
   * Get current score
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Get high score
   */
  public getHighScore(): number {
    return this.highScore;
  }

  /**
   * Get complete score data
   */
  public getScore(): ScoreData {
    return {
      currentScore: this.currentScore,
      highScore: this.highScore,
      snakeLength: this.snakeLength,
      foodEaten: this.foodEaten,
      gameTime: this.gameTime,
    };
  }

  /**
   * Save high score to storage
   */
  public saveHighScore(): void {
    this.storage.set(ScoreManager.HIGH_SCORE_KEY, this.highScore);
    this.saveGameStats();
  }

  /**
   * Reset current score
   */
  public resetScore(): void {
    this.currentScore = 0;
    this.snakeLength = 3;
    this.foodEaten = 0;
    this.gameTime = 0;
    this.gameStartTime = 0;
  }

  /**
   * Increment food eaten counter
   */
  public incrementFoodEaten(): void {
    this.foodEaten++;
  }

  /**
   * Update game time
   */
  public updateGameTime(time: number): void {
    this.gameTime = time;
  }

  /**
   * Start game timer
   */
  public startGameTimer(): void {
    this.gameStartTime = performance.now();
  }

  /**
   * Update game timer
   */
  public updateTimer(): void {
    if (this.gameStartTime > 0) {
      this.gameTime = Math.floor((performance.now() - this.gameStartTime) / 1000);
    }
  }

  /**
   * Update snake length
   */
  public updateSnakeLength(length: number): void {
    this.snakeLength = length;
  }

  /**
   * Load high score from storage
   */
  private loadHighScore(): void {
    const savedHighScore = this.storage.get<number>(ScoreManager.HIGH_SCORE_KEY);
    if (savedHighScore !== null && savedHighScore > this.highScore) {
      this.highScore = savedHighScore;
    }
  }

  /**
   * Update high score if current score is higher
   */
  private updateHighScore(): void {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
    }
  }

  /**
   * Save game statistics
   */
  private saveGameStats(): void {
    const stats = {
      highScore: this.highScore,
      lastPlayed: new Date().toISOString(),
      totalGames: this.getTotalGames() + 1,
    };
    this.storage.set(ScoreManager.STATS_KEY, stats);
  }

  /**
   * Get total games played
   */
  private getTotalGames(): number {
    const stats = this.storage.get<{ totalGames: number }>(ScoreManager.STATS_KEY);
    return stats?.totalGames || 0;
  }

  /**
   * Get game statistics
   */
  public getGameStats(): { totalGames: number; lastPlayed: string } {
    const stats = this.storage.get<{ totalGames: number; lastPlayed: string }>(
      ScoreManager.STATS_KEY
    );
    return stats || { totalGames: 0, lastPlayed: '' };
  }
}
