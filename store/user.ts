// ============================
// User Zustand Store
// ============================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type UserRole } from '@/lib/types';

interface UserState {
  /** Current user info */
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    whatsappNumber: string;
  } | null;
  /** Impersonating role (admin only) */
  impersonateRole: UserRole | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;

  // Actions
  setCurrentUser: (user: UserState['currentUser']) => void;
  setImpersonateRole: (role: UserRole | null) => void;
  logout: () => void;

  // Computed
  getEffectiveRole: () => UserRole;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      impersonateRole: null,
      isAuthenticated: false,

      setCurrentUser: (user) =>
        set({
          currentUser: user,
          isAuthenticated: !!user,
        }),

      setImpersonateRole: (role) => set({ impersonateRole: role }),

      logout: () =>
        set({
          currentUser: null,
          impersonateRole: null,
          isAuthenticated: false,
        }),

      getEffectiveRole: () => {
        const state = get();
        if (state.impersonateRole && state.currentUser?.role === 'ADMIN') {
          return state.impersonateRole;
        }
        return state.currentUser?.role || 'VIEWER';
      },
    }),
    {
      name: 'pms-user',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
