'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  HeartHandshake,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Clock,
  BookOpen,
  ClipboardCheck,
  ArrowUpRight,
  UserPlus,
  MessageSquare,
  Award,
  Calendar,
  AlertCircle,
  FileText,
  Phone,
  ShieldCheck,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useStudents } from '@/hooks/use-students';
import { usePayments } from '@/hooks/use-payments';
import { useQuizzes } from '@/hooks/use-quizzes';
import { APP_NAME, APP_SHORT_NAME, isProduction } from '@/lib/config';
import { calculateAccessCountdown } from '@/lib/access-code-utils';

export function ParentDashboard() {
  const { data: students } = useStudents();
  const { data: payments } = usePayments();
  const { data: quizzes } = useQuizzes();
  const isProd = isProduction();

  // Liste des enfants rattachés à ce parent
  const myChildren = (students && students.length > 0)
    ? [
        {
          id: students[0]?.id || 'child-1',
          nom_complet: students[0]?.nom_complet || 'Joel Mukendi',
          pseudonyme: students[0]?.pseudonyme || 'Joel M.',
          matricule: students[0]?.matricule || 'ADS-2025-0042',
          code_acces: students[0]?.code_acces || 'ADS-7842',
          classe: '4ème Humanités Math-Physique',
          titulaire: 'Professeur Shasa',
          assiduite: '98.5%',
          moyenne: '16.8 / 20',
          quizEffectues: 8,
          dernierQuizNote: '9 / 10 (Mathématiques)',
          fraisStatut: 'À JOUR (Trimestre 1 Validé)',
          photoColor: 'bg-[#0F2C59]',
        },
        {
          id: students[1]?.id || 'child-2',
          nom_complet: students[1]?.nom_complet || 'Sarah Kabongo Mukendi',
          pseudonyme: students[1]?.pseudonyme || 'Sarah K.',
          matricule: 'ADS-2025-0089',
          code_acces: 'ADS-3319',
          classe: '6ème Primaire (TENAFEP)',
          titulaire: 'Mme Marie Kabamba',
          assiduite: '96.0%',
          moyenne: '17.2 / 20',
          quizEffectues: 6,
          dernierQuizNote: '10 / 10 (Sciences & Éveil)',
          fraisStatut: 'À JOUR (Trimestre 1 Validé)',
          photoColor: 'bg-[#7E22CE]',
        },
      ]
    : [
        {
          id: 'child-1',
          nom_complet: 'Joel Mukendi',
          pseudonyme: 'Joel M.',
          matricule: 'ADS-2025-0042',
          code_acces: 'ADS-7842',
          classe: '4ème Humanités Math-Physique',
          titulaire: 'Professeur Shasa',
          assiduite: '98.5%',
          moyenne: '16.8 / 20',
          quizEffectues: 8,
          dernierQuizNote: '9 / 10 (Mathématiques)',
          fraisStatut: 'À JOUR (Trimestre 1 Validé)',
          photoColor: 'bg-[#0F2C59]',
        },
        {
          id: 'child-2',
          nom_complet: 'Sarah Kabongo Mukendi',
          pseudonyme: 'Sarah K.',
          matricule: 'ADS-2025-0089',
          code_acces: 'ADS-3319',
          classe: '6ème Primaire (TENAFEP)',
          titulaire: 'Mme Marie Kabamba',
          assiduite: '96.0%',
          moyenne: '17.2 / 20',
          quizEffectues: 6,
          dernierQuizNote: '10 / 10 (Sciences & Éveil)',
          fraisStatut: 'À JOUR (Trimestre 1 Validé)',
          photoColor: 'bg-[#7E22CE]',
        },
      ];

  const [selectedChildId, setSelectedChildId] = useState<string>(myChildren[0].id);
  const activeChild = myChildren.find((c) => c.id === selectedChildId) || myChildren[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Welcome & Enrollment Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#EFF6FF] text-[#0F2C59] border border-[#0F2C59]/20 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <HeartHandshake className="w-3 h-3 text-[#D4AF37]" />
              Portail Famille & Tuteurs
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] border border-[#16A34A]/30">
              Année Scolaire 2025 - 2026
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
            Espace Suivi Scolaire & Admissions
          </h1>

          <p className="text-xs md:text-sm text-[#64748B] max-w-2xl">
            Supervisez la scolarité de vos enfants, consultez les résultats des quiz standardisés RDC (10 Qs), réglez les frais par Mobile Money et effectuez de nouvelles inscriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10 self-start md:self-center">
          <Link
            href="/parent/enrollment"
            className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Inscrire un Enfant</span>
          </Link>
          <Link
            href="/parent/payments"
            className="px-4 py-2.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#D4AF37]/40 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Payer Minerval Twiga</span>
          </Link>
        </div>
      </div>

      {/* 2. Quick Child Selector Bar (Appmedo Family UX) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider px-2">
            Enfant sélectionné :
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {myChildren.map((child) => {
              const isSelected = child.id === selectedChildId;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-xs'
                      : 'bg-[#F8FAFC] text-[#1E293B] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                      isSelected ? 'bg-[#D4AF37] text-[#0F2C59]' : 'bg-[#E2E8F0] text-[#0F2C59]'
                    }`}
                  >
                    {child.nom_complet.charAt(0)}
                  </span>
                  <span>{child.nom_complet}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#64748B]'}`}>
                    ({child.classe.split(' ')[0]} {child.classe.split(' ')[1] || ''})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Link
          href="/parent/enrollment"
          className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1 self-end sm:self-center px-2"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>+ Inscrire un autre enfant</span>
        </Link>
      </div>

      {/* 3. Active Child Synthetic Profile & KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Classe & Code d'accès élève */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#0F2C59]/40 transition group">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  CODE ACCÈS ÉLÈVE
                </p>
                <span className="text-[9px] font-extrabold bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.5 rounded">
                  Actif
                </span>
              </div>
              <div className="text-2xl font-mono font-extrabold text-[#0F2C59] mt-1.5 tracking-wider">
                {activeChild.code_acces}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center border border-[#0F2C59]/10 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-[#0F2C59]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F2C59]">{activeChild.classe}</span>
            <Link
              href="/parent/payments"
              className="text-[11px] font-bold text-[#D4AF37] hover:underline"
            >
              Renouveler →
            </Link>
          </div>
        </div>

        {/* KPI 2: Assiduité & Présence */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#10B981]/40 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                TAUX DE PRÉSENCE
              </p>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#15803D] mt-2 font-tabular">
                {activeChild.assiduite}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center border border-[#059669]/10 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-[#059669]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" />
              Excellente assiduité
            </span>
            <span className="text-[11px] text-[#64748B]">Semestre 1</span>
          </div>
        </div>

        {/* KPI 3: Moyenne & Quiz (10 Qs) */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#D4AF37]/50 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                MOYENNE GÉNÉRALE STEM
              </p>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                {activeChild.moyenne}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-md">
              {activeChild.quizEffectues} Quiz passés
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">Norme 10 Qs</span>
          </div>
        </div>

        {/* KPI 4: Statut Frais de Scolarité */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#0F2C59]/40 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                SITUATION FINANCIÈRE
              </p>
              <div className="text-base font-extrabold text-[#15803D] mt-2">
                En Règle
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center border border-[#16A34A]/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 text-[#15803D]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="text-[11px] text-[#64748B]">1er Trimestre Payé</span>
            <Link
              href="/parent/payments"
              className="text-[11px] font-bold text-[#0F2C59] hover:underline flex items-center gap-0.5"
            >
              Détails <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Main Two Columns: Activité Pédagogique Enfant & Raccourcis Famille */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche (2 cols) : Quiz & Évaluations Récentes de l'Enfant */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Derniers Quiz & Évaluations (10 Qs) de {activeChild.nom_complet}</span>
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Résultats des QCM formatives et révisions d'examens d'État (TENAFEP / EXETAT)
                </p>
              </div>
              <Link
                href="/parent/children"
                className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
              >
                <span>Fiche complète</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Discipline / Matière</th>
                    <th className="px-5 py-3.5">Type Évaluation</th>
                    <th className="px-5 py-3.5">Score sur 10</th>
                    <th className="px-5 py-3.5 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                  <tr className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#0F2C59]">Mathématiques : Algèbre & Équations</div>
                      <div className="text-[11px] text-[#64748B]">Professeur Shasa • 10 Questions</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#D4AF37]/30">
                        EXETAT STEM
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-sm text-[#15803D] font-tabular">9 / 10 pts</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                        <CheckCircle2 className="w-3 h-3" />
                        Validé (90%)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#0F2C59]">Physique : Cinématique & Vecteurs</div>
                      <div className="text-[11px] text-[#64748B]">Professeur Shasa • 10 Questions</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#1D4ED8]/20">
                        Contrôle Continu
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-sm text-[#15803D] font-tabular">8 / 10 pts</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
                        <CheckCircle2 className="w-3 h-3" />
                        Validé (80%)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#0F2C59]">Chimie : Structure Atomique</div>
                      <div className="text-[11px] text-[#64748B]">M. Ilunga • 10 Questions</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF5FF] text-[#7E22CE] border border-[#7E22CE]/20">
                        Quiz de Module
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-sm text-[#15803D] font-tabular">10 / 10 pts</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5FF] text-[#7E22CE] border border-[#7E22CE]/30">
                        Parfait (100%)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Horaires et Cours de la Semaine */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F2C59] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>Horaires & Enseignants Référents ({activeChild.classe})</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                Titulaire : {activeChild.titulaire}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Lundi - Mercredi</span>
                <p className="text-xs font-bold text-[#0F2C59] mt-1">Mathématiques & Physique</p>
                <p className="text-[11px] text-[#64748B]">08h00 - 12h30 • Salle STEM 04</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Mardi - Jeudi</span>
                <p className="text-xs font-bold text-[#0F2C59] mt-1">Chimie, Bio & TICE</p>
                <p className="text-[11px] text-[#64748B]">08h00 - 12h30 • Labo Sciences</p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Vendredi</span>
                <p className="text-xs font-bold text-[#0F2C59] mt-1">Français & Philosophie</p>
                <p className="text-[11px] text-[#64748B]">08h00 - 11h45 • Bibliothèque</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Droite: Raccourcis Parents & Établissement */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Actions & Services Famille</span>
            </h3>

            <div className="space-y-2">
              <Link
                href="/parent/enrollment"
                className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center font-bold text-xs">
                    📝
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F2C59]">Inscrire un Enfant (2025-2026)</p>
                    <p className="text-[11px] text-[#64748B]">Dossier d'admission en ligne</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
              </Link>

              <Link
                href="/parent/payments"
                className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold text-xs">
                    💳
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F2C59]">Règlement Minerval Twiga</p>
                    <p className="text-[11px] text-[#64748B]">Paiement instantané M-Pesa / Airtel</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
              </Link>

              <Link
                href="/chat"
                className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF5FF] text-[#7E22CE] flex items-center justify-center font-bold text-xs">
                    💬
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F2C59]">Messagerie avec les Titulaires</p>
                    <p className="text-[11px] text-[#64748B]">Contact direct avec l'école</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
              </Link>
            </div>
          </div>

          {/* Contact Direct Établissement ADS */}
          <div className="bg-[#0F2C59] text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secrétariat & Économat
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">ADS Kinshasa</span>
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">
              Assistance & Horaires d'Ouverture
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Le secrétariat académique est ouvert du lundi au vendredi de 07h30 à 15h30 pour toute demande de certificat ou validation de dossier.
            </p>
            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
              <span className="text-[#D4AF37] font-bold flex items-center gap-1">
                <Phone className="w-3 h-3" />
                +243 81 000 0000
              </span>
              <span className="text-white/70">contact@academiedusalut.cd</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
