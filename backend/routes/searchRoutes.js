const express = require('express');
const router = express.Router();
const searchController = require('../controllers/SearchController');

/**
 * Search Routes
 * /api/search
 */
router.get('/', searchController.search.bind(searchController));
router.post('/ai', searchController.aiSearch.bind(searchController));
router.get('/suggestions', searchController.getSuggestions.bind(searchController));
router.get('/filters', searchController.getFilterOptions.bind(searchController));

module.exports = router;

