const fs = require('fs');
const path = require('path');
const Message = require('../models/Message');
const Session = require('../models/Session');

/**
 * Data Service
 * Handles loading and managing session data
 */
class DataService {
  constructor() {
    this.sessions = [];
    this.messages = [];
    this.dataDir = path.join(__dirname, '../data');
    this.files = ['andrewwang.json', 'dianalu.json', 'daniellin.json'];
  }

  /**
   * Load all data files
   */
  loadData() {
    this.sessions = [];
    this.messages = [];

    this.files.forEach(file => {
      const filePath = path.join(this.dataDir, file);
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(fileContent);
          this._processDataFile(data);
        } catch (error) {
          console.error(`Error loading ${file}:`, error.message);
        }
      } else {
        console.warn(`File not found: ${file}`);
      }
    });

    console.log(`Loaded ${this.sessions.length} sessions and ${this.messages.length} messages`);
  }

  /**
   * Process a single data file
   * @param {Object} data - Parsed JSON data
   * @private
   */
  _processDataFile(data) {
    // Process sessions
    if (data.sessions) {
      data.sessions.forEach(sessionData => {
        const session = new Session({
          ...sessionData,
          engineer: data.engineer,
          project: data.projects.find(p => p.id === sessionData.projectId)
        });
        this.sessions.push(session);
      });
    }

    // Process messages
    if (data.messages) {
      data.messages.forEach(messageData => {
        const session = data.sessions.find(s => s.id === messageData.sessionId);
        const message = new Message({
          ...messageData,
          engineer: data.engineer,
          session: session,
          project: data.projects.find(p => p.id === session?.projectId)
        });
        this.messages.push(message);
      });
    }
  }

  /**
   * Get all sessions
   * @returns {Array<Session>}
   */
  getAllSessions() {
    return this.sessions;
  }

  /**
   * Get all messages
   * @returns {Array<Message>}
   */
  getAllMessages() {
    return this.messages;
  }

  /**
   * Search messages by query
   * @param {string} query - Search query
   * @returns {Array<Message>}
   */
  searchMessages(query) {
    if (!query) {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();
    return this.messages
      .filter(message => message.matchesQuery(lowerQuery))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get session by ID
   * @param {string} sessionId
   * @returns {Session|null}
   */
  getSessionById(sessionId) {
    return this.sessions.find(s => s.id === sessionId) || null;
  }

  /**
   * Get messages by session ID
   * @param {string} sessionId
   * @returns {Array<Message>}
   */
  getMessagesBySessionId(sessionId) {
    return this.messages
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }

  /**
   * Get available filter options
   * @returns {Object}
   */
  getFilterOptions() {
    const users = new Set();
    const projects = new Set();
    const workingDirectories = new Set();
    const dates = new Set();

    this.messages.forEach(message => {
      // Collect users
      if (message.engineer?.username) {
        users.add(message.engineer.username);
      }

      // Collect projects
      if (message.project?.name) {
        projects.add(message.project.name);
      }

      // Collect working directories
      if (message.project?.workingDirectory) {
        workingDirectories.add(message.project.workingDirectory);
      }

      // Collect dates (from message timestamp)
      if (message.timestamp) {
        const date = new Date(message.timestamp).toISOString().split('T')[0];
        dates.add(date);
      }
    });

    return {
      users: Array.from(users).sort(),
      projects: Array.from(projects).sort(),
      workingDirectories: Array.from(workingDirectories).sort(),
      dates: Array.from(dates).sort()
    };
  }

  /**
   * Search messages with filters
   * @param {string} query - Search query
   * @param {Object} filters - Filter options
   * @returns {Array<Message>}
   */
  searchMessagesWithFilters(query, filters = {}) {
    let results = this.messages;

    // Apply text query filter
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      results = results.filter(message => message.matchesQuery(lowerQuery));
    }

    // Apply user filter
    if (filters.users && filters.users.length > 0) {
      results = results.filter(message => 
        filters.users.includes(message.engineer?.username)
      );
    }

    // Apply project name filter
    if (filters.projectNames && filters.projectNames.length > 0) {
      results = results.filter(message => 
        filters.projectNames.includes(message.project?.name)
      );
    }

    // Apply working directory filter
    if (filters.workingDirectories && filters.workingDirectories.length > 0) {
      results = results.filter(message => 
        filters.workingDirectories.includes(message.project?.workingDirectory)
      );
    }

    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      results = results.filter(message => {
        if (!message.timestamp) return false;
        const messageDate = new Date(message.timestamp);
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (messageDate < fromDate) return false;
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (messageDate > toDate) return false;
        }
        
        return true;
      });
    }

    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get user-specific data summary
   * @param {string} username - Username to search for
   * @param {Object} dateFilter - Optional date filter {before, after, from, to}
   * @returns {Object}
   */
  getUserData(username, dateFilter = null) {
    let userMessages = this.messages.filter(m => 
      m.engineer?.username?.toLowerCase() === username.toLowerCase()
    );

    // Apply date filters if provided
    if (dateFilter) {
      userMessages = userMessages.filter(message => {
        if (!message.timestamp) return false;
        const messageDate = new Date(message.timestamp);
        
        if (dateFilter.before) {
          const beforeDate = new Date(dateFilter.before);
          beforeDate.setHours(23, 59, 59, 999);
          if (messageDate > beforeDate) return false;
        }
        
        if (dateFilter.after) {
          const afterDate = new Date(dateFilter.after);
          afterDate.setHours(0, 0, 0, 0);
          if (messageDate < afterDate) return false;
        }
        
        if (dateFilter.from) {
          const fromDate = new Date(dateFilter.from);
          fromDate.setHours(0, 0, 0, 0);
          if (messageDate < fromDate) return false;
        }
        
        if (dateFilter.to) {
          const toDate = new Date(dateFilter.to);
          toDate.setHours(23, 59, 59, 999);
          if (messageDate > toDate) return false;
        }
        
        return true;
      });
    }

    if (userMessages.length === 0) {
      return null;
    }

    const projects = new Map();
    const directories = new Set();
    const dates = new Set();
    const sessions = new Set();

    userMessages.forEach(message => {
      // Collect projects
      if (message.project?.name) {
        if (!projects.has(message.project.name)) {
          projects.set(message.project.name, {
            name: message.project.name,
            workingDirectory: message.project?.workingDirectory,
            primaryLanguage: message.project?.metadata?.primaryLanguage,
            framework: message.project?.metadata?.framework,
            messageCount: 0,
            firstDate: message.timestamp,
            lastDate: message.timestamp
          });
        }
        const project = projects.get(message.project.name);
        project.messageCount++;
        if (new Date(message.timestamp) < new Date(project.firstDate)) {
          project.firstDate = message.timestamp;
        }
        if (new Date(message.timestamp) > new Date(project.lastDate)) {
          project.lastDate = message.timestamp;
        }
      }

      // Collect directories
      if (message.project?.workingDirectory) {
        directories.add(message.project.workingDirectory);
      }

      // Collect dates
      if (message.timestamp) {
        const date = new Date(message.timestamp).toISOString().split('T')[0];
        dates.add(date);
      }

      // Collect sessions
      if (message.sessionId) {
        sessions.add(message.sessionId);
      }
    });

    const engineer = userMessages[0]?.engineer;

    return {
      username: engineer?.username,
      email: engineer?.email,
      role: engineer?.role,
      totalMessages: userMessages.length,
      totalProjects: projects.size,
      totalDirectories: directories.size,
      totalSessions: sessions.size,
      projects: Array.from(projects.values()),
      directories: Array.from(directories).sort(),
      dateRange: {
        earliest: dates.size > 0 ? Array.from(dates).sort()[0] : null,
        latest: dates.size > 0 ? Array.from(dates).sort().reverse()[0] : null,
        totalDays: dates.size
      }
    };
  }

  /**
   * Get project-specific data summary
   * @param {string} projectName - Project name to search for
   * @returns {Object}
   */
  getProjectData(projectName) {
    const projectMessages = this.messages.filter(m => 
      m.project?.name?.toLowerCase() === projectName.toLowerCase()
    );

    if (projectMessages.length === 0) {
      return null;
    }

    const users = new Set();
    const directories = new Set();
    const dates = new Set();

    projectMessages.forEach(message => {
      if (message.engineer?.username) {
        users.add(message.engineer.username);
      }
      if (message.project?.workingDirectory) {
        directories.add(message.project.workingDirectory);
      }
      if (message.timestamp) {
        const date = new Date(message.timestamp).toISOString().split('T')[0];
        dates.add(date);
      }
    });

    const project = projectMessages[0]?.project;

    return {
      name: project?.name,
      workingDirectory: project?.workingDirectory,
      primaryLanguage: project?.metadata?.primaryLanguage,
      framework: project?.metadata?.framework,
      totalMessages: projectMessages.length,
      users: Array.from(users).sort(),
      directories: Array.from(directories).sort(),
      dateRange: {
        earliest: dates.size > 0 ? Array.from(dates).sort()[0] : null,
        latest: dates.size > 0 ? Array.from(dates).sort().reverse()[0] : null
      }
    };
  }

  /**
   * Get statistics summary
   * @returns {Object}
   */
  getStatistics() {
    const filterOptions = this.getFilterOptions();
    
    return {
      totalUsers: filterOptions.users.length,
      totalProjects: filterOptions.projects.length,
      totalDirectories: filterOptions.workingDirectories.length,
      totalMessages: this.messages.length,
      totalSessions: this.sessions.length,
      users: filterOptions.users,
      projects: filterOptions.projects,
      directories: filterOptions.workingDirectories
    };
  }
}

// Singleton instance
const dataService = new DataService();

module.exports = dataService;

