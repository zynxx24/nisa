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
      // Get total users
      const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
      const totalUsers = totalUsersResult[0].count;

      // Get total attendance
      const totalAttendanceResult = await query('SELECT COUNT(*) as count FROM attendance');
      const totalAttendance = totalAttendanceResult[0].count;

      // Get today's attendance
      const todayAttendanceResult = await query(
        'SELECT COUNT(*) as count FROM attendance WHERE DATE(created_at) = CURDATE()'
      );
      const todayAttendance = todayAttendanceResult[0].count;

      // Get today's present count
      const presentTodayResult = await query(
        'SELECT COUNT(*) as count FROM attendance WHERE DATE(created_at) = CURDATE() AND status = "Hadir"'
      );
      const presentToday = presentTodayResult[0].count;

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalAttendance,
          todayAttendance,
          presentToday
        }
      });

    } else {
      res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('Admin stats API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}