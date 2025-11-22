import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';
const AI_SEARCH_ENABLED_KEY = 'aiSearchEnabled';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [aiSearchEnabled, setAiSearchEnabled] = useState(() => {
    // Load from localStorage, default to false
    const saved = localStorage.getItem(AI_SEARCH_ENABLED_KEY);
    return saved === 'true';
  });
  
  // Chat history for AI mode
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Filter states
  const [filterOptions, setFilterOptions] = useState({
    users: [],
    projects: [],
    workingDirectories: [],
    dates: []
  });
  const [activeFilters, setActiveFilters] = useState({
    users: [],
    projectNames: [],
    workingDirectories: [],
    dateFrom: '',
    dateTo: ''
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState({
    users: false,
    projects: false,
    workingDirectories: false,
    date: false
  });

  // Save AI search preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(AI_SEARCH_ENABLED_KEY, aiSearchEnabled.toString());
  }, [aiSearchEnabled]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Debounced search suggestions - only for simple search mode
  useEffect(() => {
    // Don't show suggestions when AI search is enabled
    if (aiSearchEnabled) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      if (!query.trim() || query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        // Simple keyword suggestions
        const response = await fetch(`${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query.trim())}&limit=5`);

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.results || data.suggestions || []);
          // Only show if user is still focused on input
          if (document.activeElement?.classList.contains('search-input')) {
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error('Suggestions error:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    // Debounce: wait 300ms after user stops typing
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, aiSearchEnabled]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container') && !event.target.closest('.suggestions-dropdown')) {
        setShowSuggestions(false);
      }
      // Close filter dropdowns when clicking outside
      if (!event.target.closest('.filter-button-wrapper')) {
        setShowFilterDropdown({
          users: false,
          projects: false,
          workingDirectories: false,
          date: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide suggestions when AI search is toggled
  useEffect(() => {
    if (aiSearchEnabled) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [aiSearchEnabled]);

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/search/filters`);
        if (response.ok) {
          const data = await response.json();
          setFilterOptions({
            users: data.users || [],
            projects: data.projects || [],
            workingDirectories: data.workingDirectories || [],
            dates: data.dates || []
          });
        }
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    if (!aiSearchEnabled) {
      loadFilterOptions();
    }
  }, [aiSearchEnabled]);

  // Auto-search when filters change (debounced) - only if filters are applied
  useEffect(() => {
    // Skip auto-search on initial mount
    if (!hasSearched && 
        activeFilters.users.length === 0 && 
        activeFilters.projectNames.length === 0 && 
        activeFilters.workingDirectories.length === 0 && 
        !activeFilters.dateFrom && 
        !activeFilters.dateTo) {
      return;
    }

    const hasFilters = 
      activeFilters.users.length > 0 || 
      activeFilters.projectNames.length > 0 || 
      activeFilters.workingDirectories.length > 0 || 
      activeFilters.dateFrom || 
      activeFilters.dateTo;

    // Only auto-search if filters are applied or if there's a query
    if (hasFilters || query.trim()) {
      const timeoutId = setTimeout(() => {
        // Use current query and filters
        handleSearch(null, query);
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters.users, activeFilters.projectNames, activeFilters.workingDirectories, activeFilters.dateFrom, activeFilters.dateTo]);

  const toggleAiSearch = () => {
    setAiSearchEnabled(prev => !prev);
    // Clear results when toggling
    if (hasSearched) {
      setResults([]);
      setHasSearched(false);
      setTotal(0);
    }
    // Clear suggestions when toggling
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle AI chat message
  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || sendingMessage) return;

    // Get the last message in chat history to use as parent
    const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
    const parentId = lastMessage ? lastMessage.id : null;

    const userMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      text: currentMessage.trim(),
      timestamp: new Date().toISOString(),
      role: 'user',
      parentId: parentId // Link to previous message (assistant's last response or null for first message)
    };

    // Add user message to chat history immediately
    const updatedHistoryWithUser = [...chatHistory, userMessage];
    setChatHistory(updatedHistoryWithUser);
    setCurrentMessage('');
    setSendingMessage(true);

    try {
      // For now, use a generic system message + user query
      const systemPrompt = `You are a helpful AI assistant that helps engineers search through their coding assistant history. 
The user is asking: "${userMessage.text}"
Please provide a helpful response based on the context of AI coding assistant sessions.`;

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: systemPrompt,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        text: data.response || 'No response from AI',
        timestamp: new Date().toISOString(),
        role: 'assistant',
        parentId: userMessage.id // Link to the user's message that triggered this response
      };

      // Add AI response to chat history
      const updatedHistory = [...updatedHistoryWithUser, aiMessage];
      setChatHistory(updatedHistory);

      // Save to backend
      try {
        await fetch(`${API_BASE_URL}/chat-history/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedHistory,
            sessionId: 'default'
          }),
        });
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'error',
        text: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        role: 'assistant',
        parentId: userMessage.id // Link error message to user's message
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Clear chat history
  const clearChatHistory = async () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    
    // Clear on backend
    try {
      await fetch(`${API_BASE_URL}/chat-history/history`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: 'default' }),
      });
    } catch (error) {
      console.error('Failed to clear chat history on backend:', error);
    }
  };

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat-history/history?sessionId=default`);
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setChatHistory(data.messages);
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
          try {
            setChatHistory(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse localStorage chat history:', e);
          }
        }
      }
    };

    if (aiSearchEnabled) {
      loadHistory();
    }
  }, [aiSearchEnabled]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (aiSearchEnabled) {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  }, [chatHistory, sendingMessage, aiSearchEnabled]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.content || suggestion.query || suggestion);
    setShowSuggestions(false);
    // Trigger search automatically
    handleSearch(null, suggestion.content || suggestion.query || suggestion);
  };

  const handleSearch = async (e, searchQuery = null) => {
    if (e) e.preventDefault();
    const queryToSearch = searchQuery !== null ? searchQuery : query;
    
    // Allow search if there's a query OR if filters are applied
    const hasFilters = 
      activeFilters.users.length > 0 || 
      activeFilters.projectNames.length > 0 || 
      activeFilters.workingDirectories.length > 0 || 
      activeFilters.dateFrom || 
      activeFilters.dateTo;
    
    if (!queryToSearch.trim() && !hasFilters) {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setShowSuggestions(false);

    try {
      let response;
      
      if (aiSearchEnabled) {
        // AI-powered search
        response = await fetch(`${API_BASE_URL}/search/ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: queryToSearch.trim() }),
        });
      } else {
        // Simple keyword search with filters
        const params = new URLSearchParams();
        if (queryToSearch.trim()) {
          params.append('q', queryToSearch.trim());
        }
        if (activeFilters.users.length > 0) {
          params.append('users', activeFilters.users.join(','));
        }
        if (activeFilters.projectNames.length > 0) {
          params.append('projectNames', activeFilters.projectNames.join(','));
        }
        if (activeFilters.workingDirectories.length > 0) {
          params.append('workingDirectories', activeFilters.workingDirectories.join(','));
        }
        if (activeFilters.dateFrom) {
          params.append('dateFrom', activeFilters.dateFrom);
        }
        if (activeFilters.dateTo) {
          params.append('dateTo', activeFilters.dateTo);
        }
        
        response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Filter handlers
  const toggleFilter = (filterType) => {
    setShowFilterDropdown(prev => {
      // If clicking the same filter, toggle it
      // If clicking a different filter, close all others and open the clicked one
      const isCurrentlyOpen = prev[filterType];
      
      if (isCurrentlyOpen) {
        // Close the currently open dropdown
        return {
          users: false,
          projects: false,
          workingDirectories: false,
          date: false
        };
      } else {
        // Close all and open only the clicked one
        return {
          users: false,
          projects: false,
          workingDirectories: false,
          date: false,
          [filterType]: true
        };
      }
    });
  };

  const toggleFilterOption = (filterType, value) => {
    setActiveFilters(prev => {
      const currentValues = prev[filterType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearFilter = (filterType) => {
    setActiveFilters(prev => {
      if (filterType === 'date') {
        return { ...prev, dateFrom: '', dateTo: '' };
      }
      return { ...prev, [filterType]: [] };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      users: [],
      projectNames: [],
      workingDirectories: [],
      dateFrom: '',
      dateTo: ''
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Escape special regex characters
  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    try {
      // Escape special regex characters in the query
      const escapedQuery = escapeRegex(query);
      const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i}>{part}</mark>
        ) : (
          part
        )
      );
    } catch (error) {
      // Fallback: if regex fails, just return text without highlighting
      console.warn('Highlight error:', error);
      return text;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Dexicon AI Search</h1>
            <p className="subtitle">Search your team's AI coding assistant history</p>
          </div>
          <div className="ai-toggle-container">
            <button
              className={`ai-toggle-button ${aiSearchEnabled ? 'enabled' : 'disabled'}`}
              onClick={toggleAiSearch}
              title={aiSearchEnabled ? 'Disable AI Search' : 'Enable AI Search'}
            >
              <span className="toggle-icon">🤖</span>
              <span className="toggle-text">
                {aiSearchEnabled ? 'AI Search ON' : 'AI Search OFF'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <>
        {!aiSearchEnabled ? (
          // Simple Search Mode
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    // Only show suggestions if AI search is disabled
                    if (!aiSearchEnabled && e.target.value.trim().length >= 2) {
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    // Only show suggestions if AI search is disabled and we have suggestions
                    if (!aiSearchEnabled && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Small delay to allow click on suggestion before hiding
                    setTimeout(() => {
                      setShowSuggestions(false);
                    }, 200);
                  }}
                  placeholder="Search messages, engineers, projects..."
                  className="search-input"
                  autoFocus
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {loadingSuggestions ? (
                      <div className="suggestion-item loading">Loading suggestions...</div>
                    ) : (
                      <>
                        <div className="suggestions-header">Top {suggestions.length} Results</div>
                        {suggestions.slice(0, 5).map((suggestion, index) => (
                          <div
                            key={suggestion.id || index}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <div className="suggestion-content">
                              <div className="suggestion-title">
                                {suggestion.type && (
                                  <span className="suggestion-type">{suggestion.type}</span>
                                )}
                                {suggestion.engineer?.username && (
                                  <span className="suggestion-engineer">
                                    {suggestion.engineer.username}
                                  </span>
                                )}
                              </div>
                              <div className="suggestion-text">
                                {highlightText(
                                  suggestion.content || suggestion.query || suggestion,
                                  query
                                )}
                              </div>
                              {suggestion.project?.name && (
                                <div className="suggestion-project">
                                  📁 {suggestion.project.name}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
              <button type="submit" className="search-button" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {/* Filter Buttons */}
            <div className="filters-container">
              <div className="filters-header">
                <span className="filters-title">Filters:</span>
                {(activeFilters.users.length > 0 || 
                  activeFilters.projectNames.length > 0 || 
                  activeFilters.workingDirectories.length > 0 || 
                  activeFilters.dateFrom || 
                  activeFilters.dateTo) && (
                  <button 
                    type="button" 
                    className="clear-all-filters-btn"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="filter-buttons">
                {/* Users Filter */}
                <div className="filter-button-wrapper">
                  <button
                    type="button"
                    className={`filter-button ${activeFilters.users.length > 0 ? 'active' : ''}`}
                    onClick={() => toggleFilter('users')}
                  >
                    👤 Users {activeFilters.users.length > 0 && `(${activeFilters.users.length})`}
                  </button>
                  {showFilterDropdown.users && (
                    <div className="filter-dropdown">
                      <div className="filter-dropdown-header">
                        <span>Select Users</span>
                        {activeFilters.users.length > 0 && (
                          <button 
                            type="button"
                            className="clear-filter-btn"
                            onClick={() => clearFilter('users')}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="filter-options">
                        {filterOptions.users.map(user => (
                          <label key={user} className="filter-option">
                            <input
                              type="checkbox"
                              checked={activeFilters.users.includes(user)}
                              onChange={() => toggleFilterOption('users', user)}
                            />
                            <span>{user}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Projects Filter */}
                <div className="filter-button-wrapper">
                  <button
                    type="button"
                    className={`filter-button ${activeFilters.projectNames.length > 0 ? 'active' : ''}`}
                    onClick={() => toggleFilter('projects')}
                  >
                    📁 Projects {activeFilters.projectNames.length > 0 && `(${activeFilters.projectNames.length})`}
                  </button>
                  {showFilterDropdown.projects && (
                    <div className="filter-dropdown">
                      <div className="filter-dropdown-header">
                        <span>Select Projects</span>
                        {activeFilters.projectNames.length > 0 && (
                          <button 
                            type="button"
                            className="clear-filter-btn"
                            onClick={() => clearFilter('projectNames')}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="filter-options">
                        {filterOptions.projects.map(project => (
                          <label key={project} className="filter-option">
                            <input
                              type="checkbox"
                              checked={activeFilters.projectNames.includes(project)}
                              onChange={() => toggleFilterOption('projectNames', project)}
                            />
                            <span>{project}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Working Directories Filter */}
                <div className="filter-button-wrapper">
                  <button
                    type="button"
                    className={`filter-button ${activeFilters.workingDirectories.length > 0 ? 'active' : ''}`}
                    onClick={() => toggleFilter('workingDirectories')}
                  >
                    📂 Directories {activeFilters.workingDirectories.length > 0 && `(${activeFilters.workingDirectories.length})`}
                  </button>
                  {showFilterDropdown.workingDirectories && (
                    <div className="filter-dropdown">
                      <div className="filter-dropdown-header">
                        <span>Select Working Directories</span>
                        {activeFilters.workingDirectories.length > 0 && (
                          <button 
                            type="button"
                            className="clear-filter-btn"
                            onClick={() => clearFilter('workingDirectories')}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="filter-options">
                        {filterOptions.workingDirectories.map(dir => (
                          <label key={dir} className="filter-option">
                            <input
                              type="checkbox"
                              checked={activeFilters.workingDirectories.includes(dir)}
                              onChange={() => toggleFilterOption('workingDirectories', dir)}
                            />
                            <span>{dir}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date Range Filter */}
                <div className="filter-button-wrapper">
                  <button
                    type="button"
                    className={`filter-button ${activeFilters.dateFrom || activeFilters.dateTo ? 'active' : ''}`}
                    onClick={() => toggleFilter('date')}
                  >
                    📅 Date Range
                  </button>
                  {showFilterDropdown.date && (
                    <div className="filter-dropdown date-filter-dropdown">
                      <div className="filter-dropdown-header">
                        <span>Select Date Range</span>
                        {(activeFilters.dateFrom || activeFilters.dateTo) && (
                          <button 
                            type="button"
                            className="clear-filter-btn"
                            onClick={() => clearFilter('date')}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="date-range-inputs">
                        <div className="date-input-group">
                          <label>From:</label>
                          <input
                            type="date"
                            value={activeFilters.dateFrom}
                            onChange={(e) => {
                              setActiveFilters(prev => ({ ...prev, dateFrom: e.target.value }));
                            }}
                            max={activeFilters.dateTo || undefined}
                          />
                        </div>
                        <div className="date-input-group">
                          <label>To:</label>
                          <input
                            type="date"
                            value={activeFilters.dateTo}
                            onChange={(e) => {
                              setActiveFilters(prev => ({ ...prev, dateTo: e.target.value }));
                            }}
                            min={activeFilters.dateFrom || undefined}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        ) : (
          // AI Chat Mode
          <div className="chat-container">
            <div className="chat-header">
              <h2>AI Assistant</h2>
              {chatHistory.length > 0 && (
                <button onClick={clearChatHistory} className="clear-chat-button">
                  Clear Chat
                </button>
              )}
            </div>
            <div className="chat-messages">
              {chatHistory.length === 0 ? (
                <div className="chat-welcome">
                  <div className="welcome-icon">🤖</div>
                  <h3>Welcome to AI Assistant!</h3>
                  <p>Hello! I'm here to help you search through your coding assistant history. I can help you find information about users, projects, directories, and dates.</p>
                  <p className="welcome-examples">
                    <strong>Try asking me:</strong><br/>
                    • "Give me search result for andrewwang"<br/>
                    • "What projects did dianalu work on?"<br/>
                    • "Give me search result of andrewwang in date between 2025-11-01 and 2025-11-10"<br/>
                    • "Show me andrewwang's work before 2025-11-05"<br/>
                    • "How many users are there?"<br/>
                    • "What directories are available?"
                  </p>
                  <p style={{marginTop: '1rem', fontStyle: 'italic', color: '#999'}}>
                    Feel free to ask me anything about your coding assistant sessions!
                  </p>
                </div>
              ) : (
                chatHistory.map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.type}`}>
                    <div className="message-header">
                      <span className="message-role">
                        {msg.type === 'user' ? '👤 You' : msg.type === 'error' ? '❌ Error' : '🤖 AI'}
                      </span>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                ))
              )}
              {sendingMessage && (
                <div className="chat-message assistant">
                  <div className="message-header">
                    <span className="message-role">🤖 AI</span>
                  </div>
                  <div className="message-text typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleAIChat} className="chat-input-form">
              <div className="chat-input-container">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="chat-input"
                  disabled={sendingMessage}
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="chat-send-button" 
                  disabled={sendingMessage || !currentMessage.trim()}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!aiSearchEnabled && (
          <div className="results-container">
            {results.length === 0 && hasSearched && !loading && (
              <div className="no-results">
                <p>No results found. Try a different search term.</p>
              </div>
            )}

            {results.map((result) => (
              <div key={result.id} className="result-card">
                <div className="result-header">
                  <div className="result-meta">
                    <span className="message-type">{result.type}</span>
                    <span className="engineer-name">
                      {result.engineer?.username || 'Unknown'}
                    </span>
                    <span className="timestamp">{formatDate(result.timestamp)}</span>
                  </div>
                  <div className="project-info">
                    {result.project?.name && (
                      <span className="project-badge">
                        {result.project.name}
                        {result.project.primaryLanguage && (
                          <span className="language-tag">
                            {result.project.primaryLanguage}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {result.session?.taskDescription && (
                  <div className="task-description">
                    <strong>Task:</strong> {result.session.taskDescription}
                  </div>
                )}

                <div className="result-content">
                  {highlightText(result.content, query)}
                </div>

                <div className="result-footer">
                  <span className="engineer-role">{result.engineer?.role}</span>
                  {result.engineer?.email && (
                    <span className="engineer-email">{result.engineer.email}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </>
      </main>
    </div>
  );
}

export default App;
