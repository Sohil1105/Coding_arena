const express = require('express');
const router = express.Router();
const User = require('./models/user');
const Submission = require('./models/submission');
const Problem = require('./models/problem');

// Top solvers
router.get('/solvers', async (req, res) => {
    try {
        const topSolvers = await Submission.aggregate([
            { $match: { output: { $regex: /^Accepted/ } } },
            { $group: { _id: { userId: '$userId', problemId: '$problemId' } } },
            { $group: { _id: '$_id.userId', score: { $sum: 1 } } },
            { $sort: { score: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
            { $unwind: '$userDetails' },
            { $project: { name: '$userDetails.name', score: 1 } }
        ]);
        res.json(topSolvers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Top contributors
router.get('/contributors', async (req, res) => {
    try {
        const topContributors = await Problem.aggregate([
            { $group: { _id: '$author', contributions: { $sum: 1 } } },
            { $sort: { contributions: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'authorDetails' } },
            { $unwind: '$authorDetails' },
            { $project: { name: '$authorDetails.name', contributions: 1 } }
        ]);
        res.json(topContributors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
