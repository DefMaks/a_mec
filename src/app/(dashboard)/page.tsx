'use client';

import React from 'react';
import Link from 'next/link';
import { useSchools } from '@/hooks/use-schools';
import { useTeachers } from '@/hooks/use-teachers';
import { useStudents } from '@/hooks/use-students';
import { usePayments } from '@/hooks/use-payments';
import { useQuizzes } from '@/hooks/use-quizzes';
import { useCourses } from '@/hooks/use-courses';
import { useTeacherMe, useTeacherChapters } from '@/hooks/use-teacher-data';
import { useRole } from '@/context/role-context';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';
import {
  CreditCard,
  Users,
  GraduationCap,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  ClipboardCheck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Plus,
  Volume2,
  FileDown,
  Award,
  Layers,
  HelpCircle,
  Calendar,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { roleInfo, isSuperAdmin, isAdmin, isTeacher, isParent, isStudent } = useRole();
  const { data: schools } = useSchools();
  const { data: teachers } = useTeachers();
  const { data: students } = useStudents();
  const { data: payments } = usePayments();
  const { data: quizzes } = useQuizzes();
  const { data: courses } = useCourses();

  // Teacher specific data (Simulation Professeur Shasa: auth.user b6416211-0e05-4432-85e9-c5b3b243e543)
  const { data: teacherMe } = useTeacherMe();
  const { data: teacherChaptersData } = useTeacherChapters(teacherMe?.profileId || null);

  const teacherCoursList = teacherChaptersData?.cours || courses || [];
  const teacherChapitresList = teacherChaptersData?.chapitres || [];
  const teacherTotalMinutes = teacherChapitresList.reduce(
    (acc, ch) => acc + (ch.duree_minutes || 30),
    0
  );

  const validPayments = (payments || []).filter(
    (p) => p.statut === 'completed' || (p.statut as string) === 'VALIDE'
  );

  const totalRevenue = (payments || []).reduce((acc, curr) => {
    const isValid = curr.statut === 'completed' || (curr.statut as string) === 'VALIDE';
    const amount = (curr as any).montant_usd || curr.montant || 0;
    return isValid ? acc + amount : acc;
  }, 0);

  // ==========================================
  // VUE PROFESSEUR (STRICTEMENT SANS FINANCE)
  // ==========================================
  if (isTeacher) {
    const teacherName = teacherMe?.nomComplet || roleInfo.userName || 'Professeur Shasa';
    const teacherSpecialite = teacherMe?.teacherMeta?.specialite || 'STEM / Math-Physique & TICE';

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* En-tête Enseignant */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#EFF6FF] text-[#0F2C59] border border-[#0F2C59]/20 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                {APP_NAME} ({APP_SHORT_NAME})
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#FAF5FF] text-[#7E22CE] border border-[#7E22CE]/30 flex items-center gap-1">
                <span>👨‍🏫</span>
                <span>Session Active : {teacherName}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                auth: {teacherMe?.authUserId?.slice(0, 8)}...
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
              Espace Pédagogique Enseignant
            </h1>

            <p className="text-sm text-[#64748B] max-w-2xl">
              Bienvenue, {teacherName} ({teacherSpecialite}). Gérez vos cours, publiez vos leçons interactives et suivez les séries de quiz standardisées 10 questions pour vos classes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 z-10 self-start md:self-center">
            <Link
              href="/teacher/courses"
              className="px-4 py-2 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Nouveau Chapitre</span>
            </Link>
            <Link
              href="/teacher/quizzes/new"
              className="px-4 py-2 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#D4AF37]/40 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Créer Quiz (10 Qs)</span>
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#0F2C59] border border-[#E2E8F0] rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Chat Classes</span>
            </Link>
          </div>
        </div>

        {/* CARTES KPI STRICTEMENT PÉDAGOGIQUES (0% FINANCE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Mes Cours & Matières */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#0F2C59]/40 transition group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  MES COURS ASSIGNÉS
                </p>
                <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                  {teacherCoursList.length} <span className="text-xs font-bold text-[#64748B]">Matières</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center border border-[#0F2C59]/10 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-[#0F2C59]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                Programme STEM RDC
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">Actifs</span>
            </div>
          </div>

          {/* Card 2: Chapitres & Leçons Publiés */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#D4AF37]/50 transition group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  LEÇONS & CHAPITRES
                </p>
                <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                  {teacherChapitresList.length} <span className="text-xs font-bold text-[#64748B]">Publiés</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3" />
                ~{Math.round(teacherTotalMinutes / 60)}h d'apprentissage
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">Audio & PDF</span>
            </div>
          </div>

          {/* Card 3: Élèves & Classes Encadrées */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#10B981]/40 transition group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  ÉLÈVES ENCADRÉS
                </p>
                <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                  {students?.length || 184} <span className="text-xs font-bold text-[#64748B]">Élèves</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center border border-[#059669]/10 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-[#059669]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                Classes ADS
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">Kinshasa</span>
            </div>
          </div>

          {/* Card 4: Banque Quizzes 10 Qs */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#7E22CE]/40 transition group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  BANQUE QUIZZES (10 Qs)
                </p>
                <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                  {quizzes?.length || 4} <span className="text-xs font-bold text-[#64748B]">Séries QCM</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] text-[#7E22CE] flex items-center justify-center border border-[#7E22CE]/20 group-hover:scale-105 transition-transform">
                <ClipboardCheck className="w-5 h-5 text-[#7E22CE]" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7E22CE] bg-[#FAF5FF] px-2 py-0.5 rounded-md">
                TENAFEP & EXETAT
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">10/10 Notés</span>
            </div>
          </div>
        </div>

        {/* SECTION PRINCIPALE PÉDAGOGIQUE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne Gauche (2 colonnes): Dernières Leçons & Chapitres Publiés */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                    <span>Dernières Leçons & Chapitres Pédagogiques</span>
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Contenus multimédias (supports PDF et podcasts audio) publiés pour vos classes
                  </p>
                </div>
                <Link
                  href="/teacher/courses"
                  className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
                >
                  <span>Gérer tous les cours</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Chapitre / Leçon</th>
                      <th className="px-5 py-3.5">Cours & Matière</th>
                      <th className="px-5 py-3.5">Supports</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                    {teacherChapitresList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-xs text-[#64748B]">
                          Aucun chapitre publié pour le moment. Cliquez sur "Nouveau Chapitre" pour débuter.
                        </td>
                      </tr>
                    ) : (
                      teacherChapitresList.slice(0, 6).map((ch, idx) => (
                        <tr key={ch.id || idx} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-[#0F2C59] flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-[#EFF6FF] text-[#0F2C59] text-[10px] font-bold flex items-center justify-center border border-[#0F2C59]/10">
                                {ch.position || ch.ordre || idx + 1}
                              </span>
                              <span>{ch.titre}</span>
                            </div>
                            <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {ch.duree_minutes || 30} min
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-[#1E293B]">
                              {ch.cours?.titre || 'Cours STEM'}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              {ch.cours?.matiere_nom || 'Discipline'} • {ch.cours?.classe || 'Classe ADS'}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {ch.pdf_url && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#1D4ED8]/20">
                                  <FileDown className="w-2.5 h-2.5" /> PDF
                                </span>
                              )}
                              {ch.audio_url && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF5FF] text-[#7E22CE] border border-[#7E22CE]/20">
                                  <Volume2 className="w-2.5 h-2.5" /> Audio
                                </span>
                              )}
                              {!ch.pdf_url && !ch.audio_url && (
                                <span className="text-[11px] text-[#94A3B8]">Texte interactif</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href="/teacher/courses"
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F2C59] transition"
                            >
                              Ouvrir
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Séries de Quiz QCM 10 Questions Actives */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span>Banque de Quizzes Standardisés (10 Qs)</span>
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Évaluations formatives et préparation aux examens nationaux RDC
                  </p>
                </div>
                <Link
                  href="/teacher/quizzes"
                  className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
                >
                  <span>Tous les quiz</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(quizzes || []).slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#D4AF37]/50 transition bg-[#F8FAFC] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#D4AF37]/30 uppercase">
                          {q.niveau}
                        </span>
                        <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded">
                          {q.total_questions || 10} Questions
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-[#0F2C59] mt-2 line-clamp-1">
                        {q.titre}
                      </h3>
                      <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                        {q.matiere_nom || q.classe || 'Discipline STEM'} • {q.duree_minutes} min
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[10px] text-[#64748B] font-medium">Notation sur 10 pts</span>
                      <Link
                        href="/teacher/quizzes"
                        className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
                      >
                        Consulter <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne Droite: Raccourcis Pédagogiques & Guide Méthodologique */}
          <div className="space-y-6">
            {/* Actions Rapides Enseignant */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Actions Pédagogiques Rapides</span>
              </h3>

              <div className="space-y-2">
                <Link
                  href="/teacher/courses"
                  className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center font-bold text-xs">
                      📖
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F2C59]">Ajouter une Leçon / Audio</p>
                      <p className="text-[11px] text-[#64748B]">Intégrer support PDF et podcast</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
                </Link>

                <Link
                  href="/teacher/quizzes/new"
                  className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                      📝
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F2C59]">Créer une Série Quiz (10 Qs)</p>
                      <p className="text-[11px] text-[#64748B]">QCM normé TENAFEP / EXETAT</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
                </Link>

                <Link
                  href="/admin/students"
                  className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-xs">
                      🎓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F2C59]">Consulter les Effectifs</p>
                      <p className="text-[11px] text-[#64748B]">Élèves inscrits dans vos classes</p>
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
                      <p className="text-xs font-bold text-[#0F2C59]">Messagerie & Directives</p>
                      <p className="text-[11px] text-[#64748B]">Échanger avec l'administration</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
                </Link>
              </div>
            </div>

            {/* Directives Pédagogiques STEM Box */}
            <div className="bg-[#0F2C59] text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Directives STEM RDC
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">Norme 10 Qs</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                Standardisation des Évaluations (TENAFEP / EXETAT)
              </h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Chaque module d'apprentissage doit comporter un chapitre théorique, une fiche mémo PDF téléchargeable, et un test de validation de 10 questions à choix multiples avec corrigé explicatif.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VUE ADMIN & SUPER ADMIN (AVEC GESTION INSTITUTIONNELLE ET FINANCIÈRE)
  // =========================================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Institutional Banner */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#EFF6FF] text-[#0F2C59] border border-[#0F2C59]/20 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              {APP_NAME} ({APP_SHORT_NAME})
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#FFFBEB] text-[#B45309] border border-[#D4AF37]/40 flex items-center gap-1">
              <span>{roleInfo.icon}</span>
              <span>Vue : {roleInfo.label}</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
            Tableau de Bord Administratif & Financier
          </h1>

          <p className="text-sm text-[#64748B] max-w-2xl">
            Supervision académique, gestion des effectifs et suivi des règlements de minerval Mobile Money.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 self-start md:self-center">
          <Link
            href="/teacher/courses"
            className="px-4 py-2 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Catalogue STEM</span>
          </Link>
          <Link
            href="/chat"
            className="px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#0F2C59] border border-[#E2E8F0] rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Messagerie</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS (ADMIN / SUPER ADMIN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Minerval Collecté */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#D4AF37]/50 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                MINERVAL COLLECTÉ
              </p>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                ${totalRevenue.toLocaleString()}.00 <span className="text-xs font-bold text-[#64748B]">USD</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center border border-[#0F2C59]/10 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 text-[#0F2C59]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" />
              +12% ce mois
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">{validPayments.length} paiements validés</span>
          </div>
        </div>

        {/* Card 2: Effectif Élèves */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#D4AF37]/50 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                EFFECTIF ÉLÈVES
              </p>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                {students?.length || 184} <span className="text-xs font-bold text-[#64748B]">Inscrits</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
              4 Classes actives
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">Codes générés</span>
          </div>
        </div>

        {/* Card 3: Corps Enseignant */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#D4AF37]/50 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                CORPS ENSEIGNANT
              </p>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                {teachers?.length || 12} <span className="text-xs font-bold text-[#64748B]">Professeurs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center border border-[#0F2C59]/10 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-[#0F2C59]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              100% Qualifiés
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">STEM RDC</span>
          </div>
        </div>

        {/* Card 4: Cours & Quizzes */}
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#D4AF37]/50 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                COURS & QUIZZES (10 Qs)
              </p>
              <div className="text-2xl lg:text-3xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
                {courses?.length || 8} <span className="text-xs font-bold text-[#64748B]">Matières</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-md">
              TENAFEP & EXETAT
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">{quizzes?.length || 4} Séries QCM</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Transactions Récentes & Raccourcis Institutionnels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Derniers Paiements Minerval Twiga Pay */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                <span>Paiements Récents & Minerval</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Transactions Mobile Money enregistrées pour l'Académie du Salut
              </p>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Référence & Date</th>
                  <th className="px-5 py-3.5">Élève / Parent</th>
                  <th className="px-5 py-3.5">Montant</th>
                  <th className="px-5 py-3.5">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                {(payments || []).slice(0, 5).map((p) => {
                  const isCompleted = p.statut === 'completed' || (p.statut as string) === 'VALIDE';
                  return (
                    <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-[#0F2C59]">{p.order_id}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {new Date(p.created_at).toLocaleDateString('fr-FR')} • {p.mode_paiement}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[#1E293B]">
                          {p.parent?.nom_complet || 'Parent responsable'}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Élève : {p.eleve?.pseudonyme || 'Élève ADS'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#0F2C59] font-tabular">
                        ${p.montant}.00 {p.devise}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            isCompleted
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : p.statut === 'pending'
                              ? 'bg-[#FEF3C7] text-[#B45309]'
                              : 'bg-[#FEE2E2] text-[#B91C1C]'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Validé
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              En attente
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Derniers Élèves Inscrits & Accès Rapides */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Actions & Modules Clés</span>
            </h3>

            <div className="space-y-2">
              <Link
                href="/admin/students"
                className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center font-bold text-xs">
                    🎓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F2C59]">Inscrire un Élève</p>
                    <p className="text-[11px] text-[#64748B]">Générer le code d'accès unique</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
              </Link>

              <Link
                href="/admin/teachers"
                className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                    👨‍🏫
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F2C59]">Gérer le Personnel</p>
                    <p className="text-[11px] text-[#64748B]">Affectation des cours et classes</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
              </Link>

              <Link
                href="/teacher/quizzes"
                className="p-3 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#0F2C59]/30 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center font-bold text-xs">
                    📝
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F2C59]">Banque Quizzes (10 Qs)</p>
                    <p className="text-[11px] text-[#64748B]">Création QCM TENAFEP & EXETAT</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59]" />
              </Link>
            </div>
          </div>

          {/* Directives Établissement Box */}
          <div className="bg-[#0F2C59] text-white rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Académie du Salut
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">STEM - RDC</span>
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">
              Programme Officiel & Examens d'État
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              La plateforme garantit la continuité pédagogique en RDC avec notation standardisée sur 10 questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
