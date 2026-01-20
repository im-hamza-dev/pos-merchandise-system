import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Permissions, UserRole } from '@/lib/types';
import { getPermissions } from '@/lib/utils/permissions';

interface AuthStoreState {
  role: UserRole | null;
  permissions: Permissions | null;
}

interface AuthStoreActions {
  setRole: (role: UserRole) => void;
  signOut: () => void;
}

type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      role: null,
      permissions: null,

      setRole: (role) =>
        set({
          role,
          permissions: getPermissions(role),
        }),

      signOut: () =>
        set({
          role: null,
          permissions: null,
        }),
    }),
    {
      name: 'pos-auth-storage',
      partialize: (state) => ({
        role: state.role,
        permissions: state.permissions,
      }),
    },
  ),
);

