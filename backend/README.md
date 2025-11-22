# Backend Architecture

## Project Structure

```
backend/
├── config/
│   └── app.js              # Application configuration
├── controllers/
│   ├── HealthController.js # Health check endpoints
│   ├── SearchController.js # Search operations
│   └── SessionController.js # Session operations
├── data/
│   ├── andrewwang.json     # Andrew's session data
│   ├── dianalu.json        # Diana's session data
│   └── daniellin.json      # Daniel's session data
├── models/
│   ├── Message.js          # Message model
│   └── Session.js          # Session model
├── routes/
│   ├── healthRoutes.js     # Health check routes
│   ├── searchRoutes.js     # Search routes
│   └── sessionRoutes.js    # Session routes
├── services/
│   └── DataService.js      # Data loading and management
├── server.js               # Express app entry point
└── package.json
```

## Architecture Overview

This backend follows the **MVC (Model-View-Controller)** pattern with a service layer:

### Models (`models/`)
- **Message.js**: Represents a message from AI coding sessions
  - Contains message data and metadata
  - Has `matchesQuery()` method for search
  - Has `toJSON()` method for API responses

- **Session.js**: Represents an AI coding session
  - Contains session data and metadata
  - Has `toJSON()` method for API responses

### Controllers (`controllers/`)
- **SearchController.js**: Handles search operations
  - `search()`: Main search endpoint
  - `getSuggestions()`: Search suggestions (future enhancement)

- **SessionController.js**: Handles session operations
  - `getAllSessions()`: Get all sessions
  - `getSessionById()`: Get session with messages

- **HealthController.js**: System health and status
  - `healthCheck()`: Returns system status

### Services (`services/`)
- **DataService.js**: Singleton service for data management
  - `loadData()`: Loads all JSON files
  - `getAllSessions()`: Get all sessions
  - `getAllMessages()`: Get all messages
  - `searchMessages()`: Search messages by query
  - `getSessionById()`: Get session by ID
  - `getMessagesBySessionId()`: Get messages for a session

### Routes (`routes/`)
- **searchRoutes.js**: `/api/search`
  - `GET /` - Search messages
  - `GET /suggestions` - Get search suggestions

- **sessionRoutes.js**: `/api/sessions`
  - `GET /` - Get all sessions
  - `GET /:id` - Get session by ID with messages

- **healthRoutes.js**: `/api/health`
  - `GET /` - Health check

### Configuration (`config/`)
- **app.js**: Application configuration
  - Port, environment, CORS settings
  - Data file list

## API Endpoints

### Search
- `GET /api/search?q=<query>` - Search messages
- `GET /api/search/suggestions?q=<query>` - Get search suggestions

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID with messages

### Health
- `GET /api/health` - Health check

### Root
- `GET /` - API documentation

## Data Flow

1. **Startup**: `server.js` → `DataService.loadData()` → Loads all JSON files
2. **Request**: Route → Controller → Service → Model
3. **Response**: Model → Controller → JSON response

## Adding New Features

### Add a new endpoint:
1. Create method in appropriate Controller
2. Add route in appropriate Routes file
3. Import route in `server.js`

### Add a new model:
1. Create model class in `models/`
2. Add methods as needed
3. Use in services/controllers

### Add a new service:
1. Create service class in `services/`
2. Export singleton instance
3. Use in controllers

## Best Practices

- **Controllers**: Handle HTTP requests/responses, call services
- **Services**: Business logic, data operations
- **Models**: Data structure, validation, transformations
- **Routes**: Route definitions only, delegate to controllers

## Error Handling

- Controllers use try-catch blocks
- Global error handler in `server.js`
- 404 handler for unknown routes
- Error responses follow consistent format

