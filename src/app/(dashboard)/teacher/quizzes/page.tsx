'use client';

import React from 'react';
import Link from 'next/link';
import { useQuizzes } from '@/hooks/use-quizzes';

export default function TeacherQuizzesPage() {
  const { data: quizzes, isLoading } = useQuizzes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📝</span> Quizzes & Examens d État (EXETAT / TENAFEP)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Chaque quiz est structuré avec <span className="text-teal-400 font-semibold">10 questions à choix multiples (QCM)</span> avec corrigé explicatif.
          </p>
        </div>
        <Link
          href="/teacher/quizzes/new"
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          <span>➕</span> Créer un Quiz (10 Questions)
        </Link>
      </div>

      {/* Info Badge for 10 questions rule */}
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-4 rounded-xl flex items-center gap-3">
        <span className="text-lg">💡</span>
        <span>
          <strong>Règle Nationale E-RDC :</strong> Tous les questionnaires d évaluation EXETAT et TENAFEP créés sur la plateforme doivent impérativement comporter <strong>exactement 10 questions</strong> pour garantir une notation standardisée sur 10 points.
        </span>
      </div>

      {/* Quiz List */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          Chargement des questionnaires...
        </div>
      ) : (quizzes || []).length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Aucun quiz disponible. Cliquez sur &quot;Créer un Quiz&quot; pour en ajouter un.
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes?.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    quiz.niveau === 'EXETAT'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {quiz.niveau}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    {quiz.classe}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base leading-snug">
                  {quiz.titre}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="text-teal-400 font-medium">
                    ✅ {quiz.total_questions || 10} Questions obligatoire
                  </span>
                  <span>⏱️ Durée : {quiz.duree_minutes} minutes</span>
                  <span>📅 Créé le {new Date(quiz.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  10/10 Questions Complètes
                </span>
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition">
                  Aperçu & Corrigé
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
