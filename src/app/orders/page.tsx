"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/services/api";
import OrderService from "@/services/order.service";
import ReturnService from "@/services/return.service";
import {
  OrderListResponse,
  OrderResponse,
  OrderStatus,
  ReturnRequest,
} from "@/types";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getTrackingUrl } from "@/utils/cargoTracking";

const cancellableStatuses: OrderStatus[] = ["PENDING", "PROCESSING"];
const returnableStatuses: OrderStatus[] = ["DELIVERED"];
const trackableStatuses: OrderStatus[] = ["SHIPPED", "DELIVERED"];
const cargoFirmOptions = ["Yurtiçi", "Aras", "MNG", "PTT"];
const placeholderValue = "—";

function OrdersContent() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(
    null,
  );
  const [returnModalOrder, setReturnModalOrder] =
    useState<OrderResponse | null>(null);
  const [returnOrderIds, setReturnOrderIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [returnForm, setReturnForm] = useState({
    cargoFirm: cargoFirmOptions[0],
    trackingCode: "",
    reason: "",
  });
  const { user } = useAuth();
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
      try {
        const returnsResponse = await ReturnService.getMyReturns();
        setReturnOrderIds(
          new Set(returnsResponse.data.map((item) => item.orderId)),
        );
      } catch {
        setReturnOrderIds(new Set());
      }
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
    [searchParams],
  );

  useEffect(() => {
    if (paymentSuccess && !hasShownPaymentSuccess.current) {
      toast.success("Ödeme Başarılı");
      refreshCart();
      hasShownPaymentSuccess.current = true;
    }
  }, [paymentSuccess, refreshCart]);

  const handleCancel = async (orderId: number) => {
    setConfirmingOrderId(orderId);
  };

  const confirmCancel = async () => {
    if (!confirmingOrderId) {
      return;
    }
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

  const openReturnModal = (order: OrderResponse) => {
    setReturnForm({
      cargoFirm: cargoFirmOptions[0],
      trackingCode: "",
      reason: "",
    });
    setReturnModalOrder(order);
  };

  const submitReturnRequest = async () => {
    if (!returnModalOrder) {
      return;
    }
    if (!user?.id) {
      toast.error("Kullanıcı bilgisi bulunamadı.");
      return;
    }
    if (!returnForm.trackingCode.trim() || !returnForm.reason.trim()) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    setProcessingId(returnModalOrder.id);
    try {
      const payload: ReturnRequest = {
        orderId: returnModalOrder.id,
        userId: user.id,
        cargoFirm: returnForm.cargoFirm,
        trackingCode: returnForm.trackingCode.trim(),
        reason: returnForm.reason.trim(),
        status: "PENDING",
      };
      await ReturnService.create(payload);
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
        <div className="space-y-4">
          {orders.map((order) => {
            const trackingUrl = getTrackingUrl(
              order.cargoFirm,
              order.trackingNumber,
            );
            const hasReturnRequest = returnOrderIds.has(order.id);
            const hasTrackingNumber = Boolean(order.trackingNumber);
            return (
              <div key={order.id} className="border rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500">
                      Sipariş #{order.id}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {formatCurrency(order.totalPrice)}
                    </div>
                    {order.createdAt && (
                      <div className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleString("tr-TR")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {order.status}
                    </span>
                    {cancellableStatuses.includes(order.status) && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(order.id)}
                        isLoading={processingId === order.id}
                      >
                        İptal Et
                      </Button>
                    )}
                    {returnableStatuses.includes(order.status) &&
                      (hasReturnRequest ? (
                        <Button variant="outline" disabled>
                          İade Talebiniz Mevcut
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => openReturnModal(order)}
                          isLoading={processingId === order.id}
                        >
                          İade Et
                        </Button>
                      ))}
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>
                        {item.productName} x{item.quantity}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium text-gray-700">
                      Teslimat Adresi:
                    </span>{" "}
                    {order.shippingAddress || placeholderValue}
                  </div>
                  {(trackableStatuses.includes(order.status) ||
                    hasTrackingNumber) && (
                     <>
                       <div>
                         <span className="font-medium text-gray-700">
                           Kargo Firması:
                         </span>{" "}
                         {order.cargoFirm || placeholderValue}
                       </div>
                       <div>
                         <span className="font-medium text-gray-700">
                           Takip Numarası:
                         </span>{" "}
                         {trackingUrl ? (
                           <a
                             href={trackingUrl}
                             target="_blank"
                             rel="noreferrer"
                             className="text-blue-600 hover:underline"
                           >
                             🚚 Kargo Takip
                           </a>
                         ) : (
                           placeholderValue
                         )}
                       </div>
                     </>
                   )}
                </div>
                {order.paymentId && (
                  <div className="text-xs text-gray-400">
                    Ödeme ID: {order.paymentId}
                  </div>
                )}
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="text-sm text-gray-500">Henüz sipariş yok.</div>
          )}
        </div>
      </div>
      {confirmingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-lg border p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Siparişi iptal et
            </h2>
            <p className="text-sm text-gray-600">
              Bu siparişi iptal etmek istediğinize emin misiniz?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmingOrderId(null)}
              >
                Vazgeç
              </Button>
              <Button
                variant="danger"
                onClick={confirmCancel}
                isLoading={processingId !== null}
              >
                İptal Et
              </Button>
            </div>
          </div>
        </div>
      )}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-lg border p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              İade Talebi Oluştur
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Kargo Firması
                </label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={returnForm.cargoFirm}
                  onChange={(event) =>
                    setReturnForm((prev) => ({
                      ...prev,
                      cargoFirm: event.target.value,
                    }))
                  }
                >
                  {cargoFirmOptions.map((firm) => (
                    <option key={firm} value={firm}>
                      {firm}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Takip Kodu
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={returnForm.trackingCode}
                  onChange={(event) =>
                    setReturnForm((prev) => ({
                      ...prev,
                      trackingCode: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  İade Sebebi
                </label>
                <textarea
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={returnForm.reason}
                  onChange={(event) =>
                    setReturnForm((prev) => ({
                      ...prev,
                      reason: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setReturnModalOrder(null)}
              >
                Vazgeç
              </Button>
              <Button
                onClick={submitReturnRequest}
                isLoading={processingId === returnModalOrder.id}
              >
                Gönder
              </Button>
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
