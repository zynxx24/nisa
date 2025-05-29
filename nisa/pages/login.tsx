/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nip: ''
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
      const response = await axios.post('/api/user/login', formData);
      
      if (response.data.success) {
        // Save token to cookies
        Cookies.set('token', response.data.token, { expires: 1 });
        Cookies.set('user', JSON.stringify(response.data.user), { expires: 1 });
        
        toast.success('Login berhasil!');
        router.push('/user/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Login Karyawan</h1>
          <p className="text-gray-600">Silakan masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan email Anda"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan password Anda"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Masukkan NIP Anda"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-600">
            Belum punya akun?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
              Daftar di sini
            </Link>
          </p>
          
          <div className="border-t pt-4">
            <Link 
              href="/admin/login"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Login sebagai Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}