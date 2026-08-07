'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import QueryProvider from '@/lib/query-provider';
import { RoleProvider } from '@/context/role-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <RoleProvider>
        <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
            <Header />
            <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950 text-slate-100">
              {children}
            </main>
          </div>
        </div>
      </RoleProvider>
    </QueryProvider>
  );
}
