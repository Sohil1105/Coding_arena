import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fix: Correct the path structure - from src directory, need to go up one level
const outputDir = path.join(__dirname, './public/temp/output');
const codesDir = path.join(__dirname, './public/temp/codes');

const executeFile = async (filePath, inputFile, timeLimit = 10000) => {
    try {
        // Fix: Add file existence checks before proceeding
        if (!fs.existsSync(filePath)) {
            return {
                success: false,
                error: 'Source file not found',
                details: `File does not exist: ${filePath}`
            };
        }

        if (!fs.existsSync(inputFile)) {
            return {
                success: false,
                error: 'Input file not found',
                details: `Input file does not exist: ${inputFile}`
            };
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const jobId = path.basename(filePath).split('.')[0];
        const extension = path.extname(filePath);
        let outputFilePath = path.join(outputDir, jobId);
        let compileCommand = '';
        let runCommand = '';

        switch(extension) {
            case '.c':
                outputFilePath += '.exe';
                compileCommand = `gcc "${filePath}" -o "${outputFilePath}"`;
                runCommand = `"${outputFilePath}" < "${inputFile}"`;
                break;
            case '.cpp':
                outputFilePath += '.exe';
                compileCommand = `g++ "${filePath}" -o "${outputFilePath}"`;
                runCommand = `"${outputFilePath}" < "${inputFile}"`;
                break;
            case '.java':
                // For Java, we need to compile first, then run with the class name
                const className = path.basename(filePath, '.java');
                const javaDir = path.dirname(filePath);
                compileCommand = `javac "${filePath}"`;
                runCommand = `cd "${javaDir}" && java ${className} < "${inputFile}"`;
                break;
            case '.py':
                runCommand = `python "${filePath}" < "${inputFile}"`;
                break;
            default:
                return {
                    success: false,
                    error: `Unsupported file extension: ${extension}`
                };
        }

        if (compileCommand) {
            try {
                const { stdout: compileStdout, stderr: compileStderr } = await execAsync(compileCommand);
                
                if (compileStderr && !compileStderr.includes('warning')) {
                    return {
                        success: false,
                        error: 'Compilation Error',
                        details: compileStderr
                    };
                }
                
                // Fix: For compiled languages, verify output file was created
                if ((extension === '.c' || extension === '.cpp') && !fs.existsSync(outputFilePath)) {
                    return {
                        success: false,
                        error: 'Compilation Failed',
                        details: 'Executable file was not created'
                    };
                }
                
            } catch (compileError) {
                return {
                    success: false,
                    error: 'Compilation Failed',
                    details: compileError.stderr || compileError.message
                };
            }
        }

        // Execution step with time tracking
        try {
            const startTime = Date.now();
            const { stdout, stderr } = await execAsync(runCommand, { 
                timeout: timeLimit
            });
            const executionTime = Date.now() - startTime;

            cleanupFiles(null, outputFilePath, inputFile, extension, false);

            if (stderr && !stderr.includes('warning')) {
                return {
                    success: false,
                    error: 'Runtime Error',
                    details: stderr,
                    output: stdout || '',
                    executionTime: executionTime,
                    filePath: filePath 
                };
            }

            return {
                success: true,
                output: stdout || '',
                error: null,
                executionTime: executionTime,
                filePath: filePath
            };

        } catch (executionError) {
            cleanupFiles(null, outputFilePath, inputFile, extension, false);
            
            const isTimeout = executionError.killed && executionError.signal === 'SIGTERM';
            
            return {
                success: false,
                error: isTimeout ? 'Time Limit Exceeded' : 'Execution Failed',
                details: executionError.stderr || executionError.message,
                timeout: isTimeout,
                executionTime: isTimeout ? timeLimit : 0,
                output: executionError.stdout || '',
                filePath: filePath
            };
        }

    } catch (error) {
        console.error('Unexpected error in executeFile:', error);
        return {
            success: false,
            error: 'Internal Server Error',
            details: error.message
        };
    }
};

const cleanupFiles = (filePath, outputFilePath, inputFile, extension, cleanupSource = true) => {
    try {
        
        // Remove source file only if requested
        if (cleanupSource && filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Always remove input file
        if(inputFile && fs.existsSync(inputFile)){
            fs.unlinkSync(inputFile);
        }
        
        // Remove compiled file
        if (outputFilePath && fs.existsSync(outputFilePath)) {
            fs.unlinkSync(outputFilePath);
        }
        
        
    } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
    }
};

const cleanupSourceFile = (filePath, extension) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
    } catch (cleanupError) {
        console.error('Error during source file cleanup:', cleanupError);
    }
};

export default executeFile;
export { cleanupSourceFile };
