# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
# Groq API Configuration
GROQ_API_KEY=your_actual_groq_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Getting Your Groq API Key

1. Go to https://console.groq.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

## Setup Instructions

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your actual Groq API key:
```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

3. Restart the server:
```bash
npm start
```

## Security Notes

- **Never commit `.env` file to git** - it's already in `.gitignore`
- Keep your API key secret
- Use different keys for development and production
- Rotate keys if they're exposed

## Verification

After setting up, check if AI service is available:
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

