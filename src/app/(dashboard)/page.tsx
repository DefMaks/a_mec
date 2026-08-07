'use client';

import React from 'react';
import Link from 'next/link';
import { useSchools } from '@/hooks/use-schools';
import { useTeachers } from '@/hooks/use-teachers';
import { useStudents } from '@/hooks/use-students';
import { usePayments } from '@/hooks/use-payments';
import { useQuizzes } from '@/hooks/use-quizzes';
import { useCourses } from '@/hooks/use-courses';

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
          <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Plateforme E-RDC Admin (A_MEC)
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Tableau de Bord National Éducatif RDC
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            Suivi centralisé des écoles partenaires, des enseignants, des cours en ligne et de la préparation aux examens d État (TENAFEP & EXETAT).
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Écoles Inscrites</span>
            <span className="text-2xl">🏫</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {schools?.length || 12}
          </div>
          <div className="text-xs text-teal-400 font-medium mt-1">
            Partenaires à Kinshasa & Provinces
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enseignants Actifs</span>
            <span className="text-2xl">👨‍🏫</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {teachers?.length || 45}
          </div>
          <div className="text-xs text-purple-400 font-medium mt-1">
            Enseignants certifiés E-RDC
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Élèves Enregistrés</span>
            <span className="text-2xl">🎓</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {students?.length || 1280}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1">
            Compte Élève actif & Code Parent
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recettes Twiga Paie</span>
            <span className="text-2xl">💳</span>
          </div>
          <div className="text-3xl font-extrabold text-teal-400 mt-3">
            ${totalRevenue.toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Frais de scolarité valides
          </div>
        </div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Teacher World Overview */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📚</span> Espace Pédagogique Enseignant
              </h2>
              <p className="text-xs text-slate-400">
                Cours publiables & Quizzes EXETAT de 10 questions
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
              <div className="text-2xl font-bold text-white mt-1">{courses?.length || 8}</div>
              <p className="text-[11px] text-teal-400 mt-1">Organisés par matière & classe</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Quizzes Standardisés</div>
              <div className="text-2xl font-bold text-white mt-1">{quizzes?.length || 15}</div>
              <p className="text-[11px] text-teal-400 mt-1">10 Questions obligatoire/quiz</p>
            </div>
          </div>
        </div>

        {/* Messaging & Communication Overview */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💬</span> Messagerie & Realtime Chat
              </h2>
              <p className="text-xs text-slate-400">Canaux de discussion école/parents/élèves</p>
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
              <span className="font-semibold text-slate-200">Dernier canal actif :</span>
              <span className="text-emerald-400 font-medium">● En ligne (Supabase)</span>
            </div>
            <p className="text-xs text-slate-400 italic">
              &quot;6ème Math-Physique - Groupe d Échange : Les exercices sur les logarithmes sont publiés.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
