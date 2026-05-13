"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/services/api";
import OrderService from "@/services/order.service";
import ReturnService from "@/services/return.service";
import { OrderListResponse, OrderResponse, OrderStatus } from "@/types";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getTrackingUrl } from "@/utils/cargoTracking";
import { XCircle, AlertCircle } from "lucide-react";

const cancellableStatuses: OrderStatus[] = ["PENDING", "PROCESSING"];
const returnableStatuses: OrderStatus[] = ["DELIVERED"];
const trackableStatuses: OrderStatus[] = ["SHIPPED", "DELIVERED"];
const placeholderValue = "—";

function OrdersContent() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<OrderResponse | null>(null);
  
  const [returnForm, setReturnForm] = useState({
    reason: "",
  });
  
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  const hasShownPaymentSuccess = useRef(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const ordersResponse = await api.get<OrderListResponse>("/orders", {
        params: { page: 0, size: 50 },
      });
      setOrders(ordersResponse.data.orders);
    } catch {
      toast.error("Siparişler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const paymentSuccess = useMemo(
    () => searchParams.get("payment") === "success",
    [searchParams]
  );

  useEffect(() => {
    if (paymentSuccess && !hasShownPaymentSuccess.current) {
      toast.success("Ödeme Başarılı");
      refreshCart();
      hasShownPaymentSuccess.current = true;
    }
  }, [paymentSuccess, refreshCart]);

  // --- TÜM SİPARİŞİ İPTAL ETME ---
  const handleCancel = async (orderId: number) => {
    setConfirmingOrderId(orderId);
  };

  const confirmCancel = async () => {
    if (!confirmingOrderId) return;
    const orderId = confirmingOrderId;
    setConfirmingOrderId(null);
    setProcessingId(orderId);
    try {
      await OrderService.cancel(orderId);
      toast.success("Sipariş iptal edildi.");
      fetchOrders();
    } catch {
      toast.error("Sipariş iptal edilemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  // --- YENİ: TEK ÜRÜN İPTAL ETME ---
  const handleCancelItem = async (itemId: number) => {
    if (!confirm("Bu ürünü iptal etmek istiyor musunuz? Ödemeniz kartınıza iade edilecektir.")) return;

    try {
      await api.put(`/orders/items/${itemId}/cancel`);
      toast.success("Ürün iptal edildi, para iadesi başlatıldı.");
      fetchOrders(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "İptal işlemi başarısız.");
    }
  };

  // --- İADE MODALI İŞLEMLERİ ---
  const openReturnModal = (order: OrderResponse) => {
    setReturnForm({
      reason: "",
    });
    setReturnModalOrder(order);
  };

  const submitReturnRequest = async () => {
    if (!returnModalOrder) return;
    if (!returnForm.reason.trim()) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    setProcessingId(returnModalOrder.id);
    try {
      const payload = { reason: returnForm.reason.trim() };
      await ReturnService.requestReturn(returnModalOrder.id, payload);
      toast.success("İade talebi oluşturuldu.");
      setReturnModalOrder(null);
      fetchOrders();
    } catch {
      toast.error("İade talebi oluşturulamadı.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {paymentSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          Ödeme Başarılı
        </div>
      )}
      
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Siparişlerim</h1>
        
        <div className="space-y-6">
          {orders.map((order) => {
            const trackingUrl = getTrackingUrl(order.cargoFirm, order.trackingNumber);
            const hasReturnRequest = order.status === "RETURN_REQUESTED";
            const hasTrackingNumber = Boolean(order.trackingNumber);
            const isOrderCancellable = cancellableStatuses.includes(order.status);

            return (
              <div key={order.id} className="border rounded-xl p-4 space-y-4 shadow-sm hover:shadow-md transition">
                
                {/* SİPARİŞ BAŞLIĞI VE DURUMU */}
                <div className="flex flex-wrap justify-between gap-4 border-b pb-4">
                  <div>
                    <div className="text-sm text-gray-500">Sipariş #{order.id}</div>
                    <div className="font-semibold text-gray-800">{formatCurrency(order.totalPrice)}</div>
                    {order.createdAt && (
                      <div className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleString("tr-TR")}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                        ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    
                    {/* Tüm Siparişi İptal Butonu */}
                    {isOrderCancellable && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(order.id)}
                        isLoading={processingId === order.id}
                        className="text-xs px-3 py-1"
                      >
                        Tümünü İptal Et
                      </Button>
                    )}
                    
                    {/* İade Butonu (Teslim Edildiyse) */}
                    {(returnableStatuses.includes(order.status) || hasReturnRequest) &&
                      (hasReturnRequest ? (
                        <Button variant="outline" disabled className="text-xs">İade Talebiniz Mevcut</Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => openReturnModal(order)}
                          isLoading={processingId === order.id}
                          className="text-xs"
                        >
                          İade Et
                        </Button>
                      ))}
                  </div>
                </div>

                {/* --- ÜRÜN LİSTESİ --- */}
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center text-sm p-3 rounded-lg border ${
                        item.status === 'CANCELLED' ? 'bg-red-50 border-red-100 opacity-75' : 'bg-gray-50 border-gray-100'
                      }`}
                    >
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
                        <span className="font-semibold text-gray-700">{formatCurrency(item.subtotal)}</span>
                        
                        {/* TEK ÜRÜN İPTAL BUTONU */}
                        {item.status !== 'CANCELLED' && isOrderCancellable && (
                            <button
                                onClick={() => handleCancelItem(item.id)}
                                className="text-red-500 hover:bg-red-100 p-2 rounded-full transition"
                                title="Bu ürünü iptal et"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADRES VE KARGO BİLGİLERİ */}
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700">Teslimat Adresi:</span>{" "}
                    {order.shippingAddress || placeholderValue}
                  </div>
                  
                  {(trackableStatuses.includes(order.status) || hasTrackingNumber) && (
                    <>
                      <div>
                        <span className="font-medium text-gray-700">Kargo Firması:</span>{" "}
                        {order.cargoFirm || placeholderValue}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Takip Numarası:</span>{" "}
                        {trackingUrl ? (
                          <a href={trackingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            🚚 Kargo Takip
                          </a>
                        ) : (
                          placeholderValue
                        )}
                      </div>
                    </>
                  )}
                  
                  {order.paymentId && (
                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                      Ödeme ID: {order.paymentId}
                    </div>
                  )}
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

      {/* --- İPTAL ONAY MODALI --- */}
      {confirmingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-lg border p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Siparişi iptal et</h2>
            <p className="text-sm text-gray-600">Bu siparişi tamamen iptal etmek istediğinize emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfirmingOrderId(null)}>Vazgeç</Button>
              <Button variant="danger" onClick={confirmCancel} isLoading={processingId !== null}>İptal Et</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- İADE MODALI --- */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-lg border p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">İade Talebi Oluştur</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">İade Sebebi</label>
                <textarea
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm((prev) => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setReturnModalOrder(null)}>Vazgeç</Button>
              <Button onClick={submitReturnRequest} isLoading={processingId === returnModalOrder.id}>Gönder</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Yükleniyor...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
