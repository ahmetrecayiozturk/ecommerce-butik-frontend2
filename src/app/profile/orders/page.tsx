"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { OrderListResponse, OrderResponse } from "@/types";
import { toast } from "react-toastify";
import { getTrackingUrl } from "@/utils/cargoTracking";
import { Package, XCircle, AlertCircle, Clock, CheckCircle } from "lucide-react";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Siparişleri Çek
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<OrderListResponse>("/orders", {
        params: { page: 0, size: 20, sort: "createdAt,desc" },
      });
      setOrders(response.data.orders);
    } catch {
      toast.error("Siparişleriniz yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // KISMİ İPTAL FONKSİYONU (Kullanıcı İçin)
  const handleCancelItem = async (itemId: number) => {
    if (!confirm("Bu ürünü iptal etmek istiyor musunuz? Ödemeniz kartınıza iade edilecektir.")) return;

    try {
      // Backend'deki "AnyRole" endpointine istek atıyoruz
      await api.put(`/orders/items/${itemId}/cancel`);
      toast.success("Ürün iptal edildi, para iadesi başlatıldı.");
      fetchOrders(); // Listeyi güncelle
    } catch (error: any) {
      toast.error(error.response?.data?.message || "İptal işlemi başarısız.");
    }
  };

  // Siparişin tamamını iptal etme (Opsiyonel)
  const handleCancelOrder = async (orderId: number) => {
      if (!confirm("Tüm siparişi iptal etmek istediğinize emin misiniz?")) return;
      try {
          await api.put(`/orders/${orderId}/cancel`);
          toast.success("Sipariş iptal edildi.");
          fetchOrders();
      } catch (error: any) {
          toast.error(error.response?.data?.message || "İptal başarısız.");
      }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Siparişleriniz yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Package className="text-blue-600" /> Siparişlerim
      </h1>

      <div className="space-y-6">
        {orders.length === 0 ? (
           <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed">
               <p className="text-gray-500">Henüz hiç sipariş vermediniz.</p>
           </div>
        ) : (
          orders.map((order) => {
            const trackingUrl = getTrackingUrl(order.cargoFirm, order.trackingNumber);
            const isOrderCancellable = order.status === 'PENDING' || order.status === 'PROCESSING';

            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                
                {/* SİPARİŞ BAŞLIĞI */}
                <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center border-b border-gray-100 gap-4">
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Sipariş Tarihi</div>
                        <div className="text-sm text-gray-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("tr-TR") : "-"}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Toplam Tutar</div>
                        <div className="text-sm font-bold text-gray-800">
                             {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.totalPrice)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Durum</div>
                        <div className={`text-sm font-bold flex items-center gap-1 
                            ${order.status === 'CANCELLED' ? 'text-red-600' : 
                              order.status === 'DELIVERED' ? 'text-green-600' : 'text-blue-600'}`}>
                            {order.status === 'PENDING' && <Clock className="w-3 h-3"/>}
                            {order.status === 'DELIVERED' && <CheckCircle className="w-3 h-3"/>}
                            {order.status}
                        </div>
                    </div>
                    
                    {/* TÜM SİPARİŞİ İPTAL BUTONU */}
                    {isOrderCancellable && (
                        <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                            Siparişi İptal Et
                        </button>
                    )}
                </div>

                {/* ÜRÜNLER */}
                <div className="p-4 space-y-3">
                    {order.items.map((item, idx) => (
                        <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border ${
                            item.status === 'CANCELLED' ? 'bg-red-50 border-red-100 opacity-75' : 'bg-white border-gray-100'
                        }`}>
                            <div className="flex flex-col">
                                <span className={`font-medium ${item.status === 'CANCELLED' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {item.productName}
                                </span>
                                <span className="text-xs text-gray-500">{item.quantity} Adet</span>
                                
                                {item.status === 'CANCELLED' && (
                                    <span className="text-[10px] text-red-600 font-bold flex items-center mt-1">
                                        <AlertCircle className="w-3 h-3 mr-1" /> İPTAL EDİLDİ
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-semibold text-gray-700">
                                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(item.subtotal)}
                                </span>

                                {/* TEK ÜRÜN İPTAL BUTONU (User) */}
                                {item.status !== 'CANCELLED' && isOrderCancellable && (
                                    <button 
                                        onClick={() => handleCancelItem(item.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                                        title="Bu ürünü iptal et"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FOOTER (Kargo vs) */}
                {(order.cargoFirm || order.trackingNumber) && (
                    <div className="bg-gray-50 p-3 text-xs flex justify-between items-center border-t border-gray-100">
                        <span className="text-gray-600">
                            Kargo: <strong>{order.cargoFirm}</strong> - Takip: <strong>{order.trackingNumber}</strong>
                        </span>
                        {getTrackingUrl(order.cargoFirm, order.trackingNumber) && (
                            <a 
                                href={getTrackingUrl(order.cargoFirm, order.trackingNumber)} 
                                target="_blank" 
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Kargo Takip
                            </a>
                        )}
                    </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}