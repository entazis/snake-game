# Snake Game - Technical Documentation

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [TypeScript Interfaces](#2-typescript-interfaces)
3. [Core Components](#3-core-components)
4. [Implementation Guide](#4-implementation-guide)
5. [Testing Strategy](#5-testing-strategy)
6. [Build Configuration](#6-build-configuration)
7. [Performance Optimization](#7-performance-optimization)
8. [Error Handling](#8-error-handling)

## 1. System Architecture

### 1.1 Overall Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  UI Components  │  Canvas Renderer  │  Input Handler        │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Game Engine    │  State Manager    │  Score Manager        │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Snake Entity   │  Food Entity     │  Game Board            │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Local Storage  │  Audio Manager   │  Configuration         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **GameEngine** | Main game loop, state transitions, coordination |
| **Snake** | Snake entity, movement logic, growth mechanics |
| **Food** | Food spawning, collision detection with snake |
| **GameBoard** | Grid management, boundary checking |
| **InputHandler** | User input processing, direction changes |
| **Renderer** | Canvas drawing, visual updates |
| **ScoreManager** | Score tracking, high score persistence |
| **StateManager** | Game state transitions, pause/resume |

## 2. TypeScript Interfaces

### 2.1 Core Domain Interfaces

```typescript
// Position interface for grid coordinates
interface Position {
  readonly x: number;
  readonly y: number;
}

// Direction enum for snake movement
enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

// Game state enum
enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  SETTINGS = 'SETTINGS'
}

// Snake segment interface
interface SnakeSegment {
  readonly position: Position;
  readonly isHead: boolean;
}

// Food interface
interface Food {
  readonly position: Position;
  readonly type: FoodType;
  readonly points: number;
}

// Food types
enum FoodType {
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL'
}

// Game configuration
interface GameConfig {
  readonly gridSize: number;
  readonly gameSpeed: number;
  readonly initialSnakeLength: number;
  readonly snakeColor: string;
  readonly foodColor: string;
  readonly backgroundColor: string;
}

// Score data
interface ScoreData {
  readonly currentScore: number;
  readonly highScore: number;
  readonly snakeLength: number;
  readonly foodEaten: number;
  readonly gameTime: number;
}
```

### 2.2 Service Interfaces

```typescript
// Game engine interface
interface IGameEngine {
  start(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(): void;
  update(deltaTime: number): void;
  getState(): GameState;
  getScore(): ScoreData;
}

// Input handler interface
interface IInputHandler {
  onDirectionChange(callback: (direction: Direction) => void): void;
  onPauseToggle(callback: () => void): void;
  onGameStart(callback: () => void): void;
  destroy(): void;
}

// Renderer interface
interface IRenderer {
  render(gameData: GameRenderData): void;
  clear(): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

// Score manager interface
interface IScoreManager {
  addPoints(points: number): void;
  getCurrentScore(): number;
  getHighScore(): number;
  saveHighScore(): void;
  resetScore(): void;
}

// Storage interface
interface IStorage {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
```

### 2.3 Event System

```typescript
// Game events
interface GameEvents {
  'game:start': { config: GameConfig };
  'game:pause': { timestamp: number };
  'game:resume': { timestamp: number };
  'game:over': { score: ScoreData };
  'snake:move': { position: Position };
  'snake:grow': { newLength: number };
  'food:eaten': { food: Food; score: number };
  'score:update': { score: ScoreData };
}

// Event emitter interface
interface IEventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
}
```

## 3. Core Components

### 3.1 Game Engine

```typescript
class GameEngine implements IGameEngine {
  private readonly config: GameConfig;
  private readonly snake: Snake;
  private readonly food: Food;
  private readonly gameBoard: GameBoard;
  private readonly scoreManager: IScoreManager;
  private readonly eventEmitter: IEventEmitter<GameEvents>;
  
  private gameState: GameState = GameState.MENU;
  private lastUpdateTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(
    config: GameConfig,
    scoreManager: IScoreManager,
    eventEmitter: IEventEmitter<GameEvents>
  ) {
    this.config = config;
    this.scoreManager = scoreManager;
    this.eventEmitter = eventEmitter;
    this.snake = new Snake(config);
    this.food = new Food(config);
    this.gameBoard = new GameBoard(config.gridSize);
  }

  start(): void {
    if (this.gameState !== GameState.MENU) return;
    
    this.reset();
    this.gameState = GameState.PLAYING;
    this.lastUpdateTime = performance.now();
    this.gameLoop();
    
    this.eventEmitter.emit('game:start', { config: this.config });
  }

  private gameLoop(): void {
    if (this.gameState !== GameState.PLAYING) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    
    if (deltaTime >= this.config.gameSpeed) {
      this.update(deltaTime);
      this.lastUpdateTime = currentTime;
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime: number): void {
    this.snake.move();
    this.checkCollisions();
    this.checkFoodConsumption();
    this.eventEmitter.emit('snake:move', { position: this.snake.getHeadPosition() });
  }

  private checkCollisions(): void {
    const headPosition = this.snake.getHeadPosition();
    
    if (this.gameBoard.isOutOfBounds(headPosition) || 
        this.snake.hasSelfCollision()) {
      this.gameOver();
    }
  }

  private checkFoodConsumption(): void {
    if (this.snake.getHeadPosition().equals(this.food.getPosition())) {
      this.snake.grow();
      this.scoreManager.addPoints(this.food.getPoints());
      this.food.respawn(this.gameBoard.getEmptyPositions());
      
      this.eventEmitter.emit('food:eaten', { 
        food: this.food, 
        score: this.scoreManager.getCurrentScore() 
      });
    }
  }

  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    this.scoreManager.saveHighScore();
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.eventEmitter.emit('game:over', { score: this.scoreManager.getScore() });
  }
}
```

### 3.2 Snake Entity

```typescript
class Snake {
  private readonly config: GameConfig;
  private segments: SnakeSegment[] = [];
  private direction: Direction = Direction.RIGHT;
  private nextDirection: Direction = Direction.RIGHT;

  constructor(config: GameConfig) {
    this.config = config;
    this.initializeSnake();
  }

  private initializeSnake(): void {
    const centerX = Math.floor(this.config.gridSize / 2);
    const centerY = Math.floor(this.config.gridSize / 2);
    
    for (let i = 0; i < this.config.initialSnakeLength; i++) {
      this.segments.push({
        position: { x: centerX - i, y: centerY },
        isHead: i === 0
      });
    }
  }

  move(): void {
    this.direction = this.nextDirection;
    const head = this.segments[0];
    const newHeadPosition = this.calculateNewHeadPosition(head.position);
    
    // Add new head
    this.segments.unshift({
      position: newHeadPosition,
      isHead: true
    });
    
    // Remove tail
    this.segments.pop();
    
    // Update head flag
    if (this.segments.length > 1) {
      this.segments[1] = { ...this.segments[1], isHead: false };
    }
  }

  private calculateNewHeadPosition(currentPosition: Position): Position {
    switch (this.direction) {
      case Direction.UP:
        return { x: currentPosition.x, y: currentPosition.y - 1 };
      case Direction.DOWN:
        return { x: currentPosition.x, y: currentPosition.y + 1 };
      case Direction.LEFT:
        return { x: currentPosition.x - 1, y: currentPosition.y };
      case Direction.RIGHT:
        return { x: currentPosition.x + 1, y: currentPosition.y };
    }
  }

  changeDirection(newDirection: Direction): void {
    // Prevent reversing into itself
    if (this.isOppositeDirection(newDirection)) return;
    this.nextDirection = newDirection;
  }

  private isOppositeDirection(direction: Direction): boolean {
    const opposites = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };
    return opposites[this.direction] === direction;
  }

  grow(): void {
    const tail = this.segments[this.segments.length - 1];
    this.segments.push({
      position: { ...tail.position },
      isHead: false
    });
  }

  hasSelfCollision(): boolean {
    const head = this.segments[0];
    return this.segments.slice(1).some(segment => 
      segment.position.equals(head.position)
    );
  }

  getHeadPosition(): Position {
    return this.segments[0].position;
  }

  getSegments(): readonly SnakeSegment[] {
    return [...this.segments];
  }

  getLength(): number {
    return this.segments.length;
  }
}
```

### 3.3 Input Handler

```typescript
class InputHandler implements IInputHandler {
  private readonly directionCallbacks: ((direction: Direction) => void)[] = [];
  private readonly pauseCallbacks: (() => void)[] = [];
  private readonly gameStartCallbacks: (() => void)[] = [];
  
  private isDestroyed = false;

  constructor() {
    this.bindKeyboardEvents();
    this.bindTouchEvents();
  }

  private bindKeyboardEvents(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private bindTouchEvents(): void {
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    });

    document.addEventListener('touchend', (e) => {
      if (e.touches.length > 0) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        this.emitDirection(deltaX > 0 ? Direction.RIGHT : Direction.LEFT);
      } else {
        // Vertical swipe
        this.emitDirection(deltaY > 0 ? Direction.DOWN : Direction.UP);
      }
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.isDestroyed) return;

    switch (event.code) {
      case 'ArrowUp':
        event.preventDefault();
        this.emitDirection(Direction.UP);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.emitDirection(Direction.DOWN);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.emitDirection(Direction.LEFT);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.emitDirection(Direction.RIGHT);
        break;
      case 'Space':
        event.preventDefault();
        this.emitPause();
        break;
      case 'Enter':
        event.preventDefault();
        this.emitGameStart();
        break;
    }
  }

  private emitDirection(direction: Direction): void {
    this.directionCallbacks.forEach(callback => callback(direction));
  }

  private emitPause(): void {
    this.pauseCallbacks.forEach(callback => callback());
  }

  private emitGameStart(): void {
    this.gameStartCallbacks.forEach(callback => callback());
  }

  onDirectionChange(callback: (direction: Direction) => void): void {
    this.directionCallbacks.push(callback);
  }

  onPauseToggle(callback: () => void): void {
    this.pauseCallbacks.push(callback);
  }

  onGameStart(callback: () => void): void {
    this.gameStartCallbacks.push(callback);
  }

  destroy(): void {
    this.isDestroyed = true;
    this.directionCallbacks.length = 0;
    this.pauseCallbacks.length = 0;
    this.gameStartCallbacks.length = 0;
  }
}
```

## 4. Implementation Guide

### 4.1 Project Structure

```text
src/
├── core/
│   ├── entities/
│   │   ├── snake.ts
│   │   ├── food.ts
│   │   └── game-board.ts
│   ├── services/
│   │   ├── game-engine.ts
│   │   ├── score-manager.ts
│   │   └── storage.ts
│   └── interfaces/
│       ├── game.types.ts
│       └── events.types.ts
├── ui/
│   ├── components/
│   │   ├── game-canvas.ts
│   │   ├── score-display.ts
│   │   └── game-menu.ts
│   ├── renderer/
│   │   └── canvas-renderer.ts
│   └── input/
│       └── input-handler.ts
├── utils/
│   ├── event-emitter.ts
│   ├── math.ts
│   └── validation.ts
├── config/
│   └── game-config.ts
└── main.ts
```

### 4.2 Main Application Entry Point

```typescript
// main.ts
import { GameEngine } from './core/services/game-engine';
import { ScoreManager } from './core/services/score-manager';
import { InputHandler } from './ui/input/input-handler';
import { CanvasRenderer } from './ui/renderer/canvas-renderer';
import { EventEmitter } from './utils/event-emitter';
import { gameConfig } from './config/game-config';

class SnakeGame {
  private readonly gameEngine: GameEngine;
  private readonly inputHandler: InputHandler;
  private readonly renderer: CanvasRenderer;
  private readonly eventEmitter: EventEmitter<GameEvents>;

  constructor() {
    this.eventEmitter = new EventEmitter<GameEvents>();
    this.gameEngine = new GameEngine(
      gameConfig,
      new ScoreManager(),
      this.eventEmitter
    );
    this.inputHandler = new InputHandler();
    this.renderer = new CanvasRenderer('gameCanvas');
    
    this.setupEventListeners();
    this.initializeUI();
  }

  private setupEventListeners(): void {
    // Input events
    this.inputHandler.onDirectionChange((direction) => {
      this.gameEngine.changeDirection(direction);
    });

    this.inputHandler.onPauseToggle(() => {
      this.gameEngine.togglePause();
    });

    // Game events
    this.eventEmitter.on('game:start', () => {
      this.renderer.startRendering();
    });

    this.eventEmitter.on('game:over', ({ score }) => {
      this.renderer.showGameOver(score);
    });

    this.eventEmitter.on('snake:move', () => {
      this.renderer.render(this.gameEngine.getRenderData());
    });
  }

  private initializeUI(): void {
    this.renderer.initialize();
    this.renderer.showMainMenu();
  }

  public start(): void {
    this.gameEngine.start();
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new SnakeGame();
  game.start();
});
```

### 4.3 Canvas Renderer

```typescript
class CanvasRenderer implements IRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly config: GameConfig;
  private animationId: number | null = null;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.config = gameConfig;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    const cellSize = 20;
    const padding = 2;
    this.canvas.width = this.config.gridSize * (cellSize + padding);
    this.canvas.height = this.config.gridSize * (cellSize + padding);
  }

  render(gameData: GameRenderData): void {
    this.clear();
    this.drawGrid();
    this.drawSnake(gameData.snake);
    this.drawFood(gameData.food);
    this.drawScore(gameData.score);
  }

  private drawSnake(snake: SnakeSegment[]): void {
    snake.forEach((segment, index) => {
      this.ctx.fillStyle = segment.isHead ? '#4CAF50' : '#8BC34A';
      this.drawCell(segment.position, segment.isHead);
    });
  }

  private drawFood(food: Food): void {
    this.ctx.fillStyle = food.type === FoodType.REGULAR ? '#F44336' : '#FF9800';
    this.drawCell(food.position, false, true);
  }

  private drawCell(position: Position, isHead: boolean, isFood: boolean = false): void {
    const cellSize = 20;
    const padding = 2;
    const x = position.x * (cellSize + padding);
    const y = position.y * (cellSize + padding);

    if (isFood) {
      // Draw circular food
      this.ctx.beginPath();
      this.ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/2 - 2, 0, 2 * Math.PI);
      this.ctx.fill();
    } else {
      // Draw rectangular snake segment
      this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      
      if (isHead) {
        // Draw eyes on snake head
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 5, y + 5, 3, 3);
        this.ctx.fillRect(x + 12, y + 5, 3, 3);
        this.ctx.fillStyle = '#4CAF50';
      }
    }
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    const cellSize = 20;
    const padding = 2;
    
    for (let i = 0; i <= this.config.gridSize; i++) {
      const pos = i * (cellSize + padding);
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, this.canvas.height);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(this.canvas.width, pos);
      this.ctx.stroke();
    }
  }

  private drawScore(score: ScoreData): void {
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Score: ${score.currentScore}`, 10, 25);
    this.ctx.fillText(`High: ${score.highScore}`, 10, 45);
  }

  clear(): void {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
```

## 5. Testing Strategy

### 5.1 Unit Tests

```typescript
// snake.test.ts
import { Snake } from '../core/entities/snake';
import { Direction } from '../core/interfaces/game.types';

describe('Snake', () => {
  let snake: Snake;
  const config = {
    gridSize: 10,
    gameSpeed: 100,
    initialSnakeLength: 3,
    snakeColor: '#4CAF50',
    foodColor: '#F44336',
    backgroundColor: '#000'
  };

  beforeEach(() => {
    snake = new Snake(config);
  });

  describe('movement', () => {
    it('should move in the correct direction', () => {
      const initialHead = snake.getHeadPosition();
      snake.changeDirection(Direction.DOWN);
      snake.move();
      
      const newHead = snake.getHeadPosition();
      expect(newHead.y).toBe(initialHead.y + 1);
      expect(newHead.x).toBe(initialHead.x);
    });

    it('should not reverse into itself', () => {
      snake.changeDirection(Direction.LEFT);
      snake.changeDirection(Direction.RIGHT); // Should be ignored
      snake.move();
      
      const head = snake.getHeadPosition();
      expect(head.x).toBeLessThan(5); // Should move left, not right
    });
  });

  describe('growth', () => {
    it('should grow when food is consumed', () => {
      const initialLength = snake.getLength();
      snake.grow();
      expect(snake.getLength()).toBe(initialLength + 1);
    });
  });

  describe('collision detection', () => {
    it('should detect self collision', () => {
      // Create a scenario where snake collides with itself
      snake.changeDirection(Direction.UP);
      snake.move();
      snake.changeDirection(Direction.RIGHT);
      snake.move();
      snake.changeDirection(Direction.DOWN);
      snake.move();
      snake.changeDirection(Direction.LEFT);
      snake.move();
      
      expect(snake.hasSelfCollision()).toBe(true);
    });
  });
});
```

### 5.2 Integration Tests

```typescript
// game-engine.integration.test.ts
import { GameEngine } from '../core/services/game-engine';
import { ScoreManager } from '../core/services/score-manager';
import { EventEmitter } from '../utils/event-emitter';

describe('GameEngine Integration', () => {
  let gameEngine: GameEngine;
  let scoreManager: ScoreManager;
  let eventEmitter: EventEmitter<GameEvents>;

  beforeEach(() => {
    scoreManager = new ScoreManager();
    eventEmitter = new EventEmitter<GameEvents>();
    gameEngine = new GameEngine(config, scoreManager, eventEmitter);
  });

  it('should complete a full game cycle', (done) => {
    let gameOverCalled = false;
    
    eventEmitter.on('game:over', () => {
      gameOverCalled = true;
      expect(scoreManager.getCurrentScore()).toBeGreaterThan(0);
      done();
    });

    gameEngine.start();
    
    // Simulate game over by forcing collision
    setTimeout(() => {
      // Force game over condition
      gameEngine.forceGameOver();
    }, 100);
  });

  it('should handle pause and resume correctly', () => {
    gameEngine.start();
    expect(gameEngine.getState()).toBe(GameState.PLAYING);
    
    gameEngine.pause();
    expect(gameEngine.getState()).toBe(GameState.PAUSED);
    
    gameEngine.resume();
    expect(gameEngine.getState()).toBe(GameState.PLAYING);
  });
});
```

### 5.3 E2E Tests

```typescript
// game.e2e.test.ts
import { JSDOM } from 'jsdom';

describe('Snake Game E2E', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <canvas id="gameCanvas"></canvas>
          <div id="score">Score: 0</div>
        </body>
      </html>
    `);
    document = dom.window.document;
  });

  it('should start game and respond to keyboard input', async () => {
    // Initialize game
    const game = new SnakeGame();
    
    // Simulate keyboard input
    const keyEvent = new dom.window.KeyboardEvent('keydown', {
      code: 'ArrowRight'
    });
    document.dispatchEvent(keyEvent);
    
    // Verify game state changes
    expect(game.getState()).toBe(GameState.PLAYING);
  });
});
```

## 6. Build Configuration

### 6.1 Package.json

```json
{
  "name": "snake-game",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write src/**/*.ts"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.1.0",
    "vite": "^4.4.0"
  }
}
```

### 6.2 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['typescript']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### 6.3 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/core/*": ["core/*"],
      "@/ui/*": ["ui/*"],
      "@/utils/*": ["utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## 7. Performance Optimization

### 7.1 Memory Management

```typescript
// Object pooling for frequently created objects
class PositionPool {
  private static pool: Position[] = [];
  private static maxSize = 1000;

  static get(x: number, y: number): Position {
    if (this.pool.length > 0) {
      const pos = this.pool.pop()!;
      pos.x = x;
      pos.y = y;
      return pos;
    }
    return { x, y };
  }

  static release(position: Position): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(position);
    }
  }
}

// Efficient collision detection
class SpatialHash {
  private readonly cellSize: number;
  private readonly grid: Map<string, Position[]> = new Map();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private getKey(position: Position): string {
    const x = Math.floor(position.x / this.cellSize);
    const y = Math.floor(position.y / this.cellSize);
    return `${x},${y}`;
  }

  add(position: Position): void {
    const key = this.getKey(position);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(position);
  }

  getNearby(position: Position): Position[] {
    const key = this.getKey(position);
    return this.grid.get(key) || [];
  }
}
```

### 7.2 Rendering Optimization

```typescript
// Dirty rectangle rendering
class OptimizedRenderer {
  private dirtyRegions: Set<string> = new Set();
  private lastFrame: Map<string, any> = new Map();

  markDirty(position: Position): void {
    const key = `${position.x},${position.y}`;
    this.dirtyRegions.add(key);
  }

  render(gameData: GameRenderData): void {
    // Only render changed regions
    for (const region of this.dirtyRegions) {
      this.renderRegion(region, gameData);
    }
    this.dirtyRegions.clear();
  }

  private renderRegion(region: string, gameData: GameRenderData): void {
    // Render only the specific region that changed
  }
}
```

## 8. Error Handling

### 8.1 Error Types

```typescript
enum GameErrorType {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  RENDER_ERROR = 'RENDER_ERROR',
  INPUT_ERROR = 'INPUT_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

class GameError extends Error {
  constructor(
    public readonly type: GameErrorType,
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'GameError';
  }
}
```

### 8.2 Error Handling Strategy

```typescript
class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: ((error: GameError) => void)[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: GameError): void {
    console.error('Game Error:', error);
    
    // Notify error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });

    // Attempt recovery based on error type
    this.attemptRecovery(error);
  }

  private attemptRecovery(error: GameError): void {
    switch (error.type) {
      case GameErrorType.RENDER_ERROR:
        // Try to reinitialize renderer
        break;
      case GameErrorType.STORAGE_ERROR:
        // Fall back to in-memory storage
        break;
      default:
        // Log and continue
        break;
    }
  }

  onError(callback: (error: GameError) => void): void {
    this.errorCallbacks.push(callback);
  }
}
```

---

*This technical documentation provides a comprehensive guide for implementing the Snake game with modern TypeScript practices, clean architecture, and robust error handling.*
