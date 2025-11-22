const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/SessionController');

/**
 * Session Routes
 * /api/sessions
 */
router.get('/', sessionController.getAllSessions.bind(sessionController));
router.get('/:id', sessionController.getSessionById.bind(sessionController));

module.exports = router;

