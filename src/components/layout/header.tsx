'use client';

import React from 'react';
import { UserNav } from './user-nav';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
          <span>🏫</span> <strong>{APP_NAME} ({APP_SHORT_NAME})</strong> • Système Éducatif RDC (TENAFEP & EXETAT)
        </span>
      </div>
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
