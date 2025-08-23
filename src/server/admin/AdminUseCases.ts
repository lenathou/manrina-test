import { JwtService } from '../services/JwtService';
import { IAdmin, IAdminLoginPayload, IAdminLoginResponse, IAdminTokenPayload } from './IAdmin';
import { IAdminRepository } from './IAdminRepository';

export class AdminUseCases {
    constructor(
        private adminRepository: IAdminRepository,
        private jwtService: JwtService,
    ) {}

    public async login(payload: IAdminLoginPayload): Promise<IAdminLoginResponse> {
        const admin = await this.adminRepository.findByUsername(payload.username);

        if (!admin) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.adminRepository.verifyPassword(payload.password, admin.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(admin);
        return {
            success: true,
            jwt: token,
        };
    }

    public verifyToken(token: string): IAdminTokenPayload | null {
        return this.jwtService.verifyToken(token);
    }

    public async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<void> {
        const admin = await this.adminRepository.findById(adminId);
        if (!admin) {
            throw new Error('Admin not found');
        }

        const isCurrentPasswordValid = await this.adminRepository.verifyPassword(currentPassword, admin.password);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        await this.adminRepository.updatePassword(adminId, newPassword);
    }

    private generateToken(admin: IAdmin): string {
        const payload: Omit<IAdminTokenPayload, 'iat' | 'exp'> = {
            id: admin.id,
            username: admin.username,
        };

        return this.jwtService.generateToken(payload);
    }
}
