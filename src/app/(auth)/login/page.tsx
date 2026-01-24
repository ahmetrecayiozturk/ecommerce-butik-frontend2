"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend: AuthController -> login
      const response = await api.post('/auth/login', { email, password });
      const { token, role } = response.data;
      
      // Context üzerinden login ol ve yönlendir
      login(token, email, role);
    } catch (error: unknown) {
      const apiMessage =
        axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : null;
      const generalMessage = error instanceof Error ? error.message : null;

      toast.error(apiMessage ?? generalMessage ?? 'Giriş başarısız! Bilgileri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Giriş Yap</h1>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Email Adresi"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com"
          required
        />
        
        <Input
          label="Şifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="******"
          required
        />

        <Button type="submit" className="w-full mt-4" isLoading={loading}>
          Giriş Yap
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        Hesabın yok mu?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Kayıt Ol
        </Link>
      </div>
    </div>
  );
}