const mongoose = require('mongoose');

// Problem schema
const ProblemSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    inputFormat: {
        type: String
    },
    outputFormat: {
        type: String
    },
    difficulty: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    testCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Problem', ProblemSchema);
