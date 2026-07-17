import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../api/authApi';

interface AuthState {
  token: string | null;
  user: { email: string; role: string } | null;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (auth) => {
        localStorage.setItem('token', auth.token);
        set({ token: auth.token, user: { email: auth.email, role: auth.role } });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'teddy-shop-auth',
    }
  )
);
