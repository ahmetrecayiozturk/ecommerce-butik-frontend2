"use client";

import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { ChangePasswordRequest, UpdateUserRequest, User } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

const initialProfileForm: UpdateUserRequest = {
  firstName: '',
  lastName: ''
};

const initialPasswordForm: ChangePasswordRequest = {
  currentPassword: '',
  newPassword: ''
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [profileForm, setProfileForm] = useState<UpdateUserRequest>(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>(initialPasswordForm);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<User>('/users/me');
      setProfile(response.data);
      setProfileForm({
        firstName: response.data.firstName,
        lastName: response.data.lastName
      });
    } catch {
      toast.error("Profil yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.put<User>('/users/me', profileForm);
      setProfile(response.data);
      toast.success("Profil güncellendi.");
    } catch {
      toast.error("Profil güncellenemedi.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPassword(true);
    try {
      await api.put('/users/me/password', passwordForm);
      toast.success("Şifre güncellendi.");
      setPasswordForm(initialPasswordForm);
    } catch {
      toast.error("Şifre güncellenemedi.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  if (!profile) {
    return <div className="text-center py-20">Profil bulunamadı.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profilim</h1>
        <p className="text-sm text-gray-500">Hesap bilgilerinizi güncelleyin.</p>
        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-2">
          <Input label="Email" value={profile.email} disabled />
          <Input
            label="Ad"
            value={profileForm.firstName}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))
            }
            required
          />
          <Input
            label="Soyad"
            value={profileForm.lastName}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))
            }
            required
          />
          <Button type="submit" isLoading={savingProfile}>
            Kaydet
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Şifre Değiştir</h2>
        <p className="text-sm text-gray-500">Hesabınızı güvende tutmak için şifrenizi güncelleyin.</p>
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-2">
          <Input
            label="Mevcut Şifre"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
            required
          />
          <Input
            label="Yeni Şifre"
            type="password"
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
            }
            minLength={8}
            required
          />
          <Button type="submit" variant="outline" isLoading={savingPassword}>
            Şifreyi Güncelle
          </Button>
        </form>
      </div>
    </div>
  );
}
