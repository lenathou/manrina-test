import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../services/PasswordService';
import { IAdmin } from './IAdmin';
import { IAdminRepository } from './IAdminRepository';

const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;

export class AdminRepositoryPrismaImplementation implements IAdminRepository {
    constructor(
        private prisma: PrismaClient,
        private passwordService: PasswordService,
    ) {
        this.initializeDefaultAdmin();
    }

    private async initializeDefaultAdmin() {
        try {
            // Check if any admin exists
            const adminCount = await this.prisma.admin.count();

            if (adminCount === 0) {
                if (!DEFAULT_ADMIN_PASSWORD) {
                    console.error(
                        'No DEFAULT_ADMIN_PASSWORD provided in environment variables. Skipping default admin creation.',
                    );
                    return;
                }

                const hashedPassword = await this.passwordService.hash(DEFAULT_ADMIN_PASSWORD);
                await this.prisma.admin.create({
                    data: {
                        username: DEFAULT_ADMIN_USERNAME,
                        password: hashedPassword,
                    },
                });
                console.log(`Default admin account created with username: ${DEFAULT_ADMIN_USERNAME}`);
            }
        } catch (error) {
            console.error('Error initializing default admin:', error);
        }
    }

    public async findByUsername(username: string): Promise<IAdmin | undefined> {
        const admin = await this.prisma.admin.findUnique({
            where: { username },
        });

        return admin || undefined;
    }

    public async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return this.passwordService.verify(plainPassword, hashedPassword);
    }

    public async createAdmin(username: string, password: string): Promise<IAdmin> {
        const hashedPassword = await this.passwordService.hash(password);

        return this.prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
    }

    public async updatePassword(adminId: string, newPassword: string): Promise<void> {
        const hashedPassword = await this.passwordService.hash(newPassword);

        await this.prisma.admin.update({
            where: { id: adminId },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
            },
        });
    }

    public async deleteAdmin(adminId: string): Promise<void> {
        await this.prisma.admin.delete({
            where: { id: adminId },
        });
    }

    public async listAdmins(): Promise<IAdmin[]> {
        return this.prisma.admin.findMany({
            orderBy: { username: 'asc' },
        });
    }
}
