/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { createUser, verifyAdminCode } from '../../../lib/auth';
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, username, password, nip, adminCode } = req.body;

    // Validate input
    if (!email || !username || !password || !nip || !adminCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Semua field harus diisi' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password minimal 6 karakter' 
      });
    }

    // Verify admin code
    const isValidAdminCode = await verifyAdminCode(adminCode);
    if (!isValidAdminCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kode admin tidak valid' 
      });
    }

    // Check if email already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE email = ? OR nip = ?',
      [email, nip]
    ) as any[];

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.email === email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email sudah terdaftar' 
        });
      }
      if (existingUser.nip === nip) {
        return res.status(400).json({ 
          success: false, 
          message: 'NIP sudah terdaftar' 
        });
      }
    }

    // Create user
    const userCreated = await createUser(
      email,
      username,
      password,
      nip
    );

    if (!userCreated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gagal membuat akun' 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}