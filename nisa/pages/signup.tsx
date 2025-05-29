/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    nip: '',
    adminCode: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/user/signup', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        nip: formData.nip,
        adminCode: formData.adminCode
      });
      
      if (response.data.success) {
        toast.success('Pendaftaran berhasil! Silakan login.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Daftar Akun</h1>
          <p className="text-gray-600">Buat akun karyawan baru</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan email Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan username Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIP
            </label>
            <input
              type="text"
              name="nip"
              value={formData.nip}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan NIP Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan password (min. 6 karakter)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Ulangi password Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Admin
            </label>
            <input
              type="text"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan kode admin"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-green-600 hover:text-green-800 font-semibold">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}