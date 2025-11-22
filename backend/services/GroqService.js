// Load environment variables
require('dotenv').config();

const Groq = require('groq-sdk');

/**
 * Groq AI Service
 * Handles communication with Groq AI API
 */
class GroqService {
  constructor() {
    this.groq = null;
    this.initialize();
  }

  /**
   * Initialize Groq client
   */
  initialize() {
    const apiKey = process.env.GROQ_API_KEY;
    
    // Debug: Show API key status (safely)
    console.log('🔍 [GroqService] Initializing...');
    console.log('🔍 [GroqService] API Key exists:', !!apiKey);
    console.log('🔍 [GroqService] API Key length:', apiKey ? apiKey.length : 0);
    console.log('🔍 [GroqService] API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'N/A');
    console.log('🔍 [GroqService] API Key is placeholder:', apiKey === 'your_groq_api_key_here');
    
    if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
      console.warn('⚠️  GROQ_API_KEY not set. AI features will be disabled.');
      this.groq = null;
      return;
    }

    try {
      this.groq = new Groq({
        apiKey: apiKey
      });
      console.log('✅ Groq AI service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Groq:', error.message);
      this.groq = null;
    }
  }

  /**
   * Check if Groq is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.groq !== null;
  }

  /**
   * Send a message to the AI agent
   * @param {string} message - User message
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async sendMessage(message, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Groq AI service is not available. Please check your API key.');
    }

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        model: options.model || 'openai/gpt-oss-20b',
        temperature: options.temperature || 1,
        max_completion_tokens: options.max_completion_tokens || 8192,
        top_p: options.top_p || 1,
        stream: options.stream || false,
        reasoning_effort: options.reasoning_effort || 'medium',
        stop: options.stop || null
      });

      // Handle streaming response
      if (options.stream) {
        let fullResponse = '';
        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
        }
        return fullResponse;
      }

      // Handle non-streaming response
      return chatCompletion.choices[0]?.message?.content || 'No response from AI';
    } catch (error) {
      console.error('❌ Error calling Groq:', error.message);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }

  /**
   * Stream response chunks
   * @param {string} message - User message
   * @param {Function} onChunk - Callback for each chunk
   * @param {Object} options - Additional options
   */
  async streamMessage(message, onChunk, options = {}) {
    if (!this.isAvailable()) {
      throw new Error('Groq AI service is not available. Please check your API key.');
    }

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        model: options.model || 'openai/gpt-oss-20b',
        temperature: options.temperature || 1,
        max_completion_tokens: options.max_completion_tokens || 8192,
        top_p: options.top_p || 1,
        stream: true,
        reasoning_effort: options.reasoning_effort || 'medium',
        stop: options.stop || null
      });

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content && onChunk) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('❌ Error streaming from Groq:', error.message);
      throw new Error(`Failed to stream AI response: ${error.message}`);
    }
  }
}

// Singleton instance
const groqService = new GroqService();

module.exports = groqService;

