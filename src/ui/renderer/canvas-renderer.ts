/**
 * Canvas renderer for drawing game elements
 */

import { FoodType, GameRenderData, GameState, ScoreData } from '../../core/interfaces/game.types';
import { IRenderer } from '../../core/interfaces/services.types';

export class CanvasRenderer implements IRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly padding: number = 2;
  private readonly gridSize: number;
  private cellSize: number = 20; // Will be calculated dynamically
  private animationId: number | null = null;
  private isRendering = false;

  constructor(canvasId: string, gridSize: number = 20) {
    this.gridSize = gridSize;

    const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvasElement) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }

    this.canvas = canvasElement;
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }

    this.ctx = context;
    this.setupCanvas();
  }

  /**
   * Setup canvas properties
   */
  private setupCanvas(): void {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.textBaseline = 'top';
  }

  /**
   * Initialize renderer
   */
  public initialize(): void {
    // Use the canvas's actual dimensions instead of client dimensions
    this.resize(this.canvas.width, this.canvas.height);
  }

  /**
   * Start rendering loop
   */
  public startRendering(): void {
    this.isRendering = true;
  }

  /**
   * Stop rendering loop
   */
  public stopRendering(): void {
    this.isRendering = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Render game data
   */
  public render(gameData: GameRenderData): void {
    if (!this.isRendering) return;

    this.clear();
    this.drawGrid();
    this.drawSnake(gameData.snake);
    this.drawFood(gameData.food);
    this.drawScore(gameData.score);
    this.drawGameState(gameData.gameState);
  }

  /**
   * Clear canvas
   */
  public clear(): void {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Resize canvas
   */
  public resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1;

    // Use the smaller dimension to maintain square aspect ratio
    const actualSize = Math.min(width, height);

    this.canvas.width = actualSize * dpr;
    this.canvas.height = actualSize * dpr;
    this.canvas.style.width = `${actualSize}px`;
    this.canvas.style.height = `${actualSize}px`;
    this.ctx.scale(dpr, dpr);

    // Calculate cell size to fill the entire canvas with minimal padding
    this.cellSize = Math.floor(actualSize / this.gridSize) - this.padding;
  }

  /**
   * Draw grid lines
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;

    // Calculate cell spacing (cell size + padding)
    const cellSpacing = this.cellSize + this.padding;

    // Calculate the total grid size and center it
    const totalGridWidth = this.gridSize * cellSpacing;
    const totalGridHeight = this.gridSize * cellSpacing;
    const offsetX = (this.canvas.width - totalGridWidth) / 2;
    const offsetY = (this.canvas.height - totalGridHeight) / 2;

    // Draw vertical lines
    for (let i = 0; i <= this.gridSize; i++) {
      const x = offsetX + i * cellSpacing;
      this.ctx.beginPath();
      this.ctx.moveTo(x, offsetY);
      this.ctx.lineTo(x, offsetY + totalGridHeight);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = 0; i <= this.gridSize; i++) {
      const y = offsetY + i * cellSpacing;
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, y);
      this.ctx.lineTo(offsetX + totalGridWidth, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw snake
   */
  private drawSnake(snake: readonly any[]): void {
    snake.forEach((segment, index) => {
      if (segment.isHead) {
        this.drawSnakeHead(segment.position);
      } else {
        this.drawSnakeBody(segment.position, index);
      }
    });
  }

  /**
   * Draw snake head
   */
  private drawSnakeHead(position: any): void {
    const { x, y } = this.getCellPosition(position.x, position.y);

    // Head background
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);

    // Head border
    this.ctx.strokeStyle = '#2E7D32';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);

    // Eyes
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(x + 5, y + 5, 3, 3);
    this.ctx.fillRect(x + 12, y + 5, 3, 3);
  }

  /**
   * Draw snake body segment
   */
  private drawSnakeBody(position: any, index: number): void {
    const { x, y } = this.getCellPosition(position.x, position.y);

    // Body color with gradient
    const alpha = Math.max(0.6, 1 - index * 0.1);
    this.ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
    this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
  }

  /**
   * Draw food
   */
  private drawFood(food: any): void {
    const { x, y } = this.getCellPosition(food.position.x, food.position.y);
    const centerX = x + this.cellSize / 2;
    const centerY = y + this.cellSize / 2;
    const radius = this.cellSize / 2 - 2;

    if (food.type === FoodType.REGULAR) {
      // Regular food - red circle
      this.ctx.fillStyle = '#F44336';
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      this.ctx.fill();

      // Highlight
      this.ctx.fillStyle = '#FFCDD2';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 2, centerY - 2, radius * 0.3, 0, 2 * Math.PI);
      this.ctx.fill();
    } else {
      // Special food - orange star
      this.ctx.fillStyle = '#FF9800';
      this.drawStar(centerX, centerY, radius);
    }
  }

  /**
   * Get the pixel position for a grid cell, accounting for centering
   */
  private getCellPosition(gridX: number, gridY: number): { x: number; y: number } {
    const cellSpacing = this.cellSize + this.padding;
    const totalGridWidth = this.gridSize * cellSpacing;
    const totalGridHeight = this.gridSize * cellSpacing;
    const offsetX = (this.canvas.width - totalGridWidth) / 2;
    const offsetY = (this.canvas.height - totalGridHeight) / 2;

    const x = offsetX + gridX * cellSpacing + this.padding;
    const y = offsetY + gridY * cellSpacing + this.padding;

    return { x, y };
  }

  /**
   * Draw star shape
   */
  private drawStar(centerX: number, centerY: number, radius: number): void {
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.5;

    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw score and game info
   */
  private drawScore(score: ScoreData): void {
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText(`Score: ${score.currentScore}`, 10, 30);
    this.ctx.fillText(`High: ${score.highScore}`, 10, 50);
    this.ctx.fillText(`Length: ${score.snakeLength}`, 10, 70);
    this.ctx.fillText(`Time: ${score.gameTime}s`, 10, 90);
  }

  /**
   * Draw game state overlay
   */
  private drawGameState(gameState: GameState): void {
    if (gameState === GameState.PAUSED) {
      this.drawPauseOverlay();
    } else if (gameState === GameState.GAME_OVER) {
      this.drawGameOverOverlay();
    }
  }

  /**
   * Draw pause overlay
   */
  private drawPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 20);

    this.ctx.font = '16px Arial';
    this.ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 20);

    this.ctx.textAlign = 'left';
  }

  /**
   * Draw game over overlay
   */
  private drawGameOverOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#F44336';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '18px Arial';
    this.ctx.fillText('Press ENTER to restart', this.canvas.width / 2, this.canvas.height / 2 + 20);

    this.ctx.textAlign = 'left';
  }

  /**
   * Show main menu
   */
  public showMainMenu(): void {
    this.clear();
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SNAKE GAME', this.canvas.width / 2, this.canvas.height / 2 - 60);

    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press ENTER to start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Use arrow keys to move', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('Press SPACE to pause', this.canvas.width / 2, this.canvas.height / 2 + 40);

    this.ctx.textAlign = 'left';
  }

  /**
   * Show game over screen
   */
  public showGameOver(score: ScoreData): void {
    this.drawGameOverOverlay();

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `Final Score: ${score.currentScore}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 60
    );

    if (score.currentScore === score.highScore) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 + 90);
    }

    this.ctx.textAlign = 'left';
  }

  /**
   * Show pause screen
   */
  public showPause(): void {
    this.drawPauseOverlay();
  }

  /**
   * Destroy renderer
   */
  public destroy(): void {
    this.stopRendering();
  }
}
