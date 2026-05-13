"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { OrderListResponse, OrderResponse, OrderStatus } from "@/types";
import { toast } from "react-toastify";

const statusLabels: Record<string, string> = {
  RETURN_REQUESTED: "İade Talebiniz Alındı",
  RETURN_APPROVED: "İade Onaylandı",
  RETURN_REJECTED: "İade Reddedildi",
  RETURN_RECEIVED: "İade Teslim Alındı",
};

const statusClasses: Record<string, string> = {
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURN_APPROVED: "bg-green-100 text-green-700",
  RETURN_REJECTED: "bg-red-100 text-red-700",
  RETURN_RECEIVED: "bg-blue-100 text-blue-700",
};
const defaultStatusClass = "bg-gray-100 text-gray-600";
const defaultStatusValue = "RETURN_REQUESTED";
const pageSize = 50;
const returnStatuses: OrderStatus[] = [
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "RETURN_REJECTED",
  "RETURN_RECEIVED",
];

export default function MyReturnsPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<OrderListResponse>("/orders", {
        params: { page: 0, size: pageSize },
      });
      setOrders(response.data.orders);
    } catch {
      toast.error("İade talepleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const returnOrders = useMemo(
    () => orders.filter((order) => returnStatuses.includes(order.status)),
    [orders],
  );

  const sortedReturns = useMemo(
    () =>
      [...returnOrders].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }),
    [returnOrders],
  );

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          İade Taleplerim
        </h1>
        <div className="space-y-4">
          {sortedReturns.map((item) => {
            const status = item.status || defaultStatusValue;
            return (
              <div
                key={item.id}
                className="border rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500">
                      Sipariş #{item.id}
                    </div>
                    {item.createdAt && (
                      <div className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString("tr-TR")}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[status] ?? defaultStatusClass}`}
                  >
                    {statusLabels[status] ?? status}
                  </span>
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
