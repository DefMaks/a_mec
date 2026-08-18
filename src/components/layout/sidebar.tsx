'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRole } from '@/context/role-context';
import { useSidebar } from '@/context/sidebar-context';
import { RoleSwitcher } from './role-switcher';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CreditCard,
  MessageSquare,
  ClipboardCheck,
  Settings,
  HeartHandshake,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { roleInfo, isSuperAdmin, isAdmin, isTeacher, isParent, isStudent } = useRole();
  const { isCollapsed, toggleSidebar } = useSidebar();

  let sections: NavSection[] = [];

  if (isSuperAdmin || isAdmin) {
    sections = [
      {
        items: [
          { label: 'Tableau de Bord', href: '/', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Gestion Pédagogique',
        items: [
          { label: 'Matières & Disciplines', href: '/admin/matieres', icon: Layers, badge: 'RDC' },
          { label: 'Enseignants & Personnel', href: '/admin/teachers', icon: Users },
          { label: 'Élèves & Effectifs', href: '/admin/students', icon: GraduationCap },
          { label: 'Classes & Établissements', href: '/admin/schools', icon: Building2 },
          { label: 'Cours & Programme (E-RDC)', href: '/teacher/courses', icon: BookOpen, badge: 'STEM' },
          { label: 'Médiathèque & Schémas', href: '/teacher/media', icon: ImageIcon, badge: 'AVIF' },
        ],
      },
      {
        title: 'Finance & Comptabilité',
        items: [
          { label: 'Paiements & Minerval', href: '/admin/payments', icon: CreditCard },
          { label: 'Responsables & Parents', href: '/admin/parents', icon: HeartHandshake },
        ],
      },
      {
        title: 'Communication & Directives',
        items: [
          { label: 'Messagerie Établissement', href: '/chat', icon: MessageSquare, badge: 'Direct' },
        ],
      },
      {
        title: 'Évaluations & Examens',
        items: [
          { label: 'Quizzes & EXETAT (10 Qs)', href: '/teacher/quizzes', icon: ClipboardCheck },
        ],
      },
      {
        title: 'Configuration & Système',
        items: [
          { label: 'Paramètres Établissement', href: '/settings', icon: Settings },
        ],
      },
    ];
  } else if (isTeacher) {
    sections = [
      {
        items: [
          { label: 'Espace Enseignant', href: '/', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Pédagogie & Cours',
        items: [
          { label: 'Mes Cours & Chapitres', href: '/teacher/courses', icon: BookOpen },
          { label: 'Banque Quizzes (10 Qs)', href: '/teacher/quizzes', icon: ClipboardCheck },
          { label: 'Médiathèque (AVIF)', href: '/teacher/media', icon: ImageIcon, badge: 'Nouveau' },
          { label: 'Élèves & Effectifs', href: '/admin/students', icon: GraduationCap },
        ],
      },
      {
        title: 'Communication',
        items: [
          { label: 'Chat avec Élèves & École', href: '/chat', icon: MessageSquare },
        ],
      },
      {
        title: 'Profil',
        items: [
          { label: 'Paramètres du Compte', href: '/settings', icon: Settings },
        ],
      },
    ];
  } else if (isParent) {
    sections = [
      {
        items: [
          { label: 'Espace Parent & Tuteur', href: '/', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Suivi des Enfants',
        items: [
          { label: 'Mes Enfants Inscrits', href: '/parent/children', icon: GraduationCap },
          { label: 'Règlement Frais Twiga', href: '/parent/payments', icon: CreditCard },
        ],
      },
      {
        title: 'Communication',
        items: [
          { label: 'Messagerie Directe Profs', href: '/chat', icon: MessageSquare },
        ],
      },
      {
        title: 'Profil',
        items: [
          { label: 'Mon Compte Tuteur', href: '/settings', icon: Settings },
        ],
      },
    ];
  } else if (isStudent) {
    sections = [
      {
        items: [
          { label: 'Mon Espace Classe', href: '/', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Études & Révisions RDC',
        items: [
          { label: 'Mes Cours & Leçons', href: '/student/courses', icon: BookOpen },
          { label: 'Passer les Quizzes EXETAT', href: '/student/quizzes', icon: ClipboardCheck, badge: '10 Qs' },
        ],
      },
      {
        title: 'Communication',
        items: [
          { label: 'Échanger avec Profs', href: '/chat', icon: MessageSquare },
        ],
      },
      {
        title: 'Profil',
        items: [
          { label: 'Mon Code & Compte', href: '/settings', icon: Settings },
        ],
      },
    ];
  }

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[76px]' : 'w-[268px]'
      } bg-white text-[#1E293B] flex flex-col h-screen sticky top-0 border-r border-[#E2E8F0] shadow-sm z-30 select-none transition-all duration-300 ease-in-out`}
    >
      {/* Brand Header with Collapse Toggle */}
      <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs border border-[#E2E8F0] p-1 relative overflow-hidden flex-shrink-0">
            <Image
              src="/stem.avif"
              alt="Logo ADS"
              width={34}
              height={34}
              className="object-contain w-full h-full"
              priority
              referrerPolicy="no-referrer"
            />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="font-bold text-[#0F2C59] text-xs leading-tight truncate">
                {APP_NAME}
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-[#D4AF37] font-bold tracking-wide truncate">
                  {APP_SHORT_NAME} • RDC
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
          className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F2C59] hover:bg-[#F1F5F9] transition shadow-2xs flex-shrink-0"
          title={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#0F2C59]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#0F2C59]" />
          )}
        </button>
      </div>

      {/* Categorized Navigation */}
      <nav className="flex-1 p-2.5 space-y-3 overflow-y-auto">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && !isCollapsed && (
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-2.5 py-1">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                  } rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#0F2C59] font-bold border-l-4 border-[#D4AF37] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F2C59] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-[#0F2C59]' : 'text-[#64748B] group-hover:text-[#0F2C59]'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isActive
                          ? 'bg-[#0F2C59] text-[#D4AF37]'
                          : 'bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Role Switcher in Sidebar Footer */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
        <RoleSwitcher isCollapsed={isCollapsed} />

        {!isCollapsed && (
          <div className="text-[10px] text-[#64748B] text-center pt-1">
            <span>Portail Académie du Salut • RDC</span>
          </div>
        )}
      </div>
    </aside>
  );
}
