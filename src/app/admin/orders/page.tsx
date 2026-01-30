"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { OrderListResponse, OrderResponse } from "@/types";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { getTrackingUrl } from "@/utils/cargoTracking";
import { XCircle, AlertCircle } from "lucide-react";

const statusOptions = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED"
];
const cargoFirmOptions = ["Yurtiçi", "Aras", "MNG", "PTT"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipmentDetails, setShipmentDetails] = useState<
    Record<number, { cargoFirm: string; trackingNumber: string }>
  >({});
  const [statusSelections, setStatusSelections] = useState<
    Record<number, string>
  >({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<OrderListResponse>("/admin/orders", {
        params: { page: 0, size: 50 },
      });
      setOrders(response.data.orders);
    } catch {
      toast.error("Siparişler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (order: OrderResponse, status: string) => {
    try {
      const details = shipmentDetails[order.id];
      const cargoFirm = (details?.cargoFirm ?? order.cargoFirm ?? "").trim();
      const trackingNumber = (
        details?.trackingNumber ??
        order.trackingNumber ??
        ""
      ).trim();
      
      const response = await api.put(`/admin/orders/${order.id}/status`, null, {
        params: {
          status,
          ...(status === "SHIPPED"
            ? { cargoFirm, trackingNumber }
            : {}),
        },
      });
      
      toast.success("Sipariş güncellendi.");
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? response.data : item)),
      );
      setStatusSelections((prev) => ({ ...prev, [order.id]: status }));
    } catch {
      toast.error("Sipariş güncellenemedi.");
    }
  };

  // --- TEK ÜRÜN İPTALİ ---
  const handleCancelItem = async (itemId: number) => {
    if (!confirm("Bu ürünü iptal etmek ve parasını iade etmek istediğinize emin misiniz?")) return;

    try {
      await api.put(`/orders/items/${itemId}/cancel`);
      toast.success("Ürün iptal edildi ve para iadesi başlatıldı.");
      fetchOrders(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ürün iptal edilemedi.");
    }
  };

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Sipariş Yönetimi
        </h1>
        <div className="space-y-4">
          {orders.map((order) => {
            const trackingUrl = getTrackingUrl(
              order.cargoFirm,
              order.trackingNumber,
            );
            return (
               <div key={order.id} className="border rounded-xl p-4 transition hover:shadow-sm">
                
                {/* ÜST KISIM (Sipariş No, Tarih, Select) */}
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500">
                      Sipariş #{order.id}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(order.totalPrice)}
                    </div>
                    {order.createdAt && (
                      <div className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleString("tr-TR")}
                      </div>
                    )}
                  </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusSelections[order.id] ?? order.status}
                        onChange={(event) => {
                          const nextStatus = event.target.value;
                        setStatusSelections((prev) => ({
                          ...prev,
                          [order.id]: nextStatus,
                        }));
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                      </select>
                      <Button
                        onClick={() =>
                          handleStatusChange(
                            order,
                            statusSelections[order.id] ?? order.status,
                          )
                        }
                        className="text-sm py-2"
                      >
                        Güncelle
                      </Button>
                    </div>
                  </div>

                {/* KARGO ALANI */}
                {(statusSelections[order.id] ?? order.status) === "SHIPPED" && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2 bg-blue-50 p-3 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Kargo Firması</label>
                      <select
                        id={`cargoFirm-${order.id}`}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
                        value={shipmentDetails[order.id]?.cargoFirm ?? order.cargoFirm ?? ""}
                        onChange={(event) => setShipmentDetails((prev) => ({...prev, [order.id]: { cargoFirm: event.target.value, trackingNumber: prev[order.id]?.trackingNumber ?? order.trackingNumber ?? ""}}))}
                      >
                         <option value="">Seçiniz</option>
                         {cargoFirmOptions.map((firm) => <option key={firm} value={firm}>{firm}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Takip Numarası</label>
                      <input
                        id={`trackingNumber-${order.id}`}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
                        value={shipmentDetails[order.id]?.trackingNumber ?? order.trackingNumber ?? ""}
                        onChange={(event) => setShipmentDetails((prev) => ({...prev, [order.id]: { cargoFirm: prev[order.id]?.cargoFirm ?? order.cargoFirm ?? "", trackingNumber: event.target.value}}))}
                      />
                    </div>
                  </div>
                )}
                
                {/* --- ÜRÜN LİSTESİ --- */}
                <div className="mt-4 border-t pt-4 space-y-2">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-2">Sipariş İçeriği</div>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center text-sm p-3 rounded-lg border transition ${
                        item.status === 'CANCELLED' 
                            ? 'bg-red-50 border-red-100' 
                            : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-medium ${item.status === 'CANCELLED' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {item.productName} 
                        </span>
                        <span className="text-xs text-gray-500">Adet: {item.quantity}</span>
                        
                        {item.status === 'CANCELLED' && (
                            <span className="text-[10px] text-red-600 font-bold flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" /> İPTAL EDİLDİ / İADE YAPILDI
                            </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={item.status === 'CANCELLED' ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}>
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          }).format(item.subtotal)}
                        </span>

                        {/* BUTON: Sadece Aktifse ve Kargolanmadıysa */}
                        {item.status !== 'CANCELLED' && order.status !== 'CANCELLED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && (
                            <button
                                onClick={() => handleCancelItem(item.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition group"
                                title="Bu ürünü iptal et ve para iadesi yap"
                            >
                                <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                 <div className="mt-3 text-sm text-gray-600 border-t pt-2 flex justify-between items-center">
                   <div>
                     {trackingUrl ? (
                       <a href={trackingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">🚚 Kargo Takip</a>
                     ) : <span className="text-gray-400 text-xs">Takip no girilmedi</span>}
                   </div>
                   {order.paymentId && <div className="text-xs text-gray-400">Ödeme ID: {order.paymentId}</div>}
                 </div>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                Henüz sipariş yok.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}