# Troubleshooting Groq AI Connection

## Check API Key Setup

### 1. Verify .env file exists
```bash
cd backend
ls -la .env
```

### 2. Check API key value
```bash
cd backend
grep GROQ_API_KEY .env
```

**Expected format:**
```
GROQ_API_KEY=gsk_your_actual_key_here
```

**Common issues:**
- ❌ `GROQ_API_KEY=your_groq_api_key_here` (placeholder, not real key)
- ❌ `GROQ_API_KEY=` (empty)
- ❌ Missing quotes if key has special characters

### 3. Verify dotenv is loading
The server logs will show:
```
🔍 [Server] GROQ_API_KEY exists: true
🔍 [Server] GROQ_API_KEY length: XX
```

### 4. Check Groq Service Initialization
Look for these logs on server startup:
```
🔍 [GroqService] Initializing...
✅ [GroqService] Groq AI service initialized successfully
```

If you see:
```
⚠️  [GroqService] GROQ_API_KEY not set or is placeholder
```
Then your API key is not set correctly.

## Testing Connection

### Test API Status
```bash
curl http://localhost:5000/api/ai/status
```

**Expected response if working:**
```json
{
  "available": true,
  "message": "AI service is ready"
}
```

**If not working:**
```json
{
  "available": false,
  "message": "AI service is not available. Please check your API key."
}
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "stream": false}'
```

## Common Issues

### Issue 1: API Key Not Set
**Symptoms:**
- `available: false` in status endpoint
- Error: "Groq AI service is not available"

**Solution:**
1. Get API key from https://console.groq.com/
2. Add to `.env` file:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
3. Restart the server

### Issue 2: API Key is Placeholder
**Symptoms:**
- Same as Issue 1
- Logs show: "API Key is placeholder: true"

**Solution:**
Replace `your_groq_api_key_here` with your actual API key

### Issue 3: Server Not Restarted
**Symptoms:**
- API key updated but still not working

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
```

### Issue 4: Wrong Package
**Symptoms:**
- Module not found errors

**Solution:**
```bash
cd backend
npm install groq-sdk
```

## Debug Logs

The service now includes detailed logging:
- `🔍` = Debug/Info logs
- `✅` = Success logs
- `⚠️` = Warning logs
- `❌` = Error logs

Check server console for these logs to diagnose issues.

## Getting Your Groq API Key

1. Visit https://console.groq.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`)
6. Add to `.env` file:
   ```
   GROQ_API_KEY=gsk_your_copied_key_here
   ```
7. Restart the server

