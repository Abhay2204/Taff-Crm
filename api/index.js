// Vercel Serverless Function Entry Point
// Wraps the Express app with error handling for initialization failures

let app;

try {
    app = require('../server/app.cjs');
} catch (error) {
    console.error('❌ Failed to initialize Express app:', error);
    // Export a handler that returns a meaningful error
    module.exports = (req, res) => {
        res.status(500).json({
            error: 'Server initialization failed',
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    };
    // Stop here - don't try to export the broken app
    return;
}

module.exports = app;
