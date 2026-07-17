import { api } from '../lib/api';

export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrls: string[];
  status: string;
}

export interface ProductPageResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
}

export const productApi = {
  getProducts: async (params?: { page?: number; size?: number; search?: string; category?: string; sort?: string }) => {
    const res = await api.get<{ result: ProductPageResponse }>('/products', { params });
    return res.data.result;
  },
  
  getProductById: async (id: string | number) => {
    const res = await api.get<{ result: Product }>(`/products/${id}`);
    return res.data.result;
  }
};
