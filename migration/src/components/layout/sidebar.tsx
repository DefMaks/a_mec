"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const pathname = usePathname();

  const adminNavItems = [
    { label: "Vue d'ensemble", href: '/', icon: '📊' },
    { label: 'Écoles', href: '/admin/schools', icon: '🏫' },
    { label: 'Enseignants', href: '/admin/teachers', icon: '👨‍🏫' },
    { label: 'Élèves & Classes', href: '/admin/students', icon: '🎓' },
    { label: 'Paiements Twiga', href: '/admin/payments', icon: '💳' },
  ];

  const teacherNavItems = [
    { label: "Vue d'ensemble", href: '/', icon: '📊' },
    { label: 'Mes Cours & Chapitres', href: '/teacher/courses', icon: '📚' },
    { label: 'Quizzes EXETAT/TENAFEP', href: '/teacher/quizzes', icon: '📝' },
    { label: 'Messagerie Chat', href: '/chat', icon: '💬' },
  ];

  const navItems = userRole === 'teacher' ? teacherNavItems : adminNavItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-lg shadow-md">
          MEC
        </div>
        <div>
          <h2 className="font-bold text-white text-base leading-tight">E-RDC Admin</h2>
          <p className="text-xs text-teal-400 capitalize">{userRole.replace('_', ' ')}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation Principale
        </div>
        {navItems.map((item) => {
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
        Plateforme A_MEC Next.js 15
      </div>
    </aside>
  );
}
