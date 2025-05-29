/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Camera, Calendar, Clock, User, LogOut } from 'lucide-react';

interface User {
  id: number;
  email: string;
  username: string;
  nip: string;
}

interface Attendance {
  id: number;
  photo_path: string;
  description: string;
  status: 'Hadir' | 'Izin';
  attendance_date: string;
  created_at: string;
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    status: 'Hadir' as 'Hadir' | 'Izin'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    if (user) {
      fetchAttendances();
    }
  }, [user]);

  const checkAuth = () => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push('/login');
    }
    setLoading(false);
  };

  const fetchAttendances = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('/api/user/attendances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendances(response.data.attendances || []);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Foto harus diupload');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Deskripsi harus diisi');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('photo', selectedFile);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);

      const token = Cookies.get('token');
      const response = await axios.post('/api/user/attendance', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Absensi berhasil disimpan!');
        setShowAttendanceForm(false);
        setFormData({ description: '', status: 'Hadir' });
        setSelectedFile(null);
        setPreviewUrl('');
        fetchAttendances();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan absensi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/login');
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendances.find(att => att.attendance_date === today);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const todayAttendance = getTodayAttendance();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Karyawan</h1>
                <p className="text-sm text-gray-600">Selamat datang, {user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">NIP</p>
              <p className="font-medium">{user?.nip}</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Absensi Hari Ini
            </h2>
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>

          {todayAttendance ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Absensi sudah tercatat - {todayAttendance.status}
                  </p>
                  <p className="text-sm text-green-600">
                    Waktu: {new Date(todayAttendance.created_at).toLocaleTimeString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      Belum absen hari ini
                    </p>
                    <p className="text-sm text-yellow-600">
                      Silakan isi formulir absensi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAttendanceForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Isi Absensi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Form Modal */}
        {showAttendanceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Form Absensi</h3>
                  <button
                    onClick={() => setShowAttendanceForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitAttendance} className="space-y-4">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto Absensi *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {previewUrl ? (
                          <div className="mb-4">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="mx-auto h-32 w-32 object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG maksimal 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tuliskan aktivitas atau keterangan..."
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Kehadiran
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'Hadir' | 'Izin'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Izin">Izin</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAttendanceForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Menyimpan...' : 'Simpan Absensi'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Recent Attendances */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Absensi</h2>
          </div>
          <div className="p-6">
            {attendances.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada data absensi</p>
            ) : (
              <div className="space-y-4">
                {attendances.slice(0, 10).map((attendance) => (
                  <div key={attendance.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendance.status === 'Hadir' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attendance.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(attendance.attendance_date).toLocaleDateString('id-ID')}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(attendance.created_at).toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mt-2">{attendance.description}</p>
                      </div>
                      {attendance.photo_path && (
                        <img 
                          src={`/uploads/${attendance.photo_path}`} 
                          alt="Foto absensi" 
                          className="h-16 w-16 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}