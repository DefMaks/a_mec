'use client';

import React from 'react';
import Link from 'next/link';
import { useSchools } from '@/hooks/use-schools';
import { useTeachers } from '@/hooks/use-teachers';
import { useStudents } from '@/hooks/use-students';
import { usePayments } from '@/hooks/use-payments';
import { useQuizzes } from '@/hooks/use-quizzes';
import { useCourses } from '@/hooks/use-courses';
import { APP_NAME, APP_SHORT_NAME, DEFAULT_SCHOOL_ID } from '@/lib/config';

export default function DashboardOverviewPage() {
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
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {APP_NAME} ({APP_SHORT_NAME})
            </span>
            {DEFAULT_SCHOOL_ID && (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                ID École : {DEFAULT_SCHOOL_ID.slice(0, 8)}...
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Tableau de Bord - {APP_NAME}
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            Gestion pédagogique & administrative intégrée : suivi des élèves, cours interactifs, quizzes EXETAT/TENAFEP et paiements Twiga.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Écoles</span>
            <span className="text-2xl">🏫</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {schools?.length || 0}
          </div>
          <div className="text-xs text-teal-400 font-medium mt-1">
            {DEFAULT_SCHOOL_ID ? `${APP_NAME} (Restreint)` : 'Toutes les écoles'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enseignants</span>
            <span className="text-2xl">👨‍🏫</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {teachers?.length || 0}
          </div>
          <div className="text-xs text-purple-400 font-medium mt-1">
            Enseignants de l établissement
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Élèves Enregistrés</span>
            <span className="text-2xl">🎓</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {students?.length || 0}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1">
            Classes actives & effectifs
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recettes Twiga</span>
            <span className="text-2xl">💳</span>
          </div>
          <div className="text-3xl font-extrabold text-teal-400 mt-3">
            ${totalRevenue.toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Frais de scolarité validés
          </div>
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📚</span> Espace Pédagogique Enseignant
              </h2>
              <p className="text-xs text-slate-400">
                Cours publiables & Quizzes EXETAT
              </p>
            </div>
            <Link
              href="/teacher/quizzes"
              className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 font-semibold px-3 py-1.5 rounded-xl hover:bg-teal-500/20 transition"
            >
              Gérer les Quizzes &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Cours Pédagogiques</div>
              <div className="text-2xl font-bold text-white mt-1">{courses?.length || 0}</div>
              <p className="text-[11px] text-teal-400 mt-1">Organisés par matière & classe</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Quizzes Standardisés</div>
              <div className="text-2xl font-bold text-white mt-1">{quizzes?.length || 0}</div>
              <p className="text-[11px] text-teal-400 mt-1">Quizzes dans la base de données</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💬</span> Messagerie & Realtime Chat
              </h2>
              <p className="text-xs text-slate-400">Canaux de discussion de l école</p>
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
              <span className="text-emerald-400 font-medium">● Connecté (Supabase Realtime)</span>
            </div>
            <p className="text-xs text-slate-400 italic">
              Espace d échange en direct alimenté exclusivement par Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
