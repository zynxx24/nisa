/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { 
  Users, 
  Clock, 
  Calendar, 
  Settings, 
  LogOut, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Download,
  UserCheck,
  UserX
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  username: string;
  nip: string;
  created_at: string;
}

interface Attendance {
  id: number;
  user_id: number;
  user_name: string;
  user_nip: string;
  photo_url: string;
  description: string;
  status: 'Hadir' | 'Izin';
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'attendance'>('attendance');
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Hadir' | 'Izin'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAttendance: 0,
    todayAttendance: 0,
    presentToday: 0
  });
  
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = Cookies.get('admin_token');
    if (!token) {
      router.push('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, attendanceRes, statsRes] = await Promise.all([
        axios.get('/api/admin/user', {
          headers: { Authorization: `Bearer ${Cookies.get('admin_token')}` }
        }),
        axios.get('/api/admin/attendance', {
          headers: { Authorization: `Bearer ${Cookies.get('admin_token')}` }
        }),
        axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${Cookies.get('admin_token')}` }
        })
      ]);

      setUsers(usersRes.data.users || []);
      setAttendance(attendanceRes.data.attendance || []);
      setStats(statsRes.data.stats || {});
    } catch (error: any) {
      toast.error('Gagal memuat data');
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('admin_token');
    Cookies.remove('admin');
    router.push('/admin/login');
  };

  const handleEditUser = async (userData: Partial<User>) => {
    try {
      const response = await axios.put(
        `/api/admin/users/${editingUser?.id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${Cookies.get('admin_token')}` }
        }
      );

      if (response.data.success) {
        toast.success('Data user berhasil diupdate');
        setEditingUser(null);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate user');
    }
  };

  const handleEditAttendance = async (attendanceData: Partial<Attendance>) => {
    try {
      const response = await axios.put(
        `/api/admin/attendance/${editingAttendance?.id}`,
        attendanceData,
        {
          headers: { Authorization: `Bearer ${Cookies.get('admin_token')}` }
        }
      );

      if (response.data.success) {
        toast.success('Data absensi berhasil diupdate');
        setEditingAttendance(null);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate absensi');
    }
  };

  const handleDeleteAttendance = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data absensi ini?')) return;

    try {
      const response = await axios.delete(`/api/admin/attendance/${id}`, {
        headers: { Authorization: `Bearer ${Cookies.get('admin_token')}` }
      });

      if (response.data.success) {
        toast.success('Data absensi berhasil dihapus');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus absensi');
    }
  };

  const filteredAttendance = attendance.filter(item => {
    const matchesSearch = item.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.user_nip.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportData = async () => {
    try {
      const response = await axios.get('/api/admin/export', {
        headers: { Authorization: `Bearer ${Cookies.get('admin_token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Gagal mengexport data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Karyawan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Absensi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttendance}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absensi Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAttendance}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hadir Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900">{stats.presentToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'attendance'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Data Absensi
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Data Karyawan
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'attendance' && (
              <div>
                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Cari nama atau NIP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Hadir' | 'Izin')}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">Semua Status</option>
                      <option value="Hadir">Hadir</option>
                      <option value="Izin">Izin</option>
                    </select>
                  </div>
                  <button
                    onClick={exportData}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Attendance Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Karyawan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Foto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAttendance.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.user_name}</div>
                              <div className="text-sm text-gray-500">NIP: {item.user_nip}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setViewingPhoto(item.photo_url)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {item.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ 
                              item.status === 'Hadir' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingAttendance(item)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAttendance(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NIP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal Daftar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.nip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit User</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEditUser({
                  username: formData.get('username') as string,
                  email: formData.get('email') as string,
                  nip: formData.get('nip') as string
                });
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  defaultValue={editingUser.username}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingUser.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">NIP</label>
                <input
                  type="text"
                  name="nip"
                  defaultValue={editingUser.nip}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {editingAttendance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Absensi</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEditAttendance({
                  description: formData.get('description') as string,
                  status: formData.get('status') as 'Hadir' | 'Izin'
                });
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  name="description"
                  defaultValue={editingAttendance.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  defaultValue={editingAttendance.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingAttendance(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Foto Absensi</h3>
              <button
                onClick={() => setViewingPhoto(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="text-center">
              <Image
                src={viewingPhoto}
                alt="Foto Absensi"
                width={500}
                height={400}
                className="mx-auto rounded-lg"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}