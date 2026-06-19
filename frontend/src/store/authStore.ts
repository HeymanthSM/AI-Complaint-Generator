import { create } from 'zustand';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (credentials: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  fetchProfile: () => Promise<User | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: false,
  initialized: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  register: async (registerData) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/register', registerData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  fetchProfile: async () => {
    const token = get().token;
    if (!token) {
      set({ initialized: true });
      return null;
    }
    
    set({ loading: true, error: null });
    try {
      const userData = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, loading: false, initialized: true });
      return userData;
    } catch (err) {
      // If profile fails, clear token as it might be expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, loading: false, initialized: true });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
