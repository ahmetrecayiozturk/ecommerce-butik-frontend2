"use client";

import { useState } from 'react';
import api from '@/services/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend: AuthController -> register
      await api.post('/auth/register', formData);
      toast.success('Kayıt başarılı! Lütfen giriş yapın.');
      router.push('/login');
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Kayıt Ol</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ad"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              label="Soyad"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Şifre (Min 6 karakter)"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />

        <Button type="submit" className="w-full mt-4" isLoading={loading}>
          Kayıt Ol
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        Zaten hesabın var mı?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Giriş Yap
        </Link>
      </div>
    </div>
  );
}