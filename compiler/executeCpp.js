const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Compiles and executes C/C++ code with given compiler and input
const executeCompiled = (compiler, filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    const compileCommand = `${compiler} ${filepath} -o ${outPath}`;
    exec(compileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        return reject({ error: compileError.message, stderr: compileStderr });
      }
      if (compileStderr) {
        console.warn(`${compiler} compilation warnings/errors for ${jobId}:`, compileStderr);
      }

      const executeCommand = `${outPath} < ${inputPath}`;
      exec(executeCommand, { timeout: 10000 }, (execError, stdout, stderr) => {
        // Clean up compiled executable after execution
        fs.unlink(outPath, (err) => {
          if (err) console.error(`Failed to delete ${outPath}:`, err);
        });

        if (execError) {
          if (execError.killed) {
            return reject({ error: "Time Limit Exceeded (10s)", stderr: "" });
          }
          return reject({ error: execError.message, stderr });
        }
        if (stderr) {
          return reject({ error: "Runtime Error", stderr });
        }
        resolve(stdout);
      });
    });
  });
};

const executeCpp = (filepath, inputPath) => executeCompiled('g++', filepath, inputPath);
const executeC = (filepath, inputPath) => executeCompiled('gcc', filepath, inputPath);

module.exports = {
  executeCpp,
  executeC,
};
