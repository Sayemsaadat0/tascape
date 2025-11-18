import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  name: string;
  role: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (payload: { user: User; token: string }) => void;
  removeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: ({ user, token }) => set({ user, token }),
      removeAuth: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
