import bcrypt from 'bcryptjs';
import { IAdmin } from './IAdmin';

export class AdminRepository {
    private admins: IAdmin[] = [];

    constructor() {
        // Initialize with a default admin for development
        // In production, this should be loaded from a database
        this.createInitialAdmin();
    }

    private async createInitialAdmin() {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        this.admins.push({
            id: '1',
            username: 'admin',
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    public async findByUsername(username: string): Promise<IAdmin | undefined> {
        return this.admins.find((admin) => admin.username === username);
    }

    public async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}
