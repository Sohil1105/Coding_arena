const mongoose = require('mongoose');
const Submission = require('./models/submission');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding_arena';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const cleanupSubmissions = async (days) => {
    if (!days || isNaN(days)) {
        console.error('Please provide a valid number of days.');
        return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    try {
        const result = await Submission.deleteMany({ submittedAt: { $lt: cutoffDate } });
        console.log(`Successfully deleted ${result.deletedCount} submissions older than ${days} days.`);
    } catch (error) {
        console.error('Error deleting submissions:', error);
    } finally {
        mongoose.connection.close();
    }
};

const days = parseInt(process.argv[2], 10);

connectDB().then(() => {
    cleanupSubmissions(days);
});
