'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { useAuth } from '../../components/providers/AuthProvider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 text-sm">Loading dashboard…</p>
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
