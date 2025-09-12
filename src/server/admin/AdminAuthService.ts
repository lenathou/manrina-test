import { JwtService } from '../services/JwtService';
import { IAdminTokenPayload } from './IAdmin';

const jwtService = new JwtService();

export function verifyAdminToken(token: string): IAdminTokenPayload | null {
  try {
    return jwtService.verifyToken(token);
  } catch (error) {
    return null;
  }
}

export function generateAdminToken(payload: Omit<IAdminTokenPayload, 'iat' | 'exp'>): string {
  return jwtService.generateToken(payload);
}