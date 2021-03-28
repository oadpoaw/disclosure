import { promises as fs } from 'fs';

export async function isFileExists(file_path: string): Promise<boolean> {
    try {
        await fs.access(file_path);
        return true;
    } catch (err) {
        return false;
    }
}