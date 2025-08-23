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

    public async findById(adminId: string): Promise<IAdmin | undefined> {
        return this.admins.find((admin) => admin.id === adminId);
    }

    public async createAdmin(username: string, password: string): Promise<IAdmin> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin: IAdmin = {
            id: (this.admins.length + 1).toString(),
            username,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.admins.push(newAdmin);
        return newAdmin;
    }

    public async updatePassword(adminId: string, newPassword: string): Promise<void> {
        const adminIndex = this.admins.findIndex((admin) => admin.id === adminId);
        if (adminIndex === -1) {
            throw new Error('Admin not found');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        this.admins[adminIndex].password = hashedPassword;
        this.admins[adminIndex].updatedAt = new Date();
    }

    public async deleteAdmin(adminId: string): Promise<void> {
        const adminIndex = this.admins.findIndex((admin) => admin.id === adminId);
        if (adminIndex === -1) {
            throw new Error('Admin not found');
        }
        this.admins.splice(adminIndex, 1);
    }

    public async listAdmins(): Promise<IAdmin[]> {
        return this.admins;
    }
}
