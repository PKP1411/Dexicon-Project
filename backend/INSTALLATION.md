# Installation & Setup Guide

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `cors` - CORS middleware
- `groq-sdk` - Groq AI SDK
- `dotenv` - Environment variable management
- `nodemon` - Development auto-reload (dev dependency)

## Step 2: Set Up Environment Variables

1. **Create `.env` file:**
```bash
cp .env.example .env
```

2. **Edit `.env` and add your Groq API key:**
```env
GROQ_API_KEY=your_actual_groq_api_key_here
PORT=5000
NODE_ENV=development
```

3. **Get your Groq API key:**
   - Visit https://console.groq.com/
   - Sign up or log in
   - Go to API Keys section
   - Create a new key
   - Copy and paste into `.env`

## Step 3: Start the Server

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

The server will start on `http://localhost:5000`

## Step 4: Verify Installation

### Check Health:
```bash
curl http://localhost:5000/api/health
```

### Check AI Status:
```bash
curl http://localhost:5000/api/ai/status
```

You should see:
```json
{
  "available": true,
  "message": "AI service is ready"
}
```

### Test AI Chat:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?", "stream": false}'
```

## Troubleshooting

### "Groq AI service is not available"
- Check that `.env` file exists
- Verify `GROQ_API_KEY` is set correctly
- Make sure you restarted the server after adding the key

### "Module not found: groq-sdk"
- Run `npm install` again
- Check `package.json` has `groq-sdk` in dependencies

### Port already in use
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000

## Project Structure

```
backend/
├── .env                    # Your API keys (not in git)
├── .env.example           # Template for .env
├── config/                # Configuration files
├── controllers/           # Request handlers
│   ├── AIController.js   # AI chat controller
│   ├── SearchController.js
│   └── SessionController.js
├── models/                # Data models
├── routes/                # API routes
│   ├── aiRoutes.js       # AI endpoints
│   ├── searchRoutes.js
│   └── sessionRoutes.js
├── services/              # Business logic
│   ├── GroqService.js    # Groq AI service
│   └── DataService.js
└── server.js             # Main entry point
```

## Next Steps

- See `AI_INTEGRATION.md` for API usage examples
- See `ENV_SETUP.md` for detailed environment setup
- See `README.md` for general project documentation

