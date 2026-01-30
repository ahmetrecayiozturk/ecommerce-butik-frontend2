"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Mail, User, Calendar, CheckCircle, X, MessageCircle, RefreshCw, Filter, Search } from "lucide-react";

interface ContactMessage {
  id: number;
  category: "COMPLAINT" | "REFUND" | "SUGGESTION" | "APPRECIATION" | "OTHER";
  subject: string;
  message: string;
  user: { firstName: string; lastName: string; email: string; };
  createdAt: string;
  status: "UNREAD" | "READ";
}

const categoryConfig: Record<string, { label: string, color: string }> = {
    ALL: { label: "Tümü", color: "bg-gray-100 text-gray-700" },
    COMPLAINT: { label: "Şikayet", color: "bg-red-100 text-red-700 border-red-200" },
    REFUND: { label: "İade/Değişim", color: "bg-orange-100 text-orange-700 border-orange-200" },
    SUGGESTION: { label: "Öneri", color: "bg-blue-100 text-blue-700 border-blue-200" },
    APPRECIATION: { label: "Teşekkür", color: "bg-green-100 text-green-700 border-green-200" },
    OTHER: { label: "Diğer", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await api.get("/contact/admin");
      setMessages(response.data);
    } catch (error) {
      console.error("Mesajlar yüklenemedi", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (msg: ContactMessage) => {
    if (msg.status === "READ") return;
    try {
      await api.put(`/contact/${msg.id}/read`);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: "READ" } : m));
      if (selectedMessage?.id === msg.id) setSelectedMessage({ ...msg, status: "READ" });
    } catch (error) { console.error("Hata", error); }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesCategory = selectedCategory === "ALL" || msg.category === selectedCategory;
    const matchesSearch = 
        msg.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Mail className="mr-3 text-blue-600" /> Destek Paneli
        </h1>
        <button onClick={fetchMessages} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><RefreshCw className="w-5 h-5 text-gray-600" /></button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="İsim veya konu ara..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-sm text-gray-600 flex items-center"><Filter className="w-4 h-4 mr-2" /> Kategoriler</div>
                <div className="flex flex-col">
                    {Object.entries(categoryConfig).map(([key, config]) => {
                        const count = key === "ALL" ? messages.length : messages.filter(m => m.category === key).length;
                        return (
                            <button key={key} onClick={() => setSelectedCategory(key)} className={`flex justify-between items-center px-4 py-3 text-sm transition text-left ${selectedCategory === key ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600" : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"}`}>
                                <span>{config.label}</span>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-gray-200 shadow-sm">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="w-full lg:w-3/4">
            {loading ? <div className="text-center py-20 text-gray-500">Yükleniyor...</div> : filteredMessages.length === 0 ? <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300"><MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Mesaj bulunamadı.</p></div> : (
                <div className="space-y-3">
                    {filteredMessages.map((msg) => (
                        <div key={msg.id} onClick={() => { setSelectedMessage(msg); markAsRead(msg); }} className={`group cursor-pointer bg-white p-5 rounded-xl border transition hover:shadow-md flex justify-between items-center ${msg.status === 'UNREAD' ? 'border-l-4 border-l-blue-500 border-gray-200' : 'border-gray-100 opacity-90'}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-1">
                                    <h3 className={`text-base truncate mr-3 ${msg.status === 'UNREAD' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.user.firstName} {msg.user.lastName}</h3>
                                    {msg.status === 'UNREAD' && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">YENİ</span>}
                                </div>
                                <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
                                <div className="flex items-center mt-2 space-x-3">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${categoryConfig[msg.category]?.color || 'bg-gray-100'}`}>{categoryConfig[msg.category]?.label}</span>
                                    <span className="text-xs text-gray-400 flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(msg.createdAt).toLocaleDateString("tr-TR")}</span>
                                </div>
                            </div>
                            <div className="ml-4 flex items-center text-gray-300 group-hover:text-blue-500 transition"><span className="text-sm mr-2 hidden sm:block">Oku</span><MessageCircle className="w-5 h-5" /></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedMessage(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1"><h2 className="text-xl font-bold text-gray-800">{selectedMessage.subject}</h2><span className={`text-xs px-2 py-1 rounded border ${categoryConfig[selectedMessage.category]?.color}`}>{categoryConfig[selectedMessage.category]?.label}</span></div>
                        <p className="text-sm text-gray-500 flex items-center"><User className="w-4 h-4 mr-1" /> {selectedMessage.user.firstName} {selectedMessage.user.lastName} <span className="mx-2">•</span> {selectedMessage.user.email}</p>
                    </div>
                    <button onClick={() => setSelectedMessage(null)} className="p-1 hover:bg-gray-200 rounded-full transition"><X className="w-6 h-6 text-gray-500" /></button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto"><p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{selectedMessage.message}</p></div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center"><span className="text-xs text-gray-400">{new Date(selectedMessage.createdAt).toLocaleString("tr-TR")}</span><div className="flex items-center text-green-600 text-sm font-semibold"><CheckCircle className="w-4 h-4 mr-2" /> Okundu</div></div>
            </div>
        </div>
      )}
    </div>
  );
}