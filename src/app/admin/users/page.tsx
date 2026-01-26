"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLoginDate?: string;
}

const ONLINE_THRESHOLD_MINUTES = 15;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<AdminUser[]>("/admin/users");
      setUsers(response.data);
    } catch {
      toast.error("Kullanıcılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onlineStatuses = useMemo(() => {
    const now = Date.now();
    return new Map(
      users.map((user) => {
        if (!user.lastLoginDate) {
          return [user.id, false] as const;
        }
        const lastLogin = new Date(user.lastLoginDate).getTime();
        const minutesSinceLogin = (now - lastLogin) / 60000;
        return [user.id, minutesSinceLogin < ONLINE_THRESHOLD_MINUTES] as const;
      }),
    );
  }, [users]);

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-black mb-4">Kullanıcılar</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Ad Soyad</th>
                <th className="py-2">E-posta</th>
                <th className="py-2">Rol</th>
                <th className="py-2">Son Giriş</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isOnline = onlineStatuses.get(user.id) ?? false;
                return (
                  <tr key={user.id} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-3 text-gray-700">{user.id}</td>
                    <td className="py-3 font-medium text-gray-800">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 text-gray-600">{user.email}</td>
                    <td className="py-3 text-gray-600">{user.role}</td>
                    <td className="py-3 text-gray-500">
                      <div>
                        {user.lastLoginDate
                          ? new Date(user.lastLoginDate).toLocaleString("tr-TR")
                          : "—"}
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isOnline
                              ? "bg-green-500 animate-pulse"
                              : "bg-gray-400"
                          }`}
                        />
                        {isOnline ? "Aktif" : "Çevrimdışı"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-sm text-gray-500">Henüz kullanıcı yok.</div>
        )}
      </div>
    </div>
  );
}
