const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/mongodb.cjs');

// Log environment status for debugging on Vercel
console.log('🔧 Environment check:', {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ MISSING',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ MISSING',
});

const authRoutes = require('./routes/auth.cjs');
const prospectsRoutes = require('./routes/prospects.cjs');
const followupsRoutes = require('./routes/followups.cjs');
const dashboardRoutes = require('./routes/dashboard.cjs');
const servicesRoutes = require('./routes/services.cjs');

const app = express();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (same-origin, Postman, server-to-server)
        if (!origin) return callback(null, true);
        // In production, allow Vercel domains
        if (process.env.NODE_ENV === 'production') {
            if (/\.vercel\.app$/.test(origin) || origin === process.env.FRONTEND_URL) {
                return callback(null, true);
            }
        }
        // In development, allow localhost
        if (/localhost/.test(origin)) {
            return callback(null, true);
        }
        callback(null, true); // Allow all for now
    },
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB before handling any request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('DB connection failed:', error.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prospects', prospectsRoutes);
app.use('/api/followups', followupsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', servicesRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'mongodb' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
