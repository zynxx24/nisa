/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest } from 'next';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

export interface JWTPayload {
  adminId?: number;
  userId?: number;
  email: string;
  role: 'admin' | 'user';
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Authenticate admin
export async function authenticateAdmin(email: string, password: string) {
  try {
    const admins = await query('SELECT * FROM admins WHERE email = ?', [email]);
    
    if (admins.length === 0) {
      return null;
    }

    const admin = admins[0];
    const isValidPassword = await comparePassword(password, admin.password);
    
    if (!isValidPassword) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

// Verify admin code
export async function verifyAdminCode(code: string): Promise<boolean> {
  try {
    const codes = await query(
      'SELECT * FROM admin_codes WHERE code = ? AND is_active = TRUE',
      [code]
    ) as any[];

    return codes.length > 0;
  } catch (error) {
    console.error('Admin code verification error:', error);
    return false;
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string, nip: string) {
  try {
    const users = await query(
      'SELECT * FROM users WHERE email = ? AND nip = ?', 
      [email, nip]
    );
    
    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      nip: user.nip
    };
  } catch (error) {
    console.error('User authentication error:', error);
    return null;
  }
}

// Verify admin token from request
export function verifyAdminToken(req: NextApiRequest): JWTPayload | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || payload.role !== 'admin') {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

// Verify user token from request
export function verifyUserToken(req: NextApiRequest): JWTPayload | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || payload.role !== 'user') {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

// Create admin account
export async function createAdmin(email: string, password: string) {
  try {
    // Check if admin already exists
    const existingAdmin = await query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existingAdmin.length > 0) {
      throw new Error('Admin dengan email ini sudah ada');
    }

    const hashedPassword = await hashPassword(password);
    const result = await query(
      'INSERT INTO admins (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    return {
      id: result.insertId,
      email
    };
  } catch (error) {
    console.error('Create admin error:', error);
    throw error;
  }
}

// Create user account
export async function createUser(email: string, username: string, password: string, nip: string) {
  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ? OR nip = ?', 
      [email, nip]
    );
    if (existingUser.length > 0) {
      throw new Error('User dengan email atau NIP ini sudah ada');
    }

    const hashedPassword = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (email, username, password, nip) VALUES (?, ?, ?, ?)',
      [email, username, hashedPassword, nip]
    );

    return {
      id: result.insertId,
      email,
      username,
      nip
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}