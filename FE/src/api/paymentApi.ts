import { api } from '../lib/api';

export interface PaymentResponse {
  paymentUrl: string;
  orderCode: string;
  orderId: number;
  paymentId: number;
  amount: number;
  method: 'COD' | 'VNPAY';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  txnRef: string;
  transactionNo?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface PaymentResultResponse {
  orderCode: string;
  paymentStatus: 'SUCCESS' | 'FAILED';
  message: string;
  transactionNo?: string | null;
}

export const paymentApi = {
  createPayment: async (orderId: number) => {
    const res = await api.post<{ result: PaymentResponse }>('/payments/create', { orderId });
    return res.data.result;
  },

  handleVNPayReturn: async (queryString: string) => {
    const res = await api.get<{ result: PaymentResultResponse }>(`/payments/vnpay-return${queryString}`);
    return res.data.result;
  },

  getPaymentByOrderId: async (orderId: number) => {
    const res = await api.get<{ result: PaymentResponse }>(`/payments/order/${orderId}`);
    return res.data.result;
  },
};
