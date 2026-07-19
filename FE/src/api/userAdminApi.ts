import { api } from '../lib/api';

export interface UserAdminResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  status: boolean;
  createdAt: string;
}

export interface UserAdminPageResponse {
  content: UserAdminResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const userAdminApi = {
  getUsers: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    keyword?: string;
    role?: string;
    status?: boolean;
  }) => {
    // Filter out empty params
    const cleanedParams: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedParams[key] = value;
        }
      });
    }
    const res = await api.get<{ result: UserAdminPageResponse }>('/users', {
      params: cleanedParams,
    });
    return res.data.result;
  },

  getUserById: async (id: number | string) => {
    const res = await api.get<{ result: UserAdminResponse }>(`/users/${id}`);
    return res.data.result;
  },

  updateUserStatus: async (id: number | string, status: boolean) => {
    const res = await api.patch<{ result: UserAdminResponse }>(`/users/${id}/status`, null, {
      params: { status },
    });
    return res.data.result;
  },

  updateUserRole: async (id: number | string, role: string) => {
    const res = await api.patch<{ result: UserAdminResponse }>(`/users/${id}/role`, null, {
      params: { role },
    });
    return res.data.result;
  },


};
