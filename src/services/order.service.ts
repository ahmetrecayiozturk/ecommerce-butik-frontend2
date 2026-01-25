import api from '@/services/api';
import { OrderResponse } from '@/types';

const OrderService = {
  cancel: (id: number) => api.put<OrderResponse>(`/orders/${id}/cancel`)
};

export default OrderService;
