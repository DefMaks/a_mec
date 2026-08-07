'use client';

import React from 'react';
import Link from 'next/link';
import { useSchools } from '@/hooks/use-schools';
import { useTeachers } from '@/hooks/use-teachers';
import { useStudents } from '@/hooks/use-students';
import { usePayments } from '@/hooks/use-payments';
import { useQuizzes } from '@/hooks/use-quizzes';
import { useCourses } from '@/hooks/use-courses';
import { useRole } from '@/context/role-context';
import { APP_NAME, APP_SHORT_NAME, DEFAULT_SCHOOL_ID } from '@/lib/config';

export default function DashboardOverviewPage() {
  const { roleInfo, isSuperAdmin, isAdmin, isTeacher, isParent, isStudent } = useRole();
  const { data: schools } = useSchools();
  const { data: teachers } = useTeachers();
  const { data: students } = useStudents();
  const { data: payments } = usePayments();
  const { data: quizzes } = useQuizzes();
  const { data: courses } = useCourses();

  const totalRevenue = (payments || []).reduce((acc, curr) => {
    return curr.statut === 'VALIDE' ? acc + (curr.montant_usd || 0) : acc;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-900 border border-teal-500/20 p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {APP_NAME} ({APP_SHORT_NAME})
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${roleInfo.colorClass}`}>
              {roleInfo.icon} {roleInfo.label}
            </span>
            {DEFAULT_SCHOOL_ID && !isSuperAdmin && (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                ID École : {DEFAULT_SCHOOL_ID.slice(0, 8)}...
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Tableau de Bord - {roleInfo.label}
          </h1>

          <p className="text-sm md:text-base text-slate-300">
            {roleInfo.description}
          </p>
        </div>
      </div>

      {/* Role-Specific KPI Grid */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Écoles RDC</span>
              <span className="text-2xl">🏫</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{schools?.length || 1}</div>
            <div className="text-xs text-amber-400 font-medium mt-1">Plateforme Nationale Multi-Écoles</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tous Enseignants</span>
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{teachers?.length || 0}</div>
            <div className="text-xs text-purple-400 font-medium mt-1">Total Enseignants Réseau</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Effectif Élèves</span>
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{students?.length || 0}</div>
            <div className="text-xs text-emerald-400 font-medium mt-1">Élèves enregistrés en RDC</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recettes Twiga Pay</span>
              <span className="text-2xl">💳</span>
            </div>
            <div className="text-3xl font-extrabold text-teal-400 mt-3">${totalRevenue.toLocaleString()} USD</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Total global collecté</div>
          </div>
        </div>
      )}

      {isAdmin && !isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mon Établissement</span>
              <span className="text-2xl">🏫</span>
            </div>
            <div className="text-2xl font-extrabold text-white mt-3">{APP_NAME}</div>
            <div className="text-xs text-teal-400 font-medium mt-1">Gestion exclusive de l école</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enseignants ADS</span>
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{teachers?.length || 0}</div>
            <div className="text-xs text-purple-400 font-medium mt-1">Corps professoral</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Élèves Inscrits</span>
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{students?.length || 0}</div>
            <div className="text-xs text-emerald-400 font-medium mt-1">Classes actives</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Minerval Collecté</span>
              <span className="text-2xl">💳</span>
            </div>
            <div className="text-3xl font-extrabold text-teal-400 mt-3">${totalRevenue.toLocaleString()} USD</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Paiements validés</div>
          </div>
        </div>
      )}

      {isTeacher && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cours Publiés</span>
              <span className="text-2xl">📚</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{courses?.length || 0}</div>
            <div className="text-xs text-teal-400 font-medium mt-1">Cours avec chapitres et audio</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quizzes (10 Qs)</span>
              <span className="text-2xl">📝</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{quizzes?.length || 0}</div>
            <div className="text-xs text-purple-400 font-medium mt-1">Évaluations EXETAT créées</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Élèves à Suivre</span>
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{students?.length || 0}</div>
            <div className="text-xs text-emerald-400 font-medium mt-1">Élèves inscrits dans vos classes</div>
          </div>
        </div>
      )}

      {isParent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mes Enfants Inscrits</span>
              <span className="text-2xl">👶</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{students?.length || 0}</div>
            <div className="text-xs text-blue-400 font-medium mt-1">Élèves rattachés à votre compte</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frais Réglementaires</span>
              <span className="text-2xl">💳</span>
            </div>
            <div className="text-3xl font-extrabold text-teal-400 mt-3">${totalRevenue.toLocaleString()} USD</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Paiements Twiga Pay effectués</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">École Partenaire</span>
              <span className="text-2xl">🏫</span>
            </div>
            <div className="text-lg font-bold text-white mt-3">{APP_NAME}</div>
            <div className="text-xs text-emerald-400 font-medium mt-1">Système RDC officiel</div>
          </div>
        </div>
      )}

      {isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cours Disponibles</span>
              <span className="text-2xl">📖</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{courses?.length || 0}</div>
            <div className="text-xs text-emerald-400 font-medium mt-1">Leçons & révisions du programme</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quizzes EXETAT</span>
              <span className="text-2xl">✍️</span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{quizzes?.length || 0}</div>
            <div className="text-xs text-purple-400 font-medium mt-1">Séries de 10 questions à réussir</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mon Établissement</span>
              <span className="text-2xl">🏫</span>
            </div>
            <div className="text-lg font-bold text-white mt-3">{APP_NAME}</div>
            <div className="text-xs text-teal-400 font-medium mt-1">6ème Math-Physique</div>
          </div>
        </div>
      )}

      {/* Role Action Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📚</span> Pédagogie & Cours (E-RDC)
              </h2>
              <p className="text-xs text-slate-400">Programme national RDC, cours audio & quizzes</p>
            </div>
            {isStudent ? (
              <Link
                href="/student/courses"
                className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition"
              >
                Accéder aux Cours &rarr;
              </Link>
            ) : (
              <Link
                href="/teacher/courses"
                className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 font-semibold px-3 py-1.5 rounded-xl hover:bg-teal-500/20 transition"
              >
                Gérer les Cours &rarr;
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Cours Actifs</div>
              <div className="text-2xl font-bold text-white mt-1">{courses?.length || 0}</div>
              <p className="text-[11px] text-teal-400 mt-1">Organisés par matière</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Quizzes EXETAT</div>
              <div className="text-2xl font-bold text-white mt-1">{quizzes?.length || 0}</div>
              <p className="text-[11px] text-teal-400 mt-1">10 questions par série</p>
            </div>
          </div>
        </div>

        {/* Module 2 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💬</span> Messagerie & Realtime Chat
              </h2>
              <p className="text-xs text-slate-400">Canaux de discussion Supabase Realtime</p>
            </div>
            <Link
              href="/chat"
              className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 font-semibold px-3 py-1.5 rounded-xl hover:bg-teal-500/20 transition"
            >
              Accéder au Chat &rarr;
            </Link>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Canal {APP_SHORT_NAME} :</span>
              <span className="text-emerald-400 font-medium">● Connecté en direct</span>
            </div>
            <p className="text-xs text-slate-400 italic">
              Échanges pédagogiques en temps réel entre enseignants, élèves et administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
