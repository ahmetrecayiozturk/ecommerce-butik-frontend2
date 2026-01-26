"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { OrderListResponse, OrderResponse, RefundRequest } from "@/types";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { getTrackingUrl } from "@/utils/cargoTracking";

const statusOptions = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
];
const cargoFirmOptions = ["Yurtiçi", "Aras", "MNG", "PTT"];

const getPaymentTransactionId = (order: OrderResponse) =>
  order.items.find((item) => item.paymentTransactionId)?.paymentTransactionId;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<number | null>(null);
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
            ? {
                cargoFirm,
                trackingNumber,
              }
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

  const handleRefund = async (order: OrderResponse) => {
    const paymentTransactionId = getPaymentTransactionId(order);
    if (!paymentTransactionId) {
      toast.error("Ödeme işlem numarası bulunamadı.");
      return;
    }
    setRefundingId(order.id);
    try {
      const payload: RefundRequest = {
        paymentTransactionId,
        amount: order.totalPrice,
      };
      await api.post("/payment/refund", payload);
      toast.success("İade işlemi başlatıldı.");
      fetchOrders();
    } catch {
      toast.error("İade işlemi başarısız oldu.");
    } finally {
      setRefundingId(null);
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
              <div
                key={order.id}
                className={`border rounded-xl p-4 ${
                  order.status === "RETURN_REQUESTED"
                    ? "border-yellow-300 bg-yellow-50"
                    : ""
                }`}
              >
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
                      className="border rounded-lg px-3 py-2 text-sm"
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
                      className="text-sm"
                    >
                      Güncelle
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleRefund(order)}
                      isLoading={refundingId === order.id}
                      className="text-sm"
                    >
                      İade Başlat
                    </Button>
                  </div>
                </div>
                {(statusSelections[order.id] ?? order.status) === "SHIPPED" && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-xs font-medium text-gray-500"
                        htmlFor={`cargoFirm-${order.id}`}
                      >
                        Kargo Firması
                      </label>
                      <select
                        id={`cargoFirm-${order.id}`}
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={
                          shipmentDetails[order.id]?.cargoFirm ??
                          order.cargoFirm ??
                          ""
                        }
                        onChange={(event) =>
                          setShipmentDetails((prev) => ({
                            ...prev,
                            [order.id]: {
                              cargoFirm: event.target.value,
                              trackingNumber:
                                prev[order.id]?.trackingNumber ??
                                order.trackingNumber ??
                                "",
                            },
                          }))
                        }
                      >
                        <option value="">Seçiniz</option>
                        {cargoFirmOptions.map((firm) => (
                          <option key={firm} value={firm}>
                            {firm}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-xs font-medium text-gray-500"
                        htmlFor={`trackingNumber-${order.id}`}
                      >
                        Takip Numarası
                      </label>
                      <input
                        id={`trackingNumber-${order.id}`}
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={
                          shipmentDetails[order.id]?.trackingNumber ??
                          order.trackingNumber ??
                          ""
                        }
                        onChange={(event) =>
                          setShipmentDetails((prev) => ({
                            ...prev,
                            [order.id]: {
                              cargoFirm:
                                prev[order.id]?.cargoFirm ??
                                order.cargoFirm ??
                                "",
                              trackingNumber: event.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="mt-4 border-t pt-4 space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>
                        {item.productName} x{item.quantity}
                      </span>
                      <span>
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
                 <div className="mt-3 text-sm text-gray-600">
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
                     "—"
                   )}
                 </div>
                {order.paymentId && (
                  <div className="text-xs text-gray-400 mt-3">
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
    </div>
  );
}
