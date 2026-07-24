import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users } from './collections';

const JWT_SECRET = process.env.JWT_SECRET || 'physique-school-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  track: string;
  level: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await users.findById(decoded.userId);
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
