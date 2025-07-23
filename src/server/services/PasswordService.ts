import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export class PasswordService {
    public async hash(plainPassword: string): Promise<string> {
        return bcrypt.hash(plainPassword, SALT_ROUNDS);
    }

    public async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}
