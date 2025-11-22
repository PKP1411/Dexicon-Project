/**
 * Session Model
 * Represents an AI coding assistant session
 */
class Session {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.startedAt = data.startedAt;
    this.endedAt = data.endedAt;
    this.producer = data.producer;
    this.producerVersion = data.producerVersion;
    this.schemaVersion = data.schemaVersion;
    this.username = data.username;
    this.metadata = data.metadata || {};
    
    // Enriched data
    this.engineer = data.engineer;
    this.project = data.project;
  }

  /**
   * Convert to API response format
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      engineer: this.engineer,
      project: this.project,
      taskDescription: this.metadata?.taskDescription,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      producer: this.producer,
      producerVersion: this.producerVersion
    };
  }
}

module.exports = Session;

