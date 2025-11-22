/**
 * Application Configuration
 */
module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  dataFiles: [
    'andrewwang.json',
    'dianalu.json',
    'daniellin.json'
  ]
};

