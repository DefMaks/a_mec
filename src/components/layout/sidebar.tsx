'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const pathname = usePathname();

  const adminNavItems = [
    { label: "Vue d'ensemble", href: '/', icon: '📊' },
    { label: 'Gestion Écoles', href: '/admin/schools', icon: '🏫' },
    { label: 'Enseignants', href: '/admin/teachers', icon: '👨‍🏫' },
    { label: 'Élèves & Classes', href: '/admin/students', icon: '🎓' },
    { label: 'Parents', href: '/admin/parents', icon: '👨‍👩‍👧' },
    { label: 'Paiements Twiga', href: '/admin/payments', icon: '💳' },
    { label: 'Mes Cours & Chapitres', href: '/teacher/courses', icon: '📚' },
    { label: 'Quizzes (10 Qs)', href: '/teacher/quizzes', icon: '📝' },
    { label: 'Messagerie Chat', href: '/chat', icon: '💬' },
    { label: 'Paramètres', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-base shadow-md">
          {APP_SHORT_NAME}
        </div>
        <div>
          <h2 className="font-bold text-white text-sm leading-tight">{APP_NAME}</h2>
          <p className="text-[11px] text-teal-400 capitalize">{userRole.replace('_', ' ')}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation Principale
        </div>
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25 font-semibold'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Portail {APP_SHORT_NAME} Next.js 15
      </div>
    </aside>
  );
}
