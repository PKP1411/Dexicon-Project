# Quick Start Guide

## One-Time Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Running the Application

### Terminal 1 - Start Backend Server
```bash
cd backend
npm start
```
Backend will run on: http://localhost:5000

### Terminal 2 - Start Frontend
```bash
cd frontend
npm start
```
Frontend will automatically open at: http://localhost:3000

## Testing the Search

Try these search queries:
- `video encoder` - Find messages about video encoding
- `S3` - Search for S3-related content
- `React` - Find React-related conversations
- `andrewwang` - Search by engineer name
- `multipart` - Find multipart upload discussions
- `PiP` - Picture-in-picture features

## Project Structure

```
backend/
  ├── data/              # JSON data files
  ├── server.js         # Express API server
  └── package.json

frontend/
  ├── public/
  ├── src/
  │   ├── App.js        # Main React component
  │   └── ...
  └── package.json
```

## Troubleshooting

- **Backend won't start**: Make sure port 5000 is not in use
- **Frontend can't connect**: Ensure backend is running first
- **No results**: Check that JSON files are in `backend/data/` directory
- **CORS errors**: Backend has CORS enabled, should work automatically

