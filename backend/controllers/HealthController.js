const dataService = require('../services/DataService');

/**
 * Health Controller
 * Handles health check and system status
 */
class HealthController {
  /**
   * Health check endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async healthCheck(req, res) {
    try {
      const sessions = dataService.getAllSessions();
      const messages = dataService.getAllMessages();

      res.json({
        status: 'ok',
        sessions: sessions.length,
        messages: messages.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ 
        status: 'error',
        error: error.message 
      });
    }
  }
}

module.exports = new HealthController();

