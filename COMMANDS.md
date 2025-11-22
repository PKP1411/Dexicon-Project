# Commands Reference

## Initial Setup (One Time Only)

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Run in Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: Development Mode with Auto-Reload

**Terminal 1 - Backend (with nodemon):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Build for Production

### Backend
No build step needed - just run `node server.js`

### Frontend
```bash
cd frontend
npm run build
```
This creates an optimized build in the `build/` folder.

## Testing

### Test Backend API Directly
```bash
# Health check
curl http://localhost:5000/api/health

# Search query
curl "http://localhost:5000/api/search?q=video"

# Get all sessions
curl http://localhost:5000/api/sessions
```

## Project Structure Commands

```bash
# View project structure
tree -L 2 -I 'node_modules'

# Or use ls
ls -la
ls -la backend/
ls -la frontend/
ls -la backend/data/
```

## Ports

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

Make sure these ports are available before starting!

