'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigationLoading } from '@/context/navigation-transition-context';

export function PageTransitionWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isNavigating } = useNavigationLoading();

  return (
    <div
      key={pathname}
      className={`transition-all duration-200 ${
        isNavigating
          ? 'opacity-60 pointer-events-none filter blur-[0.3px]'
          : 'opacity-100 animate-in fade-in duration-300'
      }`}
    >
      {children}
    </div>
  );
}
