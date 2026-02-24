require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/mongodb.cjs');

const authRoutes = require('./routes/auth.cjs');
const prospectsRoutes = require('./routes/prospects.cjs');
const followupsRoutes = require('./routes/followups.cjs');
const dashboardRoutes = require('./routes/dashboard.cjs');
const servicesRoutes = require('./routes/services.cjs');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, /\.vercel\.app$/]
        : ['http://localhost:5173', 'http://localhost:3000'],
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
