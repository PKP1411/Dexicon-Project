# AI Chat Feature

## Overview

When AI Search is enabled, the interface transforms into a chatbot where users can have conversations with the AI assistant.

## Features

### 1. Chat Interface
- **Chat Mode**: When AI toggle is ON, shows chatbot interface
- **Search Mode**: When AI toggle is OFF, shows traditional search
- **Welcome Screen**: Shows helpful message when chat is empty
- **Auto-scroll**: Automatically scrolls to latest message

### 2. Chat History Tracking
- **JSON Format**: All messages stored in JSON format
- **Fields Tracked**:
  - `id`: Unique message identifier
  - `type`: Message type (user, assistant, error)
  - `text`: Message content
  - `timestamp`: ISO timestamp
  - `role`: User role (user/assistant)
- **Storage**: 
  - Frontend: localStorage (for quick access)
  - Backend: JSON files in `backend/data/chat_history/`

### 3. Message Flow
1. User types message → Click Send
2. User message appears immediately
3. AI processes request (shows typing indicator)
4. AI response appears
5. Both messages saved to backend JSON file

## Backend API

### Chat History Endpoints

- `POST /api/chat-history/message` - Save single message
- `POST /api/chat-history/history` - Save entire chat history
- `GET /api/chat-history/history?sessionId=<id>` - Load chat history
- `DELETE /api/chat-history/history` - Clear chat history
- `GET /api/chat-history/sessions` - Get all chat sessions

### Example JSON Format

```json
[
  {
    "id": "msg_1234567890_abc123",
    "type": "user",
    "text": "What did Andrew work on?",
    "timestamp": "2025-01-01T12:00:00.000Z",
    "role": "user"
  },
  {
    "id": "msg_1234567891_def456",
    "type": "assistant",
    "text": "Andrew worked on video encoding optimization...",
    "timestamp": "2025-01-01T12:00:05.000Z",
    "role": "assistant"
  }
]
```

## File Structure

```
backend/
├── data/
│   └── chat_history/
│       └── default.json          # Chat history JSON file
├── services/
│   └── ChatHistoryService.js     # Chat history management
├── controllers/
│   └── ChatHistoryController.js  # Chat history API
└── routes/
    └── chatHistoryRoutes.js      # Chat history routes
```

## Usage

1. **Enable AI Search**: Click the toggle button in top-right
2. **Type Message**: Enter your question in the chat input at bottom
3. **Send**: Click Send or press Enter
4. **View History**: Chat history persists across sessions
5. **Clear Chat**: Click "Clear Chat" button to reset

## Current Implementation

- ✅ Chat interface when AI enabled
- ✅ Message tracking with all required fields
- ✅ JSON storage on backend
- ✅ Auto-scroll to latest message
- ✅ Typing indicator while AI responds
- ✅ Error handling
- ✅ Chat history persistence

## Future Enhancements

- Multiple chat sessions
- Export chat history
- Search within chat history
- Message editing/deletion
- Rich text formatting
- File attachments

