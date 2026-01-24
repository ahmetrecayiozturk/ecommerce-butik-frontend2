"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { OrderListResponse, OrderResponse, RefundRequest } from '@/types';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';

const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<OrderListResponse>('/admin/orders', { params: { page: 0, size: 50 } });
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

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, null, {
        params: { status }
      });
      toast.success("Sipariş güncellendi.");
      setOrders((prev) => prev.map((order) => (order.id === orderId ? response.data : order)));
    } catch {
      toast.error("Sipariş güncellenemedi.");
    }
  };

  const handleRefund = async (order: OrderResponse) => {
    const paymentTransactionId =
      order.items.find((item) => item.paymentTransactionId)?.paymentTransactionId ?? order.paymentId;
    if (!paymentTransactionId) {
      toast.error("Ödeme işlemi bulunamadı.");
      return;
    }
    setRefundingId(order.id);
    try {
      const itemsTotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
      const payload: RefundRequest = {
        paymentTransactionId,
        amount: itemsTotal > 0 ? itemsTotal : order.totalPrice
      };
      await api.post('/payment/refund', payload);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Sipariş Yönetimi</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`border rounded-xl p-4 ${
                order.status === 'RETURN_REQUESTED' ? 'border-yellow-300 bg-yellow-50' : ''
              }`}
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Sipariş #{order.id}</div>
                  <div className="font-semibold text-gray-800">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.totalPrice)}
                  </div>
                  {order.createdAt && (
                    <div className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleString('tr-TR')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded-lg px-3 py-2 text-sm"
                    value={order.status}
                    onChange={(event) => handleStatusChange(order.id, event.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="danger"
                    onClick={() => handleRefund(order)}
                    isLoading={refundingId === order.id}
                    className="text-sm"
                  >
                    Refund
                  </Button>
                </div>
              </div>
              <div className="mt-4 border-t pt-4 space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
              {order.paymentId && (
                <div className="text-xs text-gray-400 mt-3">Ödeme ID: {order.paymentId}</div>
              )}
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-sm text-gray-500">Henüz sipariş yok.</div>
          )}
        </div>
      </div>
    </div>
  );
}
