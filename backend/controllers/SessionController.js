const dataService = require('../services/DataService');

/**
 * Session Controller
 * Handles session-related operations
 */
class SessionController {
  /**
   * Get all sessions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllSessions(req, res) {
    try {
      const sessions = dataService.getAllSessions();
      const sessionsData = sessions.map(session => session.toJSON());

      res.json({
        sessions: sessionsData,
        total: sessionsData.length
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  /**
   * Get session by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSessionById(req, res) {
    try {
      const { id } = req.params;
      const session = dataService.getSessionById(id);

      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found' 
        });
      }

      // Get messages for this session
      const messages = dataService.getMessagesBySessionId(id);
      const messagesData = messages.map(message => message.toJSON());

      res.json({
        session: session.toJSON(),
        messages: messagesData,
        messageCount: messagesData.length
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
}

module.exports = new SessionController();

