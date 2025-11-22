const chatHistoryService = require('../services/ChatHistoryService');

/**
 * Chat History Controller
 * Handles chat history operations
 */
class ChatHistoryController {
  /**
   * Save a chat message
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async saveMessage(req, res) {
    try {
      const { message, sessionId = 'default' } = req.body;

      if (!message || !message.id || !message.text) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Message object with id and text is required'
        });
      }

      const success = chatHistoryService.saveMessage(message, sessionId);

      if (success) {
        res.json({
          success: true,
          message: 'Message saved successfully'
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to save message'
        });
      }
    } catch (error) {
      console.error('Save message error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Save entire chat history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async saveHistory(req, res) {
    try {
      const { messages, sessionId = 'default' } = req.body;

      if (!Array.isArray(messages)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Messages must be an array'
        });
      }

      const success = chatHistoryService.saveHistory(messages, sessionId);

      if (success) {
        res.json({
          success: true,
          message: 'Chat history saved successfully',
          count: messages.length
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to save chat history'
        });
      }
    } catch (error) {
      console.error('Save history error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Load chat history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async loadHistory(req, res) {
    try {
      const { sessionId = 'default' } = req.query;
      const history = chatHistoryService.loadHistory(sessionId);

      res.json({
        success: true,
        messages: history,
        count: history.length,
        sessionId
      });
    } catch (error) {
      console.error('Load history error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Clear chat history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async clearHistory(req, res) {
    try {
      const { sessionId = 'default' } = req.body;
      const success = chatHistoryService.clearHistory(sessionId);

      if (success) {
        res.json({
          success: true,
          message: 'Chat history cleared successfully'
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to clear chat history'
        });
      }
    } catch (error) {
      console.error('Clear history error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Get all chat sessions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllSessions(req, res) {
    try {
      const sessions = chatHistoryService.getAllSessions();
      res.json({
        success: true,
        sessions,
        count: sessions.length
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}

module.exports = new ChatHistoryController();

