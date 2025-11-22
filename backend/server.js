// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dataService = require('./services/DataService');

// Import routes
const searchRoutes = require('./routes/searchRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const healthRoutes = require('./routes/healthRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatHistoryRoutes = require('./routes/chatHistoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware (optional, for development)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize data on startup
dataService.loadData();

// API Routes
app.use('/api/search', searchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat-history', chatHistoryRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Dexicon AI Search API',
    version: '1.0.0',
    endpoints: {
      search: 'GET /api/search?q=<query>',
      aiSearch: 'POST /api/search/ai',
      sessions: 'GET /api/sessions',
      sessionById: 'GET /api/sessions/:id',
      health: 'GET /api/health',
      aiChat: 'POST /api/ai/chat',
      aiStatus: 'GET /api/ai/status',
      chatHistory: {
        saveMessage: 'POST /api/chat-history/message',
        saveHistory: 'POST /api/chat-history/history',
        loadHistory: 'GET /api/chat-history/history?sessionId=<id>',
        clearHistory: 'DELETE /api/chat-history/history',
        getAllSessions: 'GET /api/chat-history/sessions'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/`);
});
