# Dexicon AI Search - Take Home Assessment

A prototype search system for AI coding assistant history that allows engineers to search through their team's Claude Code sessions.

## Project Structure

```
Dexicon-project/
├── backend/
│   ├── data/
│   │   ├── andrewwang.json
│   │   ├── dianalu.json
│   │   └── daniellin.json
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Usage

1. Start both backend and frontend servers (in separate terminals)
2. Open `http://localhost:3000` in your browser
3. Enter a search query in the search box (e.g., "video encoder", "S3", "React", "andrewwang")
4. View results with highlighted matches, engineer info, project details, and timestamps

## API Endpoints

- `GET /api/search?q=<query>` - Search messages, engineers, and projects
- `GET /api/sessions` - Get all sessions
- `GET /api/health` - Health check endpoint

## MVP Features

### What I Built

1. **Keyword Search**: Simple but effective keyword search across all message content, engineer names, project names, and task descriptions
2. **Results Display**: Clean UI showing:
   - Message type and content with highlighted search terms
   - Engineer information (username, email, role)
   - Project context (name, language, framework)
   - Task description from the session
   - Timestamps for chronological ordering
3. **Backend API**: Express server that loads all JSON data files and provides search endpoints
4. **Frontend UI**: React application with search form and results display

### Why These Were MVP Features

- **Keyword search** was chosen over semantic/NLP search because it's fast to implement, works reliably, and is sufficient for an MVP within the 3-hour constraint
- **Basic results display** shows all essential context (who, what, when, which project) needed to understand search results
- **Simple architecture** (Express + React) allows for quick development and easy understanding
- Focus on **end-to-end functionality** rather than advanced features

## Features I Deprioritized

1. **Semantic/Natural Language Search**: Would require embedding models, vector databases, or external APIs. Too complex for MVP timeframe.

2. **Advanced Filtering**: Filters by engineer, project, date range, message type. Nice-to-have but not essential for MVP.

3. **Pagination/Infinite Scroll**: With the current dataset size, showing all results is acceptable. Would be needed for production.

4. **Result Ranking/Relevance Scoring**: Simple keyword matching is sufficient for MVP. Could add TF-IDF or other ranking later.

5. **Session View**: Ability to view full conversation threads. MVP focuses on search results, not full session browsing.

6. **Authentication/User Management**: Not needed for MVP prototype.

7. **Export/Share Features**: Beyond MVP scope.

8. **Advanced UI**: Animations, advanced styling, dark mode. Focused on functional over polished.

## Trade-offs Made

1. **Search Algorithm**: Chose simple string matching over semantic search for speed of implementation. Trade-off: less intelligent matching, but works reliably.

2. **Data Loading**: Load all data into memory on server startup. Trade-off: Not scalable for large datasets, but simple and fast for MVP.

3. **No Database**: Using in-memory data structure. Trade-off: Data resets on server restart, but no setup complexity.

4. **Frontend State**: No state management library (Redux, Zustand). Trade-off: Simpler code, but could get complex with more features.

5. **No Tests**: Focused on working code over test coverage per requirements.

6. **Basic Styling**: Functional CSS, not a design system. Trade-off: Works well but not production-polished.

7. **Error Handling**: Basic error handling. Trade-off: MVP works but could be more robust.

## If I Had 3 More Hours (Prioritized)

1. **Semantic Search Integration** (2 hours)
   - Integrate OpenAI embeddings or similar
   - Store embeddings in a simple vector store
   - Hybrid search (keyword + semantic)
   - Why: Would dramatically improve search quality and relevance

2. **Advanced Filtering & Faceted Search** (1 hour)
   - Filter by engineer, project, date range
   - Faceted search UI (show counts per filter)
   - Why: Users need to narrow down results, especially as data grows

3. **Session Thread View** (30 min)
   - Click result to see full conversation thread
   - Show message relationships (parent/child)
   - Why: Context is crucial for understanding AI conversations

4. **Result Ranking Improvements** (30 min)
   - Score results by relevance (keyword frequency, position)
   - Sort by relevance instead of just timestamp
   - Why: Better user experience finding most relevant results first

5. **Pagination** (30 min)
   - Add pagination for large result sets
   - Why: Performance and UX for large datasets

6. **Better Error Handling & Loading States** (30 min)
   - Proper error messages
   - Skeleton loaders
   - Retry mechanisms
   - Why: Production readiness

## Technical Decisions

- **Express.js**: Simple, well-known, perfect for REST API
- **React**: Standard choice, great ecosystem
- **No build tools complexity**: Used create-react-app for quick setup
- **CORS enabled**: Allows frontend to call backend from different port
- **Case-insensitive search**: Better user experience
- **Highlighting search terms**: Visual feedback for users

## Notes

- The JSON files are stored in `backend/data/` directory
- Backend loads all data on startup - if you add more JSON files, restart the server
- Search is case-insensitive and matches partial words
- Results are sorted by timestamp (most recent first)

## Future Improvements (Beyond MVP)

- Database integration (PostgreSQL/MongoDB) for persistent storage
- Full-text search engine (Elasticsearch, Algolia)
- User authentication and permissions
- Analytics and search insights
- Export functionality
- Real-time updates
- Advanced UI/UX polish
- Mobile responsive improvements
- Performance optimizations (caching, indexing)
