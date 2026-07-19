import { api } from '../lib/api';

export interface UserProfileResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
  status: boolean;
  createdAt: string;
}

export const userApi = {
  getProfile: async () => {
    const res = await api.get<{ result: UserProfileResponse }>('/users/me');
    const data = res.data.result;
    return {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phone || '',
      shippingAddress: data.address || '',
    };
  },
  
  updateProfile: async (data: { fullName: string; phoneNumber: string; shippingAddress: string }) => {
    const requestBody = {
      fullName: data.fullName,
      phone: data.phoneNumber || null,
      address: data.shippingAddress || null,
    };
    const res = await api.patch<{ result: UserProfileResponse }>('/users/me', requestBody);
    const updatedData = res.data.result;
    return {
      fullName: updatedData.fullName,
      email: updatedData.email,
      phoneNumber: updatedData.phone || '',
      shippingAddress: updatedData.address || '',
    };
  }
};
