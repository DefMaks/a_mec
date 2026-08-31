'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/role-context';
import { UserRole } from '@/types/database.types';
import { ShieldAlert, ArrowRight, Home, BookOpen, GraduationCap } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
  moduleName?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl,
  moduleName = 'ce module',
}: RoleGuardProps) {
  const { role, roleInfo, isSuperAdmin } = useRole();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Super admin has universal access
  const isAllowed = isSuperAdmin || allowedRoles.includes(role);

  if (!mounted) {
    return <>{children}</>;
  }

  if (!isAllowed) {
    const targetUrl =
      fallbackUrl ||
      (role === 'teacher' ? '/teacher/courses' : role === 'parent' ? '/parent/children' : '/');

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 text-center shadow-lg space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] border border-[#F87171]/40 text-[#DC2626] flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#B91C1C] text-xs font-bold uppercase tracking-wider border border-[#F87171]/30">
              Contrôle d'Accès Sécurisé
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0F2C59] tracking-tight">
              Accès Non Autorisé à {moduleName}
            </h2>
            <p className="text-xs md:text-sm text-[#64748B] max-w-lg mx-auto leading-relaxed">
              Votre session actuelle est identifiée sous le rôle{' '}
              <strong className="text-[#0F2C59] font-bold">{roleInfo.label}</strong>. Cette section
              est strictement réservée aux profils habilités.
            </p>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex flex-wrap items-center justify-center gap-3">
            <Link
              href={targetUrl}
              className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#163a6e] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              {role === 'teacher' ? (
                <>
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span>Mon Espace Cours & Leçons</span>
                </>
              ) : role === 'parent' ? (
                <>
                  <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                  <span>Mon Espace Famille & Enfants</span>
                </>
              ) : (
                <>
                  <Home className="w-4 h-4 text-[#D4AF37]" />
                  <span>Retour au Tableau de Bord</span>
                </>
              )}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => router.back()}
              className="px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] rounded-xl text-xs font-bold transition"
            >
              Page précédente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
