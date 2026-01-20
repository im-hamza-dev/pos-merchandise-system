import type { Permissions, UserRole } from '@/lib/types';

export const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  staff: {
    canAccessCheckout: true,
    canAccessOverview: true,
    canAccessCatalog: true,
    canEditCatalog: false,
    canAccessBanners: false,
    canAccessSales: true,
    canIssueRefund: false,
    canCancelPickup: false,
    canAccessSettings: false,
  },
  manager: {
    canAccessCheckout: true,
    canAccessOverview: true,
    canAccessCatalog: true,
    canEditCatalog: true,
    canAccessBanners: true,
    canAccessSales: true,
    canIssueRefund: true,
    canCancelPickup: true,
    canAccessSettings: true,
  },
  owner: {
    canAccessCheckout: true,
    canAccessOverview: true,
    canAccessCatalog: true,
    canEditCatalog: true,
    canAccessBanners: true,
    canAccessSales: true,
    canIssueRefund: true,
    canCancelPickup: true,
    canAccessSettings: true,
  },
};

export function getPermissions(role: UserRole): Permissions {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: UserRole, permission: keyof Permissions): boolean {
  return !!ROLE_PERMISSIONS[role]?.[permission];
}

