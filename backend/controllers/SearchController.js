const dataService = require('../services/DataService');

/**
 * Search Controller
 * Handles search-related operations
 */
class SearchController {
  /**
   * Search messages
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async search(req, res) {
    try {
      const query = req.query.q?.trim();
      
      // Parse filters from query params
      const filters = {
        users: req.query.users ? req.query.users.split(',').filter(Boolean) : [],
        projectNames: req.query.projectNames ? req.query.projectNames.split(',').filter(Boolean) : [],
        workingDirectories: req.query.workingDirectories ? req.query.workingDirectories.split(',').filter(Boolean) : [],
        dateFrom: req.query.dateFrom || null,
        dateTo: req.query.dateTo || null
      };

      // If no query and no filters, return empty
      if (!query && Object.values(filters).every(f => !f || (Array.isArray(f) && f.length === 0))) {
        return res.json({ 
          results: [], 
          total: 0,
          query: '',
          filters
        });
      }

      const messages = dataService.searchMessagesWithFilters(query || '', filters);
      const results = messages.map(message => message.toJSON());

      res.json({
        results,
        total: results.length,
        query: query || '',
        filters
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  /**
   * Get available filter options
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFilterOptions(req, res) {
    try {
      const options = dataService.getFilterOptions();
      res.json({
        success: true,
        ...options
      });
    } catch (error) {
      console.error('Get filter options error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }

  /**
   * AI-powered search
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async aiSearch(req, res) {
    try {
      const { query } = req.body;

      if (!query || query.trim() === '') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Query is required'
        });
      }

      // TODO: Implement AI-powered search using Groq
      // For now, return simple search results as placeholder
      // This will be enhanced later with actual AI semantic search
      const limit = req.body.limit;
      const messages = dataService.searchMessages(query.trim());
      const allResults = messages.map(message => message.toJSON());
      const results = limit ? allResults.slice(0, limit) : allResults;

      res.json({
        results,
        total: results.length,
        query: query.trim(),
        searchMode: 'ai',
        note: 'AI search implementation coming soon - currently using keyword search'
      });
    } catch (error) {
      console.error('AI Search error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Get search suggestions (top 5 results)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSuggestions(req, res) {
    try {
      const query = req.query.q?.trim();
      const limit = parseInt(req.query.limit) || 5;
      
      if (!query || query.length < 2) {
        return res.json({ results: [] });
      }

      // Get top results matching query
      const messages = dataService.searchMessages(query);
      const results = messages
        .slice(0, limit)
        .map(message => message.toJSON());

      res.json({
        results,
        total: results.length,
        query
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  }
}

module.exports = new SearchController();

