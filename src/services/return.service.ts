import api from '@/services/api';
import { ReturnRequest, ReturnStatus } from '@/types';

const ReturnService = {
  create: (data: ReturnRequest) => api.post<ReturnRequest>('/returns', data),
  getAll: () => api.get<ReturnRequest[]>('/returns/admin'),
  updateStatus: (id: number, status: ReturnStatus) =>
    api.put<ReturnRequest>(`/returns/${id}/status`, null, { params: { status } })
};

export default ReturnService;
