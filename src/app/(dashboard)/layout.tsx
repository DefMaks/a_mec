'use client';

import React, { Suspense } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import QueryProvider from '@/lib/query-provider';
import { RoleProvider } from '@/context/role-context';
import { SidebarProvider } from '@/context/sidebar-context';
import { NavigationProgressBar } from '@/components/layout/navigation-progress';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <RoleProvider>
        <SidebarProvider>
          <div className="flex min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased">
            <Suspense fallback={null}>
              <NavigationProgressBar />
            </Suspense>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
              <Header />
              <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F8FAFC] text-[#1E293B]">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </RoleProvider>
    </QueryProvider>
  );
}
