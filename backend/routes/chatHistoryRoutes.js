const express = require('express');
const router = express.Router();
const chatHistoryController = require('../controllers/ChatHistoryController');

/**
 * Chat History Routes
 * /api/chat-history
 */
router.post('/message', chatHistoryController.saveMessage.bind(chatHistoryController));
router.post('/history', chatHistoryController.saveHistory.bind(chatHistoryController));
router.get('/history', chatHistoryController.loadHistory.bind(chatHistoryController));
router.delete('/history', chatHistoryController.clearHistory.bind(chatHistoryController));
router.get('/sessions', chatHistoryController.getAllSessions.bind(chatHistoryController));

module.exports = router;

