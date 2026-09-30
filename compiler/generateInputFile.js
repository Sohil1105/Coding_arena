const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const dirInputs = path.join(__dirname, 'inputs');

if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

// Creates a temporary file with user's input data
const generateInputFile = async (input) => {
    const input_filePath = path.join(dirInputs, `${randomUUID()}.txt`);
    fs.writeFileSync(input_filePath, input);
    return input_filePath;
};

module.exports = {
    generateInputFile,
};
