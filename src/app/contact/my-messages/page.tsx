"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { MessageSquare, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MyMessage {
  id: number;
  category: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "UNREAD" | "READ" | "RESOLVED";
}

const categoryMap: Record<string, string> = {
    COMPLAINT: "Şikayet",
    REFUND: "İade/Değişim",
    SUGGESTION: "Öneri",
    APPRECIATION: "Teşekkür",
    OTHER: "Diğer"
};

const statusMap: Record<string, { label: string, class: string }> = {
    UNREAD: { label: "İletildi", class: "bg-gray-100 text-gray-600" },
    READ: { label: "İnceleniyor", class: "bg-blue-100 text-blue-600" },
    RESOLVED: { label: "Çözüldü", class: "bg-green-100 text-green-600" }
};

export default function MyMessagesPage() {
  const [messages, setMessages] = useState<MyMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get("/contact/my-messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Mesajlar alınamadı", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-8">
        <Link href="/contact" className="mr-4 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Mesaj Geçmişim</h1>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz gönderdiğiniz bir destek mesajı yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {categoryMap[msg.category] || msg.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{msg.subject}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(msg.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusMap[msg.status]?.class || 'bg-gray-100'}`}>
                        {statusMap[msg.status]?.label || msg.status}
                    </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}