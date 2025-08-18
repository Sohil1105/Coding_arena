const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Compiles and executes C code with given input
const executeC = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    const compileCommand = `gcc ${filepath} -o ${outPath}`;
    exec(compileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        return reject({ error: compileError.message, stderr: compileStderr });
      }
      if (compileStderr) {
        console.warn(`C compilation warnings/errors for ${jobId}:`, compileStderr);
      }

      const executeCommand = `${outPath} < ${inputPath}`;
      exec(executeCommand, (execError, stdout, stderr) => {
        // Clean up compiled executable after execution
        fs.unlink(outPath, (err) => {
          if (err) console.error(`Failed to delete ${outPath}:`, err);
        });

        if (execError) {
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

module.exports = {
  executeC,
};
