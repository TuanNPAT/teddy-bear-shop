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
  orderCode: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  orderDetails: Array<Record<string, unknown>>;
  cancelReason?: string | null;
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
  },

  getOrders: async (params?: Record<string, any>) => {
    const cleanedParams: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedParams[key] = value;
        }
      });
    }
    const res = await api.get<{ result: { content: OrderResponse[]; totalPages: number } }>('/orders', {
      params: cleanedParams
    });
    return res.data.result;
  },

  getOrderById: async (orderId: number) => {
    const res = await api.get<{ result: OrderResponse }>(`/orders/${orderId}`);
    return res.data.result;
  },

  updateOrderStatus: async (orderId: number, status: string) => {
    const res = await api.patch<{ result: OrderResponse }>(`/orders/${orderId}/status`, null, {
      params: { status }
    });
    return res.data.result;
  }
};
