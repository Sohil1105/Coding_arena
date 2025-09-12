require('dotenv').config();

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

const app = express();
// Enable CORS for frontend localhost:3001 for development
app.use(cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Environment configuration removed

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
app.use('/api/snippets', require('./codeSnippets'));

if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set. JWT authentication will fail. Set JWT_SECRET in your environment variables or .env file.');
}

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'success',
        message: 'Backend API is running successfully.'
    });
});

// Test compiler endpoint removed

// Health endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
