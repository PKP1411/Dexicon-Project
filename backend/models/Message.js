/**
 * Message Model
 * Represents a message from AI coding assistant sessions
 */
class Message {
  constructor(data) {
    this.id = data.id;
    this.sessionId = data.sessionId;
    this.type = data.type;
    this.sequenceNumber = data.sequenceNumber;
    this.timestamp = data.timestamp;
    this.parentId = data.parentId;
    this.content = data.content;
    this.rawMetadata = data.rawMetadata || {};
    this.typeSpecificData = data.typeSpecificData || {};
    
    // Enriched data
    this.engineer = data.engineer;
    this.session = data.session;
    this.project = data.project;
  }

  /**
   * Check if message matches search query
   * @param {string} query - Search query (lowercase)
   * @returns {boolean}
   */
  matchesQuery(query) {
    if (!query) return false;

    // Search in content
    const contentMatch = this.content?.toLowerCase().includes(query);
    
    // Search in metadata
    const taskMatch = this.session?.metadata?.taskDescription?.toLowerCase().includes(query);
    
    // Search in engineer name
    const engineerMatch = this.engineer?.username?.toLowerCase().includes(query) ||
                         this.engineer?.email?.toLowerCase().includes(query);
    
    // Search in project name
    const projectMatch = this.project?.name?.toLowerCase().includes(query);
    
    return contentMatch || taskMatch || engineerMatch || projectMatch;
  }

  /**
   * Convert to API response format
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      timestamp: this.timestamp,
      engineer: {
        username: this.engineer?.username,
        email: this.engineer?.email,
        role: this.engineer?.role
      },
      session: {
        id: this.session?.id,
        taskDescription: this.session?.metadata?.taskDescription
      },
      project: {
        id: this.project?.id,
        name: this.project?.name,
        primaryLanguage: this.project?.metadata?.primaryLanguage,
        framework: this.project?.metadata?.framework
      }
    };
  }
}

module.exports = Message;

