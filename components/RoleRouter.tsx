'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@prisma/client';

interface RoleRouterProps {
  children: React.ReactNode;
}

export default function RoleRouter({ children }: RoleRouterProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role) {
      const roleRoutes: Partial<Record<UserRole, string>> = {
        'SUPER_ADMIN': '/dashboard/super-admin',
        'FEDERAL_CHAIRMAN': '/dashboard/federal-admin',
        'REGIONAL_CHAIRMAN': '/dashboard/regional-admin',
        'LOCAL_CHAIRMAN': '/dashboard/local-admin',
        'PRIMARY_CHAIRMAN': '/dashboard/primary-admin',
        'PRIMARY_MEMBER': '/dashboard/member'
      };

      const targetRoute = roleRoutes[user.role];
      if (targetRoute && window.location.pathname === '/dashboard') {
        router.push(targetRoute);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
