"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import Link from "next/link";
import { Send, CheckCircle, AlertCircle, History } from "lucide-react";

export default function ContactPage() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ category: "COMPLAINT", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const categories = [
    { value: "COMPLAINT", label: "Şikayet" },
    { value: "REFUND", label: "İade / Değişim" },
    { value: "SUGGESTION", label: "Öneri" },
    { value: "APPRECIATION", label: "Teşekkür" },
    { value: "OTHER", label: "Diğer" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.post("/contact", formData);
      setStatus("success");
      setFormData({ category: "COMPLAINT", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Giriş Yapmalısınız</h2>
        <p className="text-gray-600 mt-2">Destek ekibiyle iletişime geçmek için lütfen giriş yapın.</p>
        <Link href="/login" className="mt-4 inline-block text-blue-600 font-semibold hover:underline">Giriş Sayfası</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bize Ulaşın</h1>
        <Link href="/contact/my-messages" className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition">
           <History className="w-4 h-4 mr-2" /> Geçmiş Mesajlarım
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <p className="text-gray-500 mb-6">Bir sorunuz mu var? Aşağıdaki formu doldurun, en kısa sürede dönüş yapalım.</p>

        {status === "success" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800">Mesajınız Alındı!</h3>
            <p className="text-green-600">Ekibimiz en kısa sürede inceleyip size dönecektir.</p>
            <button onClick={() => setStatus("idle")} className="mt-4 text-green-700 underline text-sm">Yeni mesaj gönder</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Örn: Siparişim hakkında"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mesajınız</label>
              <textarea
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Sorunuzu detaylıca yazın..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button type="submit" disabled={status === "loading"} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-70">
              {status === "loading" ? <span>Gönderiliyor...</span> : <><Send className="w-5 h-5" /><span>Mesajı Gönder</span></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}