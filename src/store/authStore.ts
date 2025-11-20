import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User
 * Authenticated user shape stored in auth state.
 */
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

/**
 * AuthState
 * Zustand store (persisted) for authentication state, user info and tokens.
 */
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  
  // Actions
  setAuth: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  updateTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
}

/**
 * useAuthStore
 * Persisted Zustand store for managing auth state across page reloads.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (tokens, user) => set({
        isAuthenticated: true,
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),

      setUser: (user) => set({ user }),

      clearAuth: () => set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      }),

      updateTokens: (tokens) => set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
    }),
    {
      name: 'fanect-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);