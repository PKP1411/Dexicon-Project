const express = require('express');
const router = express.Router();
const healthController = require('../controllers/HealthController');

/**
 * Health Routes
 * /api/health
 */
router.get('/', healthController.healthCheck.bind(healthController));

module.exports = router;

