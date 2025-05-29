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

    const { id } = req.query;

    if (req.method === 'PUT') {
      const { username, email, nip } = req.body;

      // Validate input
      if (!username || !email || !nip) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, dan NIP harus diisi'
        });
      }

      // Check if email or NIP already exists (excluding current user)
      const existingUser = await query(
        'SELECT id FROM users WHERE (email = ? OR nip = ?) AND id != ?',
        [email, nip, id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email atau NIP sudah digunakan oleh user lain'
        });
      }

      // Update user
      await query(
        'UPDATE users SET username = ?, email = ?, nip = ?, updated_at = NOW() WHERE id = ?',
        [username, email, nip, id]
      );

      res.status(200).json({
        success: true,
        message: 'Data user berhasil diupdate'
      });

    } else if (req.method === 'DELETE') {
      // Delete user and related attendance data
      await query('DELETE FROM attendance WHERE user_id = ?', [id]);
      await query('DELETE FROM users WHERE id = ?', [id]);

      res.status(200).json({
        success: true,
        message: 'User berhasil dihapus'
      });

    } else {
      res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('Admin edit user API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}