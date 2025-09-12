const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Executes Python code with given input
const executePython = (filepath, inputPath) => {
  return new Promise((resolve, reject) => {
const executeCommand = `"C:\\Users\\soura\\AppData\\Local\\Programs\\Python\\Python312\\python.exe" ${filepath} < ${inputPath}`;
    exec(executeCommand, (execError, stdout, stderr) => {
      if (execError) {
        return reject({ error: execError.message, stderr });
      }
      if (stderr) {
        return reject({ error: "Runtime Error", stderr });
      }
      resolve(stdout);
    });
  });
};

module.exports = {
  executePython,
};
