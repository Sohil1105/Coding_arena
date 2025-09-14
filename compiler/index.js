const express = require('express');
const app = express();
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const { executeCpp } = require('./executeCpp');
const { executeC } = require('./executeC');
const { executeJava } = require('./executeJava');
const { executePython } = require('./executePython');
const cors = require('cors');

// Middleware setup
app.use(cors({
  origin: 'https://coding-arena-six.vercel.app'
})); // Enable Cross-Origin Resource Sharing for specific origin
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.json()); // Parse JSON data

// Basic health check endpoint
app.get("/", (req, res) => {
    res.json({ online: 'compiler' });
});

// Main endpoint to compile and run C++ code
app.post("/run", async (req, res) => {
    // Extract language, code, and input from request body with defaults
    const { language = 'cpp', code, input = '' } = req.body;
    
    // Validate that code is provided
    if (code === undefined || code.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            error: "Empty code! Please provide some code to execute." 
        });
    }
    
    try {
        // Generate a temporary file with the user's code
        const filePath = await generateFile(language, code);
        
        // Generate a temporary file with the user's input (if any)
        const inputPath = await generateInputFile(input);
        
        let output;
        switch (language) {
            case 'cpp':
                output = await executeCpp(filePath, inputPath);
                break;
            case 'c':
                output = await executeC(filePath, inputPath);
                break;
            case 'java':
                output = await executeJava(filePath, inputPath);
                break;
            case 'python':
                output = await executePython(filePath, inputPath);
                break;
            default:
                return res.status(400).json({ success: false, error: "Unsupported language" });
        }
        
        // Send successful response with output
        res.json({ 
            success: true,
            language,
            filePath, 
            inputPath, 
            output 
        });
    } catch (err) { // Renamed error to err for clarity
        console.error(`Error executing ${language} code:`, err);
        
        let errorMessage = 'An unknown error occurred during code execution.';
        let stderrOutput = '';

        if (err && typeof err === 'object') {
            if (err.error) { // This is the error message from exec (e.g., command not found)
                errorMessage = err.error;
            }
            if (err.stderr) { // This is the stderr output from compiler/runtime
                stderrOutput = err.stderr;
            }
        } else if (typeof err === 'string') {
            errorMessage = err;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }

        // Combine error message and stderr for a comprehensive output
        const fullErrorMessage = stderrOutput ? `${errorMessage}\n${stderrOutput}` : errorMessage;

        // Send error response with proper error message
        res.status(500).json({ 
            success: false,
            error: fullErrorMessage
        });
    }
});

// Start the server on port 8000
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
});
