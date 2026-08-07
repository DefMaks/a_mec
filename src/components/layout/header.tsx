'use client';

import React from 'react';
import { UserNav } from './user-nav';
import { RoleSelector } from './role-selector';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';

export function Header() {
  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md text-white shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center gap-1.5">
          <span>🏫</span> <strong>{APP_NAME} ({APP_SHORT_NAME})</strong> • Système Éducatif RDC (TENAFEP & EXETAT)
        </span>
      </div>
      <div className="flex items-center gap-4">
        <RoleSelector />
        <UserNav />
      </div>
    </header>
  );
}
