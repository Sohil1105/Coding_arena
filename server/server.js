const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const problemsRoutes = require('./problems');
const submissionsRoutes = require('./submissions');
const usersRoutes = require('./users');
const leaderboardRoutes = require('./leaderboard');
const authRoutes = require('./auth');
const aiRoutes = require('./ai');
const seedAll = require('./seedAll');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// Default COMPILER_URL
if (!process.env.COMPILER_URL) {
    process.env.COMPILER_URL = 'http://localhost:8000';
    console.log('COMPILER_URL not set, defaulting to http://localhost:8000');
}

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL;
        if (!mongoUrl) {
            console.error('MONGO_URL environment variable is required.');
            process.exit(1);
        }
        
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
        });
        
        console.log('MongoDB Atlas connected successfully.');

        // Seed database
        await seedAll();
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
    }
};

connectDB();

app.use('/api/problems', problemsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set. JWT authentication will fail. Set JWT_SECRET in your environment variables or .env file.');
}

if (!process.env.MONGO_URL) {
    console.error('Error: MONGO_URL environment variable is required. Please set it to your MongoDB Atlas connection string.');
    process.exit(1);
}

// Health check
app.get('/', (req, res) => {
    res.status(200).send('Backend API is running successfully.');
});

// Test compiler
app.get('/test-compiler', async (req, res) => {
    try {
        const response = await require('axios').get(`${process.env.COMPILER_URL}/`);
        res.json({ status: 'success', data: response.data });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Health endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
