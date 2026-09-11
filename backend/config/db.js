const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindcare', {
      serverSelectionTimeoutMS: 3000 // Fast 3-second timeout if local MongoDB service is inactive
    });
    console.log(`[MindCare Backend] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MindCare Backend] MongoDB Connection Notice: ${error.message}`);
    console.warn(`[MindCare Backend] Express API is fully active! To persist data in MongoDB Atlas, add your MONGODB_URI in backend/.env`);
  }
};

module.exports = connectDB;
