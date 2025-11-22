const fs = require('fs');
const path = require('path');

/**
 * Chat History Service
 * Manages chat history storage in JSON format
 */
class ChatHistoryService {
  constructor() {
    this.historyDir = path.join(__dirname, '../data/chat_history');
    this.ensureHistoryDirectory();
  }

  /**
   * Ensure chat history directory exists
   */
  ensureHistoryDirectory() {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
  }

  /**
   * Get chat history file path for a session
   * @param {string} sessionId - Session identifier (optional, defaults to 'default')
   * @returns {string}
   */
  getHistoryFilePath(sessionId = 'default') {
    return path.join(this.historyDir, `${sessionId}.json`);
  }

  /**
   * Save chat message to history
   * @param {Object} message - Message object with id, type, text, timestamp, role
   * @param {string} sessionId - Session identifier
   */
  saveMessage(message, sessionId = 'default') {
    try {
      const filePath = this.getHistoryFilePath(sessionId);
      let history = [];

      // Load existing history
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        history = JSON.parse(fileContent);
      }

      // Add new message
      history.push({
        id: message.id,
        type: message.type,
        text: message.text,
        timestamp: message.timestamp,
        role: message.role,
        ...message // Include any additional fields
      });

      // Save back to file
      fs.writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return false;
    }
  }

  /**
   * Save entire chat history
   * @param {Array} messages - Array of message objects
   * @param {string} sessionId - Session identifier
   */
  saveHistory(messages, sessionId = 'default') {
    try {
      const filePath = this.getHistoryFilePath(sessionId);
      fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving chat history:', error);
      return false;
    }
  }

  /**
   * Load chat history
   * @param {string} sessionId - Session identifier
   * @returns {Array}
   */
  loadHistory(sessionId = 'default') {
    try {
      const filePath = this.getHistoryFilePath(sessionId);
      if (!fs.existsSync(filePath)) {
        return [];
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  /**
   * Clear chat history
   * @param {string} sessionId - Session identifier
   */
  clearHistory(sessionId = 'default') {
    try {
      const filePath = this.getHistoryFilePath(sessionId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  }

  /**
   * Get all chat sessions
   * @returns {Array}
   */
  getAllSessions() {
    try {
      if (!fs.existsSync(this.historyDir)) {
        return [];
      }

      const files = fs.readdirSync(this.historyDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          sessionId: file.replace('.json', ''),
          filename: file,
          path: path.join(this.historyDir, file)
        }));
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  }
}

// Singleton instance
const chatHistoryService = new ChatHistoryService();

module.exports = chatHistoryService;

