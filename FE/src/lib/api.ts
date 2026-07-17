import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1', // wait, auth is /api/auth, but orders are /api/v1/orders
});

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
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
