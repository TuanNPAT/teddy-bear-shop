import { authApi } from '../lib/api';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
  status: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  email: string;
  role: string;
}

export const authService = {
  login: async (data: Record<string, string>) => {
    const res = await authApi.post<{ result: AuthResponse }>('/auth/login', data);
    return res.data.result;
  },
  
  sendRegisterOtp: async (email: string) => {
    const res = await authApi.post<{ message: string }>('/auth/register/send-otp', { email });
    return res.data;
  },
  
  verifyRegister: async (data: Record<string, string>, otp: string) => {
    const res = await authApi.post<{ result: UserResponse }>(`/auth/register/verify?otp=${otp}`, data);
    return res.data.result;
  },

  sendOtpForForgotPassword: async (email: string) => {
    const res = await authApi.post<{ message: string }>('/auth/forgot-password/send-otp', { email });
    return res.data;
  },

  resetPassword: async (data: Record<string, string>) => {
    const res = await authApi.post<{ message: string }>('/auth/forgot-password/reset', data);
    return res.data;
  }
};
