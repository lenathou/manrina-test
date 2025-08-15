import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRATION = '24h';

export class JwtService {
    public generateToken<T extends object>(payload: T): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
    }

    public verifyToken<T extends object>(token: string): T | null {
        try {
            return jwt.verify(token, JWT_SECRET) as T;
        } catch {
            return null;
        }
    }
}
