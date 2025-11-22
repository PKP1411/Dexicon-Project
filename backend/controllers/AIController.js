const groqService = require('../services/GroqService');
const dataService = require('../services/DataService');
const fs = require('fs');
const path = require('path');

/**
 * AI Controller
 * Handles AI chat operations
 */
class AIController {
  constructor() {
    this.systemPrompt = this.loadSystemPrompt();
  }

  /**
   * Load system prompt from file
   * @returns {string}
   */
  loadSystemPrompt() {
    try {
      const promptPath = path.join(__dirname, '../prompts/ai-assistant-prompt.txt');
      if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, 'utf8');
      }
      return 'You are a helpful AI assistant that helps engineers search through their coding assistant history.';
    } catch (error) {
      console.error('Error loading system prompt:', error);
      return 'You are a helpful AI assistant that helps engineers search through their coding assistant history.';
    }
  }

  /**
   * Extract date from message
   * @param {string} message - User message
   * @returns {Object|null}
   */
  extractDate(message) {
    // Match dates in various formats: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY, etc.
    const datePatterns = [
      /\b(\d{4}-\d{2}-\d{2})\b/,  // YYYY-MM-DD
      /\b(\d{2}\/\d{2}\/\d{4})\b/, // MM/DD/YYYY
      /\b(\d{2}-\d{2}-\d{4})\b/,  // DD-MM-YYYY
      /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/, // M/D/YYYY
    ];

    const dates = [];
    for (const pattern of datePatterns) {
      const matches = message.matchAll(new RegExp(pattern.source, 'g'));
      for (const match of matches) {
        let dateStr = match[1];
        // Normalize date format
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Convert MM/DD/YYYY to YYYY-MM-DD
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            dateStr = `${year}-${month}-${day}`;
          }
        } else if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
          // Convert DD-MM-YYYY to YYYY-MM-DD
          const parts = dateStr.split('-');
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        dates.push(dateStr);
      }
    }

    return dates.length > 0 ? dates : null;
  }

  /**
   * Extract search intent from user message
   * @param {string} message - User message
   * @returns {Object}
   */
  extractSearchIntent(message) {
    const lowerMessage = message.toLowerCase();
    const filterOptions = dataService.getFilterOptions();
    
    // Extract dates from message
    const dates = this.extractDate(message);
    
    // Check for date-based queries
    const hasDateQuery = lowerMessage.match(/(?:date|between|before|after|from|to|since|until)/);
    const hasBetween = lowerMessage.match(/(?:between|from.*?to|from.*?until)/);
    const hasBefore = lowerMessage.match(/\b(?:before|until|up to|prior to)\b/);
    const hasAfter = lowerMessage.match(/\b(?:after|since|from|starting)\b/);
    
    // Check for user search with date filters
    for (const username of filterOptions.users) {
      const usernameLower = username.toLowerCase();
      const words = lowerMessage.split(/\s+/);
      const hasSearchKeywords = lowerMessage.match(/(?:search|find|show|give|tell|about|for|user|engineer|work|worked|did|does|result)/);
      
      if (lowerMessage.includes(usernameLower)) {
        if (hasSearchKeywords || words.includes(usernameLower) || 
            lowerMessage.match(new RegExp(`\\b${usernameLower}\\b`))) {
          
          // Check if there are date filters
          if (hasDateQuery && dates) {
            let dateFilter = {};
            
            if (hasBetween && dates.length >= 2) {
              dateFilter.from = dates[0];
              dateFilter.to = dates[1];
            } else if (hasBefore && dates.length >= 1) {
              dateFilter.before = dates[0];
            } else if (hasAfter && dates.length >= 1) {
              dateFilter.after = dates[0];
            } else if (dates.length >= 2) {
              // Assume first two dates are range
              dateFilter.from = dates[0];
              dateFilter.to = dates[1];
            } else if (dates.length === 1) {
              // Single date - check context
              if (hasBefore) {
                dateFilter.before = dates[0];
              } else if (hasAfter) {
                dateFilter.after = dates[0];
              }
            }
            
            return { 
              type: 'user', 
              value: username,
              dateFilter: Object.keys(dateFilter).length > 0 ? dateFilter : null
            };
          }
          
          return { type: 'user', value: username };
        }
      }
    }

    // Check for project search
    for (const project of filterOptions.projects) {
      const projectLower = project.toLowerCase();
      if (lowerMessage.includes(projectLower) && 
          (lowerMessage.match(/(?:project|show|find|search|about|for)/) || 
           lowerMessage.split(/\s+/).includes(projectLower))) {
        return { type: 'project', value: project };
      }
    }

    // Check for statistics queries
    if (lowerMessage.match(/(?:how many|count|number of|total|statistics|stats|list all|show all)/)) {
      return { type: 'statistics' };
    }

    // Check for directory queries
    if (lowerMessage.match(/(?:directory|directories|working directory|path|where)/)) {
      return { type: 'directory' };
    }

    // Check for "what did X work on" pattern
    const workOnMatch = lowerMessage.match(/(?:what|which).*?(?:did|does|work|work on).*?(\w+)/);
    if (workOnMatch) {
      const potentialUser = workOnMatch[1];
      if (filterOptions.users.some(u => u.toLowerCase() === potentialUser.toLowerCase())) {
        return { type: 'user', value: potentialUser };
      }
    }

    return { type: 'general' };
  }

  /**
   * Build context data for AI
   * @param {string} userMessage - User's message
   * @returns {string}
   */
  buildContextData(userMessage) {
    const intent = this.extractSearchIntent(userMessage);
    let contextData = '';

    switch (intent.type) {
      case 'user':
        const userData = dataService.getUserData(intent.value, intent.dateFilter || null);
        if (userData) {
          let dateFilterInfo = '';
          if (intent.dateFilter) {
            if (intent.dateFilter.from && intent.dateFilter.to) {
              dateFilterInfo = `\n**Date Filter Applied:** Between ${intent.dateFilter.from} and ${intent.dateFilter.to}`;
            } else if (intent.dateFilter.before) {
              dateFilterInfo = `\n**Date Filter Applied:** Before ${intent.dateFilter.before}`;
            } else if (intent.dateFilter.after) {
              dateFilterInfo = `\n**Date Filter Applied:** After ${intent.dateFilter.after}`;
            }
          }
          
          contextData = `\n\n**Search Results for User: ${userData.username}**${dateFilterInfo}\n` +
            `Email: ${userData.email}\n` +
            `Role: ${userData.role}\n` +
            `Total Messages: ${userData.totalMessages}\n` +
            `Total Projects: ${userData.totalProjects}\n` +
            `Total Directories: ${userData.totalDirectories}\n` +
            `Total Sessions: ${userData.totalSessions}\n\n` +
            `**Projects:**\n${userData.projects.map(p => 
              `- ${p.name} (${p.workingDirectory})\n  Language: ${p.primaryLanguage || 'N/A'}, Framework: ${p.framework || 'N/A'}\n  Messages: ${p.messageCount}, Date Range: ${p.firstDate} to ${p.lastDate}`
            ).join('\n')}\n\n` +
            `**Working Directories:**\n${userData.directories.map(d => `- ${d}`).join('\n')}\n\n` +
            `**Date Range:** ${userData.dateRange.earliest} to ${userData.dateRange.latest} (${userData.dateRange.totalDays} unique days)`;
        } else {
          let noDataMsg = `No data found for user "${intent.value}"`;
          if (intent.dateFilter) {
            noDataMsg += ` with the specified date filter`;
          }
          contextData = `\n\n**Search Results:** ${noDataMsg}. Available users: ${dataService.getFilterOptions().users.join(', ')}`;
        }
        break;

      case 'project':
        const projectData = dataService.getProjectData(intent.value);
        if (projectData) {
          contextData = `\n\n**Search Results for Project: ${projectData.name}**\n` +
            `Working Directory: ${projectData.workingDirectory}\n` +
            `Primary Language: ${projectData.primaryLanguage || 'N/A'}\n` +
            `Framework: ${projectData.framework || 'N/A'}\n` +
            `Total Messages: ${projectData.totalMessages}\n\n` +
            `**Users who worked on this project:**\n${projectData.users.map(u => `- ${u}`).join('\n')}\n\n` +
            `**Directories:**\n${projectData.directories.map(d => `- ${d}`).join('\n')}\n\n` +
            `**Date Range:** ${projectData.dateRange.earliest} to ${projectData.dateRange.latest}`;
        } else {
          contextData = `\n\n**Search Results:** No data found for project "${intent.value}". Available projects: ${dataService.getFilterOptions().projects.join(', ')}`;
        }
        break;

      case 'statistics':
        const stats = dataService.getStatistics();
        contextData = `\n\n**Database Statistics:**\n` +
          `Total Users: ${stats.totalUsers}\n` +
          `Total Projects: ${stats.totalProjects}\n` +
          `Total Directories: ${stats.totalDirectories}\n` +
          `Total Messages: ${stats.totalMessages}\n` +
          `Total Sessions: ${stats.totalSessions}\n\n` +
          `**Users:** ${stats.users.join(', ')}\n` +
          `**Projects:** ${stats.projects.join(', ')}\n` +
          `**Directories:** ${stats.directories.join(', ')}`;
        break;

      default:
        // For general queries, provide available data summary
        const filterOptions = dataService.getFilterOptions();
        contextData = `\n\n**Available Data Summary:**\n` +
          `Users: ${filterOptions.users.join(', ')}\n` +
          `Projects: ${filterOptions.projects.join(', ')}\n` +
          `Directories: ${filterOptions.workingDirectories.join(', ')}\n` +
          `Total Messages: ${dataService.getAllMessages().length}`;
    }

    return contextData;
  }

  /**
   * Send a message to AI and get response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async chat(req, res) {
    try {
      const { message, stream, ...options } = req.body;

      if (!message || message.trim() === '') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Message is required'
        });
      }

      // Build context data based on user query
      const contextData = this.buildContextData(message);
      
      // Build the full prompt with system instructions and context
      const fullPrompt = `${this.systemPrompt}\n\n${contextData}\n\n**User Question:** ${message}\n\nPlease provide a helpful, conversational response based on the data above.`;

      // Check if streaming is requested
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        await groqService.streamMessage(fullPrompt, (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }, options);

        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Non-streaming response
      const response = await groqService.sendMessage(fullPrompt, options);

      res.json({
        success: true,
        message: message,
        response: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Chat error:', error.message);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Check AI service status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async status(req, res) {
    try {
      const isAvailable = groqService.isAvailable();

      res.json({
        available: isAvailable,
        message: isAvailable 
          ? 'AI service is ready' 
          : 'AI service is not available. Please check your API key.'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}

module.exports = new AIController();

