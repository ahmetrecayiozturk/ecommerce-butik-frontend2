import api from '@/services/api';
import {
  OrderResponse,
  OrderReturnDecisionRequest,
  OrderReturnRequest,
} from '@/types';

const ReturnService = {
  requestReturn: (orderId: number, data: OrderReturnRequest) =>
    api.post<OrderResponse>(`/orders/${orderId}/return`, data),
  processReturnRequest: (orderId: number, data: OrderReturnDecisionRequest) =>
    api.put<OrderResponse>(`/admin/orders/${orderId}/return`, data),
  markReturnReceived: (orderId: number) =>
    api.post<OrderResponse>(`/admin/orders/${orderId}/return-received`),
};

export default ReturnService;
