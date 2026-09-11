const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startScheduler } = require('./utils/scheduler');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all origins with explicit options handling
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');

// Routes Middleware
app.use('/api/auth', authRoutes);

// Health Check & Welcome Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MindCare - Student Mental Wellness Portal API' });
});

app.get('/api/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'OK',
    app: 'MIND CARE - Student Mental Wellness Portal API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[MindCare Server Error]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error occurred'
  });
});

const PORT = process.env.PORT || 5000;

// Start Express server immediately without blocking
app.listen(PORT, () => {
  console.log(`[MindCare Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  connectDB().then(() => {
    // Start scheduled wellness reminders AFTER DB is ready
    startScheduler();
  }).catch(() => {
    console.warn('[MindCare] DB not yet ready — scheduler will still start but DB ops may fail initially.');
    startScheduler();
  });
});
