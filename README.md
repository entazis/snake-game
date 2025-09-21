# Snake Game

A modern, production-ready Snake game built with TypeScript, HTML5 Canvas, and clean architecture principles.

## Features

- 🎮 **Classic Snake Gameplay** - Eat food, grow longer, avoid collisions
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 📱 **Mobile Support** - Touch controls and responsive layout
- 🏆 **Score System** - High score tracking with local storage
- ⚙️ **Configurable** - Multiple difficulty levels and customization options
- 🧪 **Well Tested** - Comprehensive test suite with 90%+ coverage
- 🚀 **Performance Optimized** - 60 FPS smooth gameplay
- ♿ **Accessible** - Keyboard navigation and screen reader support

## Technology Stack

- **TypeScript** - Type-safe development
- **HTML5 Canvas** - High-performance rendering
- **Vite** - Fast build tool and dev server
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality and formatting

## Architecture

The game follows clean architecture principles with clear separation of concerns:

```text
src/
├── core/                 # Core business logic
│   ├── entities/        # Game entities (Snake, Food, GameBoard)
│   ├── services/        # Business services (GameEngine, ScoreManager)
│   └── interfaces/      # Type definitions and contracts
├── ui/                  # User interface layer
│   ├── input/          # Input handling (keyboard, touch)
│   └── renderer/       # Canvas rendering
├── utils/              # Utility functions and helpers
├── config/             # Configuration and settings
└── main.ts            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd snake-game
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Game Controls

### Desktop

- **Arrow Keys** - Move snake
- **Spacebar** - Pause/Resume
- **Enter** - Start new game
- **Escape** - Return to menu

### Mobile

- **Swipe** - Move snake in swipe direction
- **Tap** - Pause/Resume
- **On-screen buttons** - Directional controls

## Game Features

### Difficulty Levels

- **Easy** - Slower speed, larger grid, more special food
- **Normal** - Balanced gameplay
- **Hard** - Faster speed, smaller grid, less special food
- **Expert** - Very fast speed, minimal grid

### Food Types

- **Regular Food** (Red) - 10 points, +1 length
- **Special Food** (Orange Star) - 25 points, +2 length

### Scoring System

- Points for eating food
- High score persistence
- Game statistics tracking
- Time tracking

## Development

### Project Structure

The project follows a modular architecture with clear separation of concerns:

- **Core Layer** - Business logic and domain entities
- **UI Layer** - User interface and rendering
- **Utils Layer** - Shared utilities and helpers
- **Config Layer** - Configuration and settings

### Testing

The project includes comprehensive tests:

- **Unit Tests** - Individual component testing
- **Integration Tests** - Component interaction testing
- **E2E Tests** - End-to-end user flow testing

Run tests with:

```bash
npm run test
npm run test:coverage
```

### Code Quality

The project enforces high code quality standards:

- **TypeScript** - Strict type checking
- **ESLint** - Code linting and best practices
- **Prettier** - Code formatting
- **Jest** - Comprehensive testing

### Performance

The game is optimized for performance:

- **60 FPS** - Smooth gameplay
- **Object Pooling** - Memory efficiency
- **Spatial Hashing** - Efficient collision detection
- **Dirty Rectangle Rendering** - Optimized canvas updates

## Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Hosting

The game can be hosted on any static file server:

- **Vercel** - `vercel --prod`
- **Netlify** - Drag and drop the `dist/` folder
- **GitHub Pages** - Deploy from the `dist/` folder
- **Any CDN** - Upload the `dist/` contents

### Environment Variables

No environment variables are required for basic functionality.

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+
- **Mobile Safari** 14+
- **Chrome Mobile** 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Maintain code coverage above 90%
- Use meaningful commit messages
- Follow the existing code style

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Classic Snake game inspiration
- Modern web development practices
- Clean architecture principles
- TypeScript community best practices

---

**Enjoy playing Snake!** 🐍🎮
