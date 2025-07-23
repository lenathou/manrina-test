import { IAdmin } from './IAdmin';

export interface IAdminRepository {
    findByUsername(username: string): Promise<IAdmin | undefined>;
    verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    createAdmin(username: string, password: string): Promise<IAdmin>;
    updatePassword(adminId: string, newPassword: string): Promise<void>;
    deleteAdmin(adminId: string): Promise<void>;
    listAdmins(): Promise<IAdmin[]>;
}
