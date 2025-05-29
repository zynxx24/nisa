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
      const { description, status } = req.body;

      // Validate input
      if (!description || !status) {
        return res.status(400).json({
          success: false,
          message: 'Deskripsi dan status harus diisi'
        });
      }

      if (!['Hadir', 'Izin'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status harus Hadir atau Izin'
        });
      }

      // Update attendance
      await query(
        'UPDATE attendance SET description = ?, status = ?, updated_at = NOW() WHERE id = ?',
        [description, status, id]
      );

      res.status(200).json({
        success: true,
        message: 'Data absensi berhasil diupdate'
      });

    } else if (req.method === 'DELETE') {
      // Delete attendance record
      await query('DELETE FROM attendance WHERE id = ?', [id]);

      res.status(200).json({
        success: true,
        message: 'Data absensi berhasil dihapus'
      });

    } else {
      res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('Admin edit attendance API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}