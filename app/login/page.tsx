'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { UserRole } from '@/lib/types';

type RoleCard = {
  role: UserRole;
  title: string;
  description: string;
};

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'staff',
    title: 'Staff',
    description: 'Checkout + view-only access to Catalog and Sales.',
  },
  {
    role: 'manager',
    title: 'Manager',
    description: 'Full access including Catalog edits, Banners, Settings, and privileged actions.',
  },
  {
    role: 'owner',
    title: 'Owner',
    description: 'Full access including Settings and privileged actions.',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);

  useEffect(() => {
    if (!role) return;
    router.replace(role === 'staff' ? '/checkout' : '/');
  }, [role, router]);

  const handleSelectRole = (nextRole: UserRole) => {
    setRole(nextRole);
    router.replace(nextRole === 'staff' ? '/checkout' : '/');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Select Role</h1>
          <p className="text-muted-foreground">
            Choose a role to simulate access permissions in the admin portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLE_CARDS.map((card) => (
            <Card key={card.role} className="h-full">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{card.description}</p>
                <Button className="w-full" onClick={() => handleSelectRole(card.role)}>
                  Continue
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

