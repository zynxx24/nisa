import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser, generateToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, nip } = req.body;

    // Validate input
    if (!email || !password || !nip) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, dan NIP harus diisi' 
      });
    }

    // Authenticate user
    const user = await authenticateUser(email, password, nip);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email, password, atau NIP tidak valid' 
      });
    }

    // Generate token
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: 'user' 
    });

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nip: user.nip
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}