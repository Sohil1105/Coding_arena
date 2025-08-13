const mongoose = require('mongoose');
const seedAll = require('./seedAll');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL;
        if (!mongoUrl) {
            console.error('MONGO_URL environment variable is required.');
            process.exit(1);
        }
        
        await mongoose.connect(mongoUrl);
        
        console.log('MongoDB Atlas connected successfully.');

        await seedAll();

        mongoose.connection.close();

    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

connectDB();
