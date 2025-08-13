const mongoose = require('mongoose');
const Submission = require('./models/submission');
require('dotenv').config();

const submissions = [
    {
        problemId: 'two-sum',
        userId: null, // Update with user ObjectId
        code: 'function twoSum(nums, target) { /* solution code */ }',
        language: 'javascript',
        status: 'Accepted',
        output: 'Accepted',
        createdAt: new Date()
    },
    {
        problemId: 'palindrome-number',
        userId: null,
        code: 'function isPalindrome(x) { /* solution code */ }',
        language: 'javascript',
        status: 'Failed',
        output: 'Failed',
        createdAt: new Date()
    }
];

const seedSubmissions = async () => {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo:27017/codingarena';
    await mongoose.connect(mongoUrl);

    await Submission.deleteMany({});
    await Submission.insertMany(submissions);

    console.log('Submissions collection seeded!');
    mongoose.connection.close();
};

seedSubmissions();
