const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Compiles and executes Java code with given input
const executeJava = (filepath, inputPath) => {
  // Read the file to extract the class name
  const fileContent = fs.readFileSync(filepath, 'utf8');
  const classMatch = fileContent.match(/public class (\w+)/);
  if (!classMatch) {
    return reject({ error: 'No public class found in the Java file' });
  }
  const className = classMatch[1];

  // Rename the file to match the class name
  const newFilePath = path.join(path.dirname(filepath), `${className}.java`);
  fs.renameSync(filepath, newFilePath);

  const jobId = className;

  return new Promise((resolve, reject) => {
    const compileCommand = `javac ${newFilePath} -d ${outputPath}`;
    exec(compileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        // Compilation failed
        return reject({ error: compileError.message, stderr: compileStderr });
      }
      if (compileStderr) {
        // Compilation warnings or non-fatal errors
        // We can still proceed to execution, but might want to log this
        console.warn(`Java compilation warnings/errors for ${jobId}:`, compileStderr);
      }

      const executeCommand = `java -cp ${outputPath} ${jobId} < ${inputPath}`;
      exec(executeCommand, (execError, stdout, stderr) => {
        // Clean up compiled .class files after execution
        const classFilePath = path.join(outputPath, `${jobId}.class`);
        fs.unlink(classFilePath, (err) => {
          if (err) console.error(`Failed to delete ${classFilePath}:`, err);
        });

        if (execError) {
          // Execution failed
          return reject({ error: execError.message, stderr });
        }
        if (stderr) {
          // Runtime errors or messages to stderr
          return reject({ error: "Runtime Error", stderr });
        }
        resolve(stdout);
      });
    });
  });
};

module.exports = {
  executeJava,
};
