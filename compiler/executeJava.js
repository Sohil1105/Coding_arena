const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Compiles and executes Java code with given input
const executeJava = (filepath, inputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(filepath, 'utf8');
      const classMatch = fileContent.match(/public\s+class\s+(\w+)/) || fileContent.match(/class\s+(\w+)/);
      if (!classMatch) {
        return reject({ error: 'No class declaration found in the Java code' });
      }
      const className = classMatch[1];
      const jobDir = path.join(path.dirname(filepath), path.basename(filepath).split('.')[0]);
      if (!fs.existsSync(jobDir)) {
        fs.mkdirSync(jobDir, { recursive: true });
      }
      const javaFile = path.join(jobDir, `${className}.java`);
      fs.writeFileSync(javaFile, fileContent);

      const compileCommand = `javac "${javaFile}" -d "${outputPath}"`;
      exec(compileCommand, (compileError, compileStdout, compileStderr) => {
        if (compileError) {
          fs.rm(jobDir, { recursive: true, force: true }, () => {});
          return reject({ error: compileError.message, stderr: compileStderr });
        }
        if (compileStderr) {
          console.warn(`Java compilation warnings for ${className}:`, compileStderr);
        }

        const executeCommand = `java -cp "${outputPath}" ${className} < "${inputPath}"`;
        exec(executeCommand, { timeout: 10000 }, (execError, stdout, stderr) => {
          // Clean up compiled class and temporary directory
          fs.rm(jobDir, { recursive: true, force: true }, () => {});
          const classFilePath = path.join(outputPath, `${className}.class`);
          fs.unlink(classFilePath, () => {});

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
    } catch (err) {
      reject({ error: err.message });
    }
  });
};

module.exports = {
  executeJava,
};
