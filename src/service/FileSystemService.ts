import fs from 'fs';
import path from 'path';
export interface IFileSystemService {
    writeFile(path: string, data: string | NodeJS.ArrayBufferView): void;
    readFile(path: string): string;
    doesFileExist(path: string): boolean;
}

export class FileSystemService implements IFileSystemService {
    private alreadyExistingFolders: Set<string> = new Set();
    private ensureFolderExists(folder: string) {
        if (!this.alreadyExistingFolders.has(folder)) {
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
            this.alreadyExistingFolders.add(folder);
        }
    }
    public writeFile(pathString: string, data: string | NodeJS.ArrayBufferView) {
        const folder = path.dirname(pathString);
        this.ensureFolderExists(folder);
        fs.writeFileSync(pathString, data);
    }
    public readFile(path: string) {
        return fs.readFileSync(path, 'utf8');
    }
    public doesFileExist(path: string) {
        return fs.existsSync(path);
    }
}
