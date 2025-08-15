const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Compiles and executes Java code with given input
const executeJava = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0]; // This will be the class name

  return new Promise((resolve, reject) => {
    // Compile Java file with javac
    exec(
      `javac ${filepath} -d ${outputPath}`, // Compile to the outputs directory
      (compileError, compileStdout, compileStderr) => {
        if (compileError) {
          return reject({ error: compileError, stderr: compileStderr });
        }
        if (compileStderr) {
          // Even if there's stderr, compilation might succeed, but it's good to report warnings
          // For now, we'll treat it as an error if there's any stderr during compilation
          // return reject(compileStderr);
        }

        // Execute Java class with input
        exec(
          `java -cp ${outputPath} ${jobId} < ${inputPath}`,
          (execError, stdout, stderr) => {
            if (execError) {
              return reject({ error: execError, stderr });
            }
            if (stderr) {
              return reject(stderr);
            }
            resolve(stdout);
          }
        );
      }
    );
  });
};

module.exports = {
  executeJava,
};
