import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/teddy-bear-shop/api';

export const api = axios.create({
  baseURL: `${apiBase}/v1`,
});

export const authApi = axios.create({
  baseURL: apiBase,
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
