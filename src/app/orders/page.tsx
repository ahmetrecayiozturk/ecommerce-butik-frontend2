"use client";

import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { OrderListResponse, OrderResponse, OrderStatus } from '@/types';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

const cancellableStatuses: OrderStatus[] = ['PENDING', 'PROCESSING'];
const returnableStatuses: OrderStatus[] = ['DELIVERED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<OrderListResponse>('/orders', { params: { page: 0, size: 50 } });
      setOrders(response.data.orders);
    } catch {
      toast.error("Siparişler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (orderId: number) => {
    const confirmed = window.confirm("Siparişi iptal etmek istediğinize emin misiniz?");
    if (!confirmed) {
      return;
    }
    setProcessingId(orderId);
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success("Sipariş iptal edildi.");
      fetchOrders();
    } catch {
      toast.error("Sipariş iptal edilemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReturnRequest = async (orderId: number) => {
    setProcessingId(orderId);
    try {
      await api.post(`/orders/${orderId}/return`);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: 'RETURN_REQUESTED' } : order
        )
      );
      toast.success("İade talebi oluşturuldu.");
    } catch {
      toast.error("İade talebi oluşturulamadı.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Siparişlerim</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Sipariş #{order.id}</div>
                  <div className="font-semibold text-gray-800">{formatCurrency(order.totalPrice)}</div>
                  {order.createdAt && (
                    <div className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleString('tr-TR')}
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
                  {returnableStatuses.includes(order.status) && (
                    <Button
                      variant="outline"
                      onClick={() => handleReturnRequest(order.id)}
                      isLoading={processingId === order.id}
                    >
                      İade Talep Et
                    </Button>
                  )}
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              {order.paymentId && (
                <div className="text-xs text-gray-400">Ödeme ID: {order.paymentId}</div>
              )}
            </div>
          ))}
          {orders.length === 0 && <div className="text-sm text-gray-500">Henüz sipariş yok.</div>}
        </div>
      </div>
    </div>
  );
}
