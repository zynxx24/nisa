import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { verifyToken } from '../../../lib/auth';
import { query as executeQuery } from '../../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    // Check if user already submitted attendance today
    const today = new Date().toISOString().split('T')[0];
    const existingAttendance = await executeQuery(
      'SELECT * FROM attendance WHERE user_id = ? AND created_at = ?',
      [userId, today]
    ) as { id: number }[];

    if (existingAttendance.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Anda sudah absen hari ini' 
      });
    }

    // Parse form data
    const form = new IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const status = Array.isArray(fields.status) ? fields.status[0] : fields.status;
    const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;

    if (!photo || !description || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Foto, deskripsi, dan status harus diisi' 
      });
    }

    // Validate file type
    if (!photo.mimetype?.startsWith('image/')) {
      return res.status(400).json({ 
        success: false, 
        message: 'File harus berupa gambar' 
      });
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(photo.originalFilename || '');
    const filename = `attendance_${userId}_${timestamp}${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Move uploaded file
    const fileData = await fs.readFile(photo.filepath);
    await fs.writeFile(filepath, new Uint8Array(fileData));

    // Save to database
    await executeQuery(
      'INSERT INTO attendance (user_id, photo_url, description, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [userId, filename, description, status, today]
    );

    res.status(201).json({
      success: true,
      message: 'Absensi berhasil disimpan'
    });

  } catch (error) {
    console.error('Attendance submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
}