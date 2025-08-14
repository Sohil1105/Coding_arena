import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const inputDir = path.join(__dirname, './public/temp/input');


const createInputFile = (content) => {
    try {
        if(!fs.existsSync(inputDir)) {
            fs.mkdirSync(inputDir, { recursive: true });
        }
        const jobId = uuidv4();
        const fileName = `${jobId}.txt`;
        const filePath = path.join(inputDir, fileName);

        fs.writeFileSync(filePath, content);
        
        return {
            success: true,
            filePath,
        };
    } catch (error) {
        console.error('Error creating file:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export default createInputFile;