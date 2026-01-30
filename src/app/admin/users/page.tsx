"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { toast } from "react-toastify";
import { Search, Mail, X, Send, User as UserIcon, Users } from "lucide-react";

// --- TİPLER ---
interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLoginDate?: string;
}

// Mesaj Kategorileri
const categories = [
    { value: "OTHER", label: "Genel Bildirim" },
    { value: "REFUND", label: "İade Hakkında" },
    { value: "COMPLAINT", label: "Şikayet Yanıtı" },
];

const ONLINE_THRESHOLD_MINUTES = 15;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- MODAL STATE ---
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [messageData, setMessageData] = useState({ category: "OTHER", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  // --- VERİ ÇEKME ---
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

  // --- ONLINE DURUM HESAPLAMA (Senin Kodun) ---
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

  // --- MESAJ GÖNDERME İŞLEMİ ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSending(true);
    try {
      await api.post(`/contact/admin/send/${selectedUser.id}`, messageData);
      toast.success(`Mesaj ${selectedUser.firstName} adlı kullanıcıya iletildi.`);
      setSelectedUser(null); // Modalı kapat
      setMessageData({ category: "OTHER", subject: "", message: "" }); // Formu sıfırla
    } catch (error) {
      console.error(error);
      toast.error("Mesaj gönderilemedi.");
    } finally {
      setSending(false);
    }
  };

  // --- FİLTRELEME ---
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* BAŞLIK */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="mr-3 text-blue-600" /> Kullanıcı Yönetimi
        </h1>
      </div>

      {/* ARAMA */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="İsim veya E-posta ara..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLO */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-semibold uppercase">
              <tr>
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">E-posta</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                 <tr><td colSpan={5} className="p-8 text-center text-gray-500">Kullanıcı bulunamadı.</td></tr>
              ) : (
                filteredUsers.map((user) => {
                    const isOnline = onlineStatuses.get(user.id) ?? false;
                    return (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">
                            {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                                <span className="text-xs">
                                    {isOnline ? "Çevrimiçi" : user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleDateString("tr-TR") : "Hiç girmedi"}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => setSelectedUser(user)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition"
                                title="Mesaj Gönder"
                            >
                                <Mail className="w-5 h-5" />
                            </button>
                        </td>
                    </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MESAJ GÖNDERME MODALI --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
              <div>
                  <h2 className="text-lg font-bold text-blue-800 flex items-center">
                    <Send className="w-5 h-5 mr-2" /> Mesaj Gönder
                  </h2>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <UserIcon className="w-3 h-3 mr-1"/> Alıcı: {selectedUser.firstName} {selectedUser.lastName}
                  </p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-red-500 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={messageData.category}
                    onChange={(e) => setMessageData({...messageData, category: e.target.value})}
                >
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Örn: İadeniz Hakkında"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({...messageData, subject: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mesaj İçeriği</label>
                <textarea 
                  required 
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Kullanıcıya iletmek istediğiniz mesaj..."
                  value={messageData.message}
                  onChange={(e) => setMessageData({...messageData, message: e.target.value})}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center disabled:opacity-70 transition"
                >
                  {sending ? "Gönderiliyor..." : <><Send className="w-4 h-4 mr-2" /> Gönder</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}