# Groq AI Integration Guide

## Overview

The backend now includes Groq AI integration for chat functionality. This allows users to interact with an AI assistant through the API.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Groq API key to `.env`
   - See `ENV_SETUP.md` for detailed instructions

## API Endpoints

### 1. Chat with AI (Non-streaming)
**POST** `/api/ai/chat`

**Request Body:**
```json
{
  "message": "What is React?",
  "stream": false,
  "model": "openai/gpt-oss-20b",
  "temperature": 1,
  "max_completion_tokens": 8192
}
```

**Response:**
```json
{
  "success": true,
  "message": "What is React?",
  "response": "React is a JavaScript library...",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### 2. Chat with AI (Streaming)
**POST** `/api/ai/chat`

**Request Body:**
```json
{
  "message": "Explain JavaScript closures",
  "stream": true
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"content":"JavaScript"}
data: {"content":" closures"}
data: {"content":" are..."}
data: [DONE]
```

### 3. Check AI Service Status
**GET** `/api/ai/status`

**Response:**
```json
{
  "available": true,
  "message": "AI service is ready"
}
```

## Usage Examples

### Using cURL (Non-streaming)
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Node.js?",
    "stream": false
  }'
```

### Using cURL (Streaming)
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain async/await",
    "stream": true
  }'
```

### Using JavaScript/Fetch
```javascript
// Non-streaming
const response = await fetch('http://localhost:5000/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What is Express.js?',
    stream: false
  })
});

const data = await response.json();
console.log(data.response);

// Streaming
const response = await fetch('http://localhost:5000/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Explain REST APIs',
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      const json = JSON.parse(data);
      process.stdout.write(json.content);
    }
  }
}
```

## Configuration Options

When making a chat request, you can customize:

- `message` (required): The user's message
- `stream` (optional): Whether to stream the response (default: false)
- `model` (optional): Model to use (default: "openai/gpt-oss-20b")
- `temperature` (optional): Creativity level 0-2 (default: 1)
- `max_completion_tokens` (optional): Max tokens in response (default: 8192)
- `top_p` (optional): Nucleus sampling (default: 1)
- `reasoning_effort` (optional): "low", "medium", or "high" (default: "medium")
- `stop` (optional): Stop sequences (default: null)

## Error Handling

If the API key is not set or invalid:
```json
{
  "error": "Internal server error",
  "message": "Groq AI service is not available. Please check your API key."
}
```

## Architecture

- **Service Layer**: `services/GroqService.js` - Handles Groq API communication
- **Controller Layer**: `controllers/AIController.js` - Handles HTTP requests/responses
- **Route Layer**: `routes/aiRoutes.js` - Defines API endpoints

## Security

- API key is stored in `.env` file (not committed to git)
- Environment variables are loaded using `dotenv`
- Never expose your API key in client-side code

