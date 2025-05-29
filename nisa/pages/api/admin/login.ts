import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateAdmin, generateToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email dan password harus diisi' 
      });
    }

    // Authenticate admin
    const admin = await authenticateAdmin(email, password);

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password admin tidak valid' 
      });
    }

    // Generate token
    const token = generateToken({ 
      adminId: admin.id, 
      email: admin.email, 
      role: 'admin' 
    });

    res.status(200).json({
      success: true,
      message: 'Login admin berhasil',
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}