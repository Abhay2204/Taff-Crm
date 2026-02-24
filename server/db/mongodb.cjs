const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is required');
    }

    try {
        await mongoose.connect(uri, {
            dbName: 'taff-crm',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        isConnected = false;
        throw error;
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = { connectDB };
