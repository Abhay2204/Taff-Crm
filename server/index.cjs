const path = require('path');
const app = require('./app.cjs');

const PORT = process.env.PORT || 3001;

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const express = require('express');
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 CRM API Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🗄️  Database: MongoDB Atlas`);
});
