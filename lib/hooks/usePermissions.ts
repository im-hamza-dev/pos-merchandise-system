import type { Permissions } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/auth.store';

export function usePermissions() {
  const role = useAuthStore((s) => s.role);
  const permissions = useAuthStore((s) => s.permissions);

  const hasPermission = (permission: keyof Permissions) => {
    return !!permissions?.[permission];
  };

  return {
    role,
    permissions,
    hasPermission,
  };
}

