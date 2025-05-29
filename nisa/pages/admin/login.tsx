/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    try {
      const response = await axios.post('/api/admin/login', formData);
      
      if (response.data.success) {
        // Save token to cookies
        Cookies.set('admin_token', response.data.token, { expires: 1 });
        Cookies.set('admin', JSON.stringify(response.data.admin), { expires: 1 });
        
        toast.success('Login admin berhasil!');
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Login Admin</h1>
          <p className="text-gray-600">Masuk ke panel administrasi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Admin
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan email admin"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan password admin"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk sebagai Admin'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Kembali ke login karyawan
          </Link>
        </div>
      </div>
    </div>
  );
}