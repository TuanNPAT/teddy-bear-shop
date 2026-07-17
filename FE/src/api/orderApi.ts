import { api } from '../lib/api';

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: 'COD' | 'VNPAY';
  note?: string;
  items: OrderItemRequest[];
}

export interface OrderResponse {
  orderId: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  orderDetails: Array<Record<string, unknown>>;
}

export const orderApi = {
  createOrder: async (data: OrderRequest) => {
    const res = await api.post<{ result: OrderResponse }>('/orders', data);
    return res.data.result;
  },
  
  getMyOrders: async () => {
    const res = await api.get<{ result: OrderResponse[] }>('/orders/me');
    return res.data.result;
  },
  
  cancelOrder: async (orderId: number, reason?: string) => {
    const res = await api.patch(`/orders/${orderId}/cancel`, null, {
      params: { reason }
    });
    return res.data;
  }
};
