# AI Search Toggle Feature

## Overview

The application now includes a toggle button to switch between **Simple Keyword Search** and **AI-Powered Search** modes.

## Features

### 1. Toggle Button
- Located in the top-right corner of the header
- Visual indicator showing current state (ON/OFF)
- Persists preference in localStorage
- Clears results when toggled

### 2. Search Modes

#### Simple Keyword Search (Default)
- Uses traditional keyword matching
- Fast and reliable
- Searches across message content, engineer names, projects
- Endpoint: `GET /api/search?q=<query>`

#### AI-Powered Search (When Enabled)
- Uses AI for semantic understanding
- Better context understanding
- Endpoint: `POST /api/search/ai`
- **Note**: Currently returns keyword search results as placeholder. Full AI implementation coming soon.

### 3. State Management
- Toggle state saved in `localStorage` as `aiSearchEnabled`
- Persists across page refreshes
- Default: `false` (Simple Search)

## Frontend Implementation

### Toggle Button Component
```jsx
<button
  className={`ai-toggle-button ${aiSearchEnabled ? 'enabled' : 'disabled'}`}
  onClick={toggleAiSearch}
>
  <span className="toggle-icon">🤖</span>
  <span className="toggle-text">
    {aiSearchEnabled ? 'AI Search ON' : 'AI Search OFF'}
  </span>
</button>
```

### Search Handler
```javascript
if (aiSearchEnabled) {
  // AI-powered search
  response = await fetch(`${API_BASE_URL}/search/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: query.trim() }),
  });
} else {
  // Simple keyword search
  response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
}
```

## Backend Implementation

### AI Search Endpoint
**POST** `/api/search/ai`

**Request Body:**
```json
{
  "query": "your search query"
}
```

**Response:**
```json
{
  "results": [...],
  "total": 10,
  "query": "your search query",
  "searchMode": "ai",
  "note": "AI search implementation coming soon"
}
```

### Current Status
- ✅ Toggle button implemented
- ✅ State tracking (localStorage)
- ✅ Conditional search routing
- ✅ Backend endpoint created
- ⏳ AI semantic search (to be implemented)

## Next Steps

When implementing full AI search:

1. **Update `SearchController.aiSearch()`** to:
   - Use Groq AI to understand query intent
   - Generate semantic search query
   - Search with AI-enhanced understanding
   - Return more relevant results

2. **Example AI Search Flow:**
   ```javascript
   // 1. Send query to Groq for understanding
   const aiQuery = await groqService.sendMessage(
     `Understand this search query and suggest better keywords: "${query}"`
   );
   
   // 2. Use AI-enhanced query for search
   const results = dataService.searchMessages(aiQuery);
   
   // 3. Rank results using AI relevance
   const rankedResults = await rankWithAI(results, query);
   ```

## User Experience

- **Visual Feedback**: Button changes color when enabled (green glow)
- **Search Mode Badge**: Shows current mode in results
- **Smooth Transition**: Results clear when toggling
- **Persistent Preference**: Remembers user's choice

## Testing

### Test Simple Search
1. Ensure toggle is OFF
2. Search for "video encoder"
3. Verify keyword matching results

### Test AI Search
1. Toggle AI Search ON
2. Search for "video encoder"
3. Verify API call goes to `/api/search/ai`
4. Check response includes `searchMode: "ai"`

### Test Persistence
1. Toggle AI Search ON
2. Refresh page
3. Verify toggle remains ON

