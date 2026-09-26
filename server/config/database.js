const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using Mongoose.
 * Reads connection string securely from process.env.MONGODB_URI
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

  if (!uri) {
    console.warn('⚠️ [MongoDB] Warning: MONGODB_URI/MONGO_URI is not defined in environment variables.');
    console.warn('Please configure MONGODB_URI in your Render / hosting environment variables.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'eventflow',
      serverSelectionTimeoutMS: 10000,
    });

    console.log('[MongoDB] Connected successfully to MongoDB Atlas');
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection failed.');
    console.error('Check MONGODB_URI, Atlas credentials, and Network Access settings.');
    
    // Check for IP whitelist / TLS error patterns
    if (
      error.message &&
      (error.message.includes('SSL') ||
        error.message.includes('TLS') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('Could not connect to any servers'))
    ) {
      console.error('[MongoDB Atlas Network Access] Your current IP address might not be allowed in MongoDB Atlas.');
      console.error('Please verify your IP is whitelisted under Network Access in the MongoDB Atlas dashboard (e.g. Allow Access from Anywhere: 0.0.0.0/0 for development).');
    }

    throw error;
  }
};

module.exports = connectDB;
