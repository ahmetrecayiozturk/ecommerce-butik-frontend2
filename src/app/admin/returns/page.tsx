"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import ReturnService from "@/services/return.service";
import { OrderListResponse, OrderResponse, OrderStatus } from "@/types";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";

const returnStatuses: OrderStatus[] = [
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "RETURN_REJECTED",
  "RETURN_RECEIVED",
];

export default function AdminReturnsPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<OrderListResponse>("/admin/orders", {
        params: { page: 0, size: 50 },
      });
      const returnOrders = response.data.orders.filter((order) =>
        returnStatuses.includes(order.status),
      );
      setOrders(returnOrders);
    } catch {
      toast.error("İade talepleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleDecision = async (order: OrderResponse, approved: boolean) => {
    setProcessingId(order.id);
    try {
      const response = await ReturnService.processReturnRequest(order.id, {
        approved,
        adminNotes: adminNotes[order.id]?.trim() || undefined,
      });
      toast.success(approved ? "İade talebi onaylandı." : "İade talebi reddedildi.");
      setOrders((prev) =>
        prev.map((entry) => (entry.id === order.id ? response.data : entry)),
      );
      setAdminNotes((prev) => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });
    } catch {
      toast.error("İade talebi güncellenemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkReceived = async (order: OrderResponse) => {
    setProcessingId(order.id);
    try {
      const response = await ReturnService.markReturnReceived(order.id);
      toast.success("İade teslim alındı olarak işaretlendi.");
      setOrders((prev) =>
        prev.map((entry) => (entry.id === order.id ? response.data : entry)),
      );
    } catch {
      toast.error("İade teslim alındı olarak işaretlenemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const sortedReturns = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }),
    [orders],
  );

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          İade Talepleri
        </h1>
        <div className="space-y-4">
          {sortedReturns.map((order) => {
            const isRequested = order.status === "RETURN_REQUESTED";
            const canMarkReceived = order.status === "RETURN_APPROVED";
            return (
              <div
                key={order.id}
                className="border rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  {/* SOL TARAFTAKİ BİLGİLER */}
                  <div>
                    <div className="text-sm text-gray-500">
                      Sipariş #{order.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(order.totalPrice)}
                    </div>
                    {order.createdAt && (
                      <div className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleString("tr-TR")}
                      </div>
                    )}
                  </div>

                  {/* SAĞ TARAFTAKİ BUTONLAR VE STATÜ */}
                  <div className="flex items-center gap-2">
                    {/* STATÜ BADGE'İ */}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 text-gray-700">
                      {order.status}
                    </span>

                    {/* 1. ADIM: RETURN_REQUESTED ise onay/ret */}
                    {isRequested && (
                      <Button
                        className="text-sm"
                        onClick={() => handleDecision(order, true)}
                        isLoading={processingId === order.id}
                      >
                        Onayla
                      </Button>
                    )}

                    {isRequested && (
                      <Button
                        variant="secondary"
                        className="text-sm"
                        onClick={() => handleDecision(order, false)}
                        isLoading={processingId === order.id}
                      >
                        Reddet
                      </Button>
                    )}

                    {canMarkReceived && (
                      <Button
                        className="text-sm"
                        onClick={() => handleMarkReceived(order)}
                        isLoading={processingId === order.id}
                      >
                        Teslim Alındı
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">Teslimat Adresi:</span>{" "}
                    {order.shippingAddress || "—"}
                  </div>
                  {isRequested && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Admin Notu (Opsiyonel)
                      </label>
                      <textarea
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                        rows={3}
                        value={adminNotes[order.id] ?? ""}
                        onChange={(event) =>
                          setAdminNotes((prev) => ({
                            ...prev,
                            [order.id]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {sortedReturns.length === 0 && (
            <div className="text-sm text-gray-500">Henüz iade talebi yok.</div>
          )}
        </div>
      </div>
    </div>
  );
}
