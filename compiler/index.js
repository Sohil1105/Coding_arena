import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import executeFile, { cleanupSourceFile } from "./src/executeFile.js";
import createFile from "./src/createFile.js";
import createInputFile from "./src/createInputFile.js";
import aiReview from "./src/aiReview.js";
import aiFeatureRequest from "./src/aiFeatures.js";

// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Compiler API!",
        endpoints: {
            compile: "POST /compile",
        },
        supportedLanguages: ["c", "cpp", "java", "py"]
    });
});
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes

app.post("/run", async (req, res) => {
    try {
        const { extension, code, input = '' } = req.body;
        // Validation
        if (!extension || !code) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
                details: "Both 'extension' and 'content' are required"
            });
        }

        // Validate extension
        const validExtensions = ['c', 'cpp', 'java', 'py'];
        if (!validExtensions.includes(extension)) {
            return res.status(400).json({
                success: false,
                error: "Invalid file extension",
                details: `Supported extensions: ${validExtensions.join(', ')}`
            });
        }

        // Create file
        console.log(`Creating file with extension: ${extension}`);
        const fileResult = createFile(extension, code);

        if (!fileResult.success) {
            return res.status(500).json({
                success: false,
                error: "File creation failed",
                details: fileResult.error
            });
        }
        const InputFile = createInputFile(input);
        if (!InputFile.success) {
            return res.status(500).json({
                success: false,
                error: "Input file creation failed",
                details: InputFile.error
            });
        }

        // Execute file
        console.log(`Executing fillllleeeee: ${fileResult.filePath}`);
        const executionResult = await executeFile(fileResult.filePath, InputFile.filePath);

        if (executionResult.success) {
            return res.status(200).json({
                success: true,
                output: executionResult.output,
                jobId: fileResult.jobId,
                language: extension
            });
        } else {
            return res.status(400).json({
                success: false,
                error: executionResult.error,
                details: executionResult.details,
                timeout: executionResult.timeout || false,
                partialOutput: executionResult.output || null
            });
        }

    } catch (error) {
        console.error('Unexpected error in /compile:', error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            details: error.message
        });
    }
});

// New submission endpoint for judging against multiple test cases
app.post("/submit", async (req, res) => {
    let fileResult = null; // Declare at top level for cleanup
    try {
        const { extension, code, testcases, timeLimit = 2000, memoryLimit = 256 } = req.body;
        
        // Validation
        if (!extension || !code || !testcases || !Array.isArray(testcases)) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
                details: "extension, code, and testcases array are required"
            });
        }

        // Validate extension
        const validExtensions = ['c', 'cpp', 'java', 'py'];
        if (!validExtensions.includes(extension)) {
            return res.status(400).json({
                success: false,
                error: "Invalid file extension",
                details: `Supported extensions: ${validExtensions.join(', ')}`
            });
        }

        // Create file
        console.log(`Creating file for submission with extension: ${extension}`);
        fileResult = createFile(extension, code);

        if (!fileResult.success) {
            return res.status(400).json({
                success: false,
                verdict: "Compilation Error",
                error: "File creation failed",
                details: fileResult.error,
                testResults: []
            });
        }

        console.log(`Running ${testcases.length} test cases...`);
        const testResults = [];
        let overallVerdict = "Accepted";
        let passedTests = 0;
        let failedOnTestCase = null;

        // Run each test case
        for (let i = 0; i < testcases.length; i++) {
            const testcase = testcases[i];
            console.log(testcase.input);
            console.log(`Running test case ${i + 1}/${testcases.length}`);

            // Create input file for this test case
            const inputFile = createInputFile(testcase.input);
            if (!inputFile.success) {
                testResults.push({
                    testCase: i + 1,
                    verdict: "Runtime Error",
                    input: testcase.visible ? testcase.input : null,
                    expectedOutput: testcase.visible ? testcase.output : null,
                    actualOutput: "",
                    executionTime: 0,
                    error: "Input file creation failed",
                    visible: testcase.visible || false
                });
                if (overallVerdict === "Accepted") {
                    overallVerdict = "Runtime Error";
                    failedOnTestCase = i + 1;
                }
                continue; // Continue to next test case instead of breaking
            }

            // Execute with time limit
            const executionResult = await executeFile(fileResult.filePath, inputFile.filePath, timeLimit);

            if (!executionResult.success) {
                let verdict = "Runtime Error";
                if (executionResult.timeout) {
                    verdict = "Time Limit Exceeded";
                } else if (executionResult.error && executionResult.error.includes("memory")) {
                    verdict = "Memory Limit Exceeded";
                }

                testResults.push({
                    testCase: i + 1,
                    verdict: verdict,
                    input: testcase.visible ? testcase.input : null,
                    expectedOutput: testcase.visible ? testcase.output : null,
                    actualOutput: executionResult.output || "",
                    executionTime: executionResult.executionTime || timeLimit,
                    error: executionResult.error,
                    visible: testcase.visible || false
                });
                if (overallVerdict === "Accepted") {
                    overallVerdict = verdict;
                    failedOnTestCase = i + 1;
                }
                continue; // Continue to next test case instead of breaking
            } else {
                // Compare output
                const expectedOutput = testcase.output.trim();
                const actualOutput = executionResult.output.trim();
                console.log(`Expected: ${expectedOutput}, Actual: ${actualOutput}`);
                if (expectedOutput === actualOutput) {
                    testResults.push({
                        testCase: i + 1,
                        verdict: "Accepted",
                        input: testcase.visible ? testcase.input : null,
                        expectedOutput: testcase.visible ? expectedOutput : null,
                        actualOutput: testcase.visible ? actualOutput : null,
                        executionTime: executionResult.executionTime || 0,
                        visible: testcase.visible || false
                    });
                    passedTests++;
                } else {
                    testResults.push({
                        testCase: i + 1,
                        verdict: "Wrong Answer",
                        input: testcase.visible ? testcase.input : null,
                        expectedOutput: testcase.visible ? expectedOutput : null,
                        actualOutput: testcase.visible ? actualOutput : null,
                        executionTime: executionResult.executionTime || 0,
                        visible: testcase.visible || false
                    });
                    if (overallVerdict === "Accepted") {
                        overallVerdict = "Wrong Answer";
                        failedOnTestCase = i + 1;
                    }
                }
            }
        }

        // Clean up source file after all test cases are done
        cleanupSourceFile(fileResult.filePath, extension);

        return res.status(200).json({
            success: true,
            verdict: overallVerdict,
            passedTests: passedTests,
            totalTests: testcases.length,
            failedOnTestCase: failedOnTestCase,
            testResults: testResults,
            executionTime: testResults.length > 0 ? testResults[testResults.length - 1].executionTime : 0,
            memoryUsed: 0, // Memory tracking not implemented yet
            language: extension
        });

    } catch (error) {
        console.error('Unexpected error in /submit:', error);
        // Clean up source file on error if it exists
        if (fileResult && fileResult.filePath) {
            cleanupSourceFile(fileResult.filePath, extension);
        }
        return res.status(500).json({
            success: false,
            verdict: "Runtime Error",
            error: "Internal Server Error",
            details: error.message,
            testResults: [],
            passedTests: 0,
            totalTests: 0,
            executionTime: 0,
            memoryUsed: 0
        });
    }
});
app.post("/review", async (req, res) => {
    try {
        const { code , language } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                error: "Missing code",
            });
        }
        const reviewResult = await aiReview(code, language);
        if (reviewResult.success) {
            return res.status(200).json({
                success: true,
                review: reviewResult.review
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "AI Review Failed",
            });
        }
    } catch (error) {
        console.error('Unexpected error in /review:', error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
});

// AI Feature endpoints for landing page
app.post("/ai-feature", async (req, res) => {
    try {
        const { feature, code, language, problemDescription, constraints } = req.body;
        
        if (!feature || !code) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
            });
        }

        const aiResult = await aiFeatureRequest(feature, code, language, problemDescription, constraints);
        
        if (aiResult.success) {
            return res.status(200).json({
                success: true,
                result: aiResult.result
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "AI Feature Failed",
            });
        }
    } catch (error) {
        console.error('Unexpected error in /ai-feature:', error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: "Internal Server Error",
        details: err.message
    });
});

// 404 handler - Fix the route pattern
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
        details: `${req.method} ${req.originalUrl} is not a valid endpoint`
    });
});

app.listen(PORT, () => {
    console.log(`Compiler API is running on http://localhost:${PORT}`);
});

export default app;
