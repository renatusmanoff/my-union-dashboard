'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizationsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/super-admin/organizations');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-300">Перенаправление...</div>
    </div>
  );
}