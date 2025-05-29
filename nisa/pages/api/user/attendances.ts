/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { query as executeQuery } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'user') {
      return res.status(401).json({ success: false, message: 'Token tidak valid' });
    }

    const userId = decoded.userId;

    // Get user's attendances
    const attendances = await executeQuery(
      'SELECT * FROM attendance WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    ) as any[];

    res.status(200).json({
      success: true,
      attendances
    });

  } catch (error) {
    console.error('Get attendances error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}