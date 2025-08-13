const mongoose = require('mongoose');
const Problem = require('./models/problem');
const User = require('./models/user');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const seedDB = async () => {
    try {
        const adminUser = await User.findOne({ email: 'souravsohil1111@gmail.com' });
        if (!adminUser) {
            throw new Error('Admin user not found. Please seed users first.');
        }

        // Read problems
        const problemsJsonPath = path.join(__dirname, 'problems.json');
        const problemsData = JSON.parse(fs.readFileSync(problemsJsonPath, 'utf8'));

        // Convert format
        const problems = problemsData.map((problem, index) => ({
            id: problem.id,
            title: problem.title,
            description: problem.statement,
            difficulty: problem.difficulty,
            tags: problem.tags,
            testCases: [
                {
                    input: problem.sample_input,
                    output: problem.sample_output
                }
            ],
            author: adminUser._id
        }));

        await Problem.deleteMany({});
        await Problem.insertMany(problems);
        console.log(`Database seeded with ${problems.length} problems!`);
    } catch (err) {
        console.error('Problem seeding failed:', err);
        throw err; // Re-throw the error to be caught by the caller
    }
};

module.exports = seedDB;
