#!/usr/bin/env node
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const os = require('os');

const executeCpp = (filepath, input) => {
    const jobId = path.basename(filepath).split(".")[0];
    const isWindows = os.platform() === 'win32';
    const ext = isWindows ? '.exe' : '.out';
    const outPath = path.join(outputPath, `${jobId}${ext}`);

    return new Promise((resolve, reject) => {
        exec(`g++ ${filepath} -o ${outPath}`, (error, stdout, stderr) => {
            if (error || stderr) {
                return reject({ error, stderr });
            }
            const runCmd = isWindows ? `.${path.sep}${jobId}${ext}` : `./${jobId}${ext}`;
            const child = exec(runCmd, { cwd: outputPath }, (error, stdout, stderr) => {
                if (error || stderr) {
                    return reject({ error, stderr });
                }
                resolve(stdout);
            });
            if (input) {
                child.stdin.write(input);
                child.stdin.end();
            }
        });
    });
};

const executePython = (filepath, input) => {
    return new Promise((resolve, reject) => {
        const child = exec(`python3 ${filepath}`, (error, stdout, stderr) => {
            if (error) {
                return reject({ error, stderr });
            }
            if (stderr) {
                return reject(stderr);
            }
            resolve(stdout);
        });
        if (input) {
            child.stdin.write(input);
            child.stdin.end();
        }
    });
};

const executeJava = (filepath, input) => {
    const className = path.basename(filepath, '.java');
    const inputPath = path.join(outputPath, `${className}.txt`);

    return new Promise((resolve, reject) => {
        fs.writeFileSync(inputPath, input);

        exec(`javac -d ${outputPath} ${filepath}`, (error, stdout, stderr) => {
            if (error || stderr) {
                return reject({ error, stderr });
            }
            exec(`java -cp ${outputPath} ${className} < ${inputPath}`, (error, stdout, stderr) => {
                if (error || stderr) {
                    return reject({ error, stderr });
                }
                resolve(stdout);
            });
        });
    });
};

const executeC = (filepath, input) => {
    const jobId = path.basename(filepath).split(".")[0];
    const isWindows = os.platform() === 'win32';
    const ext = isWindows ? '.exe' : '.out';
    const outPath = path.join(outputPath, `${jobId}${ext}`);

    return new Promise((resolve, reject) => {
        exec(`gcc ${filepath} -o ${outPath}`, (error, stdout, stderr) => {
            if (error || stderr) {
                return reject({ error, stderr });
            }
            const runCmd = isWindows ? `.${path.sep}${jobId}${ext}` : `./${jobId}${ext}`;
            const child = exec(runCmd, { cwd: outputPath }, (error, stdout, stderr) => {
                if (error || stderr) {
                    return reject({ error, stderr });
                }
                resolve(stdout);
            });
            if (input) {
                child.stdin.write(input);
                child.stdin.end();
            }
        });
    });
};

module.exports = {
    executeCpp,
    executePython,
    executeJava,
    executeC,
};
