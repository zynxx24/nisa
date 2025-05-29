/* eslint-disable @typescript-eslint/no-explicit-any */
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
      // Get all attendance data with user details
      const attendanceData = await query(`
        SELECT 
          u.username as 'Nama',
          u.nip as 'NIP',
          u.email as 'Email',
          a.description as 'Deskripsi',
          a.status as 'Status',
          DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as 'Tanggal_Absensi'
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
      `);

      // Convert to CSV
      if (attendanceData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tidak ada data untuk diekspor'
        });
      }

      // Get headers from first row
      const headers = Object.keys(attendanceData[0]);
      let csv = headers.join(',') + '\n';

      // Add data rows
      attendanceData.forEach((row: any) => {
        const values = headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csv += values.join(',') + '\n';
      });

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance_data_${new Date().toISOString().split('T')[0]}.csv`);
      
      res.status(200).send(csv);

    } else {
      res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('Admin export API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}