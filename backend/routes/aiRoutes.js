const express = require('express');
const router = express.Router();
const aiController = require('../controllers/AIController');

/**
 * AI Routes
 * /api/ai
 */
router.post('/chat', aiController.chat.bind(aiController));
router.get('/status', aiController.status.bind(aiController));

module.exports = router;

