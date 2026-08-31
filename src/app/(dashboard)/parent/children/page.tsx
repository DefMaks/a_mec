'use client';

import React from 'react';
import Link from 'next/link';
import { useStudents } from '@/hooks/use-students';
import { useRole } from '@/context/role-context';
import { RoleGuard } from '@/components/layout/role-guard';
import { calculateAccessCountdown } from '@/lib/access-code-utils';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  ArrowUpRight,
  Clock,
  Award,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

export default function ParentChildrenPage() {
  const { data: students, isLoading } = useStudents();
  const { roleInfo } = useRole();

  const myChildren = (students && students.length > 0)
    ? students.slice(0, 2)
    : [
        {
          id: 'child-1',
          pseudonyme: 'Joel M.',
          nom_complet: 'Joel Mukendi',
          matricule: 'ADS-2025-0042',
          code_acces: 'ADS-7842',
          classe: '4ème Humanités Math-Physique',
          classe_nom: '4ème Humanités Math-Physique',
          derniere_mise_a_jour_code: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          date_expiration_code: new Date(Date.now() + 28 * 24 * 3600 * 1000).toISOString(),
          forfait_actif: 'mensuel',
          created_at: new Date().toISOString(),
        },
        {
          id: 'child-2',
          pseudonyme: 'Sarah K.',
          nom_complet: 'Sarah Kabongo',
          matricule: 'ADS-2025-0089',
          code_acces: 'ADS-3319',
          classe: '6ème Primaire (TENAFEP)',
          classe_nom: '6ème Primaire (TENAFEP)',
          derniere_mise_a_jour_code: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          date_expiration_code: new Date(Date.now() + 28 * 24 * 3600 * 1000).toISOString(),
          forfait_actif: 'mensuel',
          created_at: new Date().toISOString(),
        },
      ];

  return (
    <RoleGuard allowedRoles={['parent', 'super_admin', 'admin']} moduleName="l'Espace Famille & Enfants">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* En-tête Espace Parent */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <HeartHandshake className="w-3 h-3 text-[#D4AF37]" />
              Espace Famille & Tuteurs
            </span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              Année 2025 - 2026
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Suivi Pédagogique & Validité des Codes d'Accès
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            Consultez les codes d'accès sécurisés de vos enfants et suivez le décompte de leur abonnement calculé depuis la dernière mise à jour.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <Link
            href="/parent/enrollment"
            className="px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F2C59] rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <span>+ Inscrire un Enfant</span>
          </Link>
          <Link
            href="/parent/payments"
            className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <span>Renouveler Code (Twiga Pay)</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </Link>
        </div>
      </div>

      {/* Liste des Enfants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myChildren.map((child: any, idx: number) => {
          const countdown = calculateAccessCountdown(
            child.derniere_mise_a_jour_code,
            child.date_expiration_code,
            child.forfait_actif === 'annuel' ? 365 : child.forfait_actif === 'trimestriel' ? 90 : 30
          );

          return (
            <div
              key={child.id || idx}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-5 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-extrabold text-base shadow-xs border border-[#D4AF37]/30">
                      {child.pseudonyme?.slice(0, 2).toUpperCase() || 'EL'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#0F2C59]">
                        {child.nom_complet || child.pseudonyme}
                      </h3>
                      <p className="text-xs text-[#64748B] font-medium">
                        {child.classe_nom || child.classe || 'Classe ADS Kinshasa'}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${countdown.badgeBg} ${countdown.badgeColor}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {countdown.badgeLabel}
                  </span>
                </div>

                {/* Code d'accès & Décompte */}
                <div className="mt-5 grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">
                      Code d'accès Élève
                    </span>
                    <span className="font-mono text-sm font-extrabold text-[#0F2C59]">
                      {child.code_acces || 'ADS-4091'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">
                      Dernière Mise à Jour
                    </span>
                    <span className="text-xs font-bold text-[#475569]">
                      {countdown.lastUpdatedFormatted}
                    </span>
                  </div>
                </div>

                {/* Barre de Progression de l'Abonnement */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#64748B]">Validité Code ({child.forfait_actif || 'Mensuel'})</span>
                    <span className="text-[#0F2C59] font-bold">Expire le {countdown.expiresAtFormatted}</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0F2C59] h-full rounded-full transition-all"
                      style={{ width: `${Math.max(10, 100 - countdown.progressPercent)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <Link
                  href="/chat"
                  className="text-xs font-semibold text-[#64748B] hover:text-[#0F2C59] transition"
                >
                  Contacter le titulaire
                </Link>
                <Link
                  href="/parent/payments"
                  className="px-3.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0F2C59] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Prolonger l'accès</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </RoleGuard>
  );
}
