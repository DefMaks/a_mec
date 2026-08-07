'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/role-context';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { role, roleInfo, isSuperAdmin, isAdmin, isTeacher, isParent, isStudent } = useRole();

  let navItems: NavItem[] = [];

  if (isSuperAdmin) {
    navItems = [
      { label: "Vue Plateforme", href: '/', icon: '📊' },
      { label: 'Gestion Écoles', href: '/admin/schools', icon: '🏫' },
      { label: 'Tous Enseignants', href: '/admin/teachers', icon: '👨‍🏫' },
      { label: 'Élèves & Classes', href: '/admin/students', icon: '🎓' },
      { label: 'Parents Inscrit', href: '/admin/parents', icon: '👨‍👩‍👧' },
      { label: 'Recettes Twiga Pay', href: '/admin/payments', icon: '💳' },
      { label: 'Catalogue Cours', href: '/teacher/courses', icon: '📚' },
      { label: 'Banque Quizzes', href: '/teacher/quizzes', icon: '📝' },
      { label: 'Messagerie Chat', href: '/chat', icon: '💬' },
      { label: 'Paramètres', href: '/settings', icon: '⚙️' },
    ];
  } else if (isAdmin) {
    navItems = [
      { label: "Tableau de Bord", href: '/', icon: '📊' },
      { label: 'Enseignants École', href: '/admin/teachers', icon: '👨‍🏫' },
      { label: 'Élèves & Effectifs', href: '/admin/students', icon: '🎓' },
      { label: 'Parents Tuteurs', href: '/admin/parents', icon: '👨‍👩‍👧' },
      { label: 'Paiements Scolaires', href: '/admin/payments', icon: '💳' },
      { label: 'Cours & Chapitres', href: '/teacher/courses', icon: '📚' },
      { label: 'Quizzes Pédagogiques', href: '/teacher/quizzes', icon: '📝' },
      { label: 'Messagerie Établissement', href: '/chat', icon: '💬' },
      { label: 'Paramètres École', href: '/settings', icon: '⚙️' },
    ];
  } else if (isTeacher) {
    navItems = [
      { label: "Espace Enseignant", href: '/', icon: '📊' },
      { label: 'Mes Cours & Chapitres', href: '/teacher/courses', icon: '📚' },
      { label: 'Mes Quizzes (10 Qs)', href: '/teacher/quizzes', icon: '📝' },
      { label: 'Créer un Quiz', href: '/teacher/quizzes/new', icon: '➕' },
      { label: 'Chat avec Élèves', href: '/chat', icon: '💬' },
      { label: 'Mon Profil', href: '/settings', icon: '⚙️' },
    ];
  } else if (isParent) {
    navItems = [
      { label: "Espace Parent", href: '/', icon: '📊' },
      { label: 'Inscrire / Mes Enfants', href: '/parent/children', icon: '👶' },
      { label: 'Règlement Frais Twiga', href: '/parent/payments', icon: '💳' },
      { label: 'Chat École & Profs', href: '/chat', icon: '💬' },
      { label: 'Mon Compte', href: '/settings', icon: '⚙️' },
    ];
  } else if (isStudent) {
    navItems = [
      { label: "Mon Espace Classe", href: '/', icon: '📊' },
      { label: 'Mes Cours & Leçons', href: '/student/courses', icon: '📖' },
      { label: 'Passer les Quizzes', href: '/student/quizzes', icon: '✍️' },
      { label: 'Chat avec Professeurs', href: '/chat', icon: '💬' },
      { label: 'Mon Profil', href: '/settings', icon: '⚙️' },
    ];
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl">
      {/* App Branding */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-base shadow-md font-mono">
          {APP_SHORT_NAME}
        </div>
        <div>
          <h2 className="font-bold text-white text-sm leading-tight">{APP_NAME}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs">{roleInfo.icon}</span>
            <span className="text-[11px] text-teal-400 font-semibold">
              {roleInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
          <span>Menu - {roleInfo.label}</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${isActive
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Role Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center space-y-1">
        <div className="text-[11px] text-slate-400 font-medium truncate">
          Mode : <strong className="text-teal-400">{roleInfo.label}</strong>
        </div>
        <div className="text-[10px] text-slate-600">E-RDC (Mon Espace Classe)</div>
      </div>
    </aside>
  );
}