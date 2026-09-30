const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const dirCodes = path.join(__dirname, 'codes');

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

// Creates a temporary file with user's code content
const generateFile = async (format, content) => {
    const filePath = path.join(dirCodes, `${randomUUID()}.${format}`);
    fs.writeFileSync(filePath, content);
    return filePath;
};

module.exports = {
    generateFile,
};
