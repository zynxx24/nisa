import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminToken } from '../../../lib/auth';
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify admin token
    const adminData = verifyAdminToken(req);
    if (!adminData) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token admin tidak valid' 
      });
    }

    if (req.method === 'GET') {
      // Get all attendance with user details
      const attendance = await query(`
        SELECT 
          a.id,
          a.user_id,
          u.username as user_name,
          u.nip as user_nip,
          a.photo_url,
          a.description,
          a.status,
          a.created_at,
          a.updated_at
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
      `);

      res.status(200).json({
        success: true,
        attendance
      });

    } else {
      res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('Admin attendance API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}