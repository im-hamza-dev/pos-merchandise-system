'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Permissions } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/auth.store';

type ProtectedRouteProps = {
  children: React.ReactNode;
  require?: keyof Permissions;
};

export function ProtectedRoute({ children, require }: ProtectedRouteProps) {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const permissions = useAuthStore((s) => s.permissions);

  useEffect(() => {
    if (!role) {
      router.replace('/login');
      return;
    }
    if (require && !permissions?.[require]) {
      router.replace('/login');
    }
  }, [role, permissions, require, router]);

  if (!role) return null;
  if (require && !permissions?.[require]) return null;

  return children;
}

