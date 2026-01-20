'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { cn } from '@/lib/utils/cn';

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, permissions } = usePermissions();
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">POS & Merchandise</h1>
            <p className="text-sm text-muted-foreground">Admin Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">
                {role ? `Role: ${role}` : 'Not signed in'}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {role && (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            )}
          </div>
        </div>

        <nav className="flex gap-2">
          {permissions?.canAccessOverview && (
            <Button 
              variant={pathname === '/' ? 'secondary' : 'ghost'} 
              asChild
            >
              <Link href="/">Overview</Link>
            </Button>
          )}
          {permissions?.canAccessCheckout && (
            <Button 
              variant={pathname === '/checkout' ? 'secondary' : 'ghost'} 
              asChild
            >
              <Link href="/checkout">Checkout</Link>
            </Button>
          )}
          {permissions?.canAccessCatalog && (
            <Button 
              variant={pathname === '/catalog' ? 'secondary' : 'ghost'} 
              asChild
            >
              <Link href="/catalog">Catalog</Link>
            </Button>
          )}
          {permissions?.canAccessBanners && (
            <Button 
              variant={pathname === '/banners' ? 'secondary' : 'ghost'} 
              asChild
            >
              <Link href="/banners">Banners</Link>
            </Button>
          )}
          {permissions?.canAccessSales && (
            <Button 
              variant={pathname === '/sales' ? 'secondary' : 'ghost'} 
              asChild
            >
              <Link href="/sales">Sales</Link>
            </Button>
          )}
          {permissions?.canAccessSettings && (
            <Button 
              variant={pathname === '/settings' ? 'secondary' : 'ghost'} 
              asChild
            >
              <Link href="/settings">Settings</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

