import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/teddy-bear-shop/api/v1',
});

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/teddy-bear-shop/api',
});

const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
};

api.interceptors.request.use(authInterceptor);
authApi.interceptors.request.use(authInterceptor);
