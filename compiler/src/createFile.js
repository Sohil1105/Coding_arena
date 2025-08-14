import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dirCodes = path.join(__dirname, './public/temp/codes');


const createFile = (extension, content) => {
    try {
        console.log(extension)
        if(!fs.existsSync(dirCodes)) {
            fs.mkdirSync(dirCodes, { recursive: true });
        }
        const jobId = uuidv4();
        const fileName = `${jobId}.${extension}`;
        const filePath = path.join(dirCodes, fileName);
        
        fs.writeFileSync(filePath, content);
        
        return {
            success: true,
            filePath,
            jobId
        };
    } catch (error) {
        console.error('Error creating file:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export default createFile;
