const { exec } = require("child_process");

// Executes Python code with given input
const executePython = (filepath, inputPath) => {
  const pythonBin = process.env.PYTHON_PATH || 'python3';
  return new Promise((resolve, reject) => {
    const executeCommand = `${pythonBin} "${filepath}" < "${inputPath}"`;
    exec(executeCommand, { timeout: 10000 }, (execError, stdout, stderr) => {
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
};

module.exports = {
  executePython,
};
