'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuizzes, QuizItem } from '@/hooks/use-quizzes';
import { useTeacherMe } from '@/hooks/use-teacher-data';
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2,
  BookOpen,
  Eye,
  Award,
  FileCheck,
  Search,
  X,
} from 'lucide-react';
import { RichTextView } from '@/components/editor/rich-text-view';

export default function TeacherQuizzesPage() {
  const { data: me } = useTeacherMe();
  const { data: quizzes, isLoading } = useQuizzes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);

  const filteredQuizzes = (quizzes || []).filter((q) => {
    return (
      q.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.matiere_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.classe?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-xs border border-[#D4AF37]/30">
            <HelpCircle className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F2C59]">
              Quizzes & Évaluations Standardisées (10 Questions)
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Chaque quiz est structuré selon la norme nationale RDC (notation sur 10 points pour TENAFEP & EXETAT).
            </p>
          </div>
        </div>

        <Link
          href="/teacher/quizzes/new"
          className="bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Créer un Quiz (10 Questions)</span>
        </Link>
      </div>

      {/* Info Badge */}
      <div className="bg-[#FFFBEB] border border-[#D4AF37]/30 text-[#0F2C59] text-xs p-4 rounded-xl flex items-center gap-3">
        <Award className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
        <div>
          <strong className="text-[#0F2C59]">Standard Pédagogique Académie du Salut :</strong>{' '}
          <span className="text-[#475569]">
            Tous les questionnaires d'évaluation créés sur la plateforme comportent exactement 10 questions à choix multiples avec corrigé pédagogique détaillé.
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par titre, discipline ou classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
          />
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Quiz List */}
      {isLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs text-[#64748B]">
          Chargement des questionnaires...
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0F2C59]">Aucun quiz disponible</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Vous n'avez pas encore configuré de quiz d'évaluation pour vos classes.
          </p>
          <Link
            href="/teacher/quizzes/new"
            className="inline-block mt-2 px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + Créer un nouveau quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      quiz.niveau === 'EXETAT'
                        ? 'bg-[#0F2C59]/10 text-[#0F2C59]'
                        : 'bg-[#008080]/10 text-[#008080]'
                    }`}
                  >
                    {quiz.niveau}
                  </span>
                  <span className="text-[11px] font-semibold text-[#D4AF37] bg-[#FFFBEB] border border-[#D4AF37]/30 px-2 py-0.5 rounded-md">
                    {quiz.matiere_nom || 'Discipline'}
                  </span>
                  <span className="text-[11px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                    {quiz.classe}
                  </span>
                </div>

                <h3 className="font-bold text-[#0F2C59] text-sm leading-snug">{quiz.titre}</h3>

                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {quiz.total_questions || 10} Questions QCM
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {quiz.duree_minutes} minutes
                  </span>
                  <span>
                    Créé le {new Date(quiz.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setSelectedQuiz(quiz)}
                  className="bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F2C59] border border-[#CBD5E1] text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Aperçu & Corrigé</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Preview Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2C59]">{selectedQuiz.titre}</h2>
                  <p className="text-[11px] text-[#64748B]">
                    {selectedQuiz.niveau} • {selectedQuiz.classe} • {selectedQuiz.duree_minutes} min
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-[#94A3B8] hover:text-[#0F2C59] text-sm p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {(selectedQuiz.questions || []).map((q, idx) => (
                <div key={q.id || idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F2C59]">Question #{q.numOrder || idx + 1}</span>
                    <span className="text-[10px] bg-[#0F2C59]/10 text-[#0F2C59] font-bold px-2 py-0.5 rounded">
                      {q.points || 1} Point
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#1E293B]">
                    <RichTextView content={q.question} fallbackText="Énoncé manquant." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const optText = q[`option${opt}` as keyof typeof q] as string;
                      const isCorrect = q.correctOption === opt;
                      return (
                        <div
                          key={opt}
                          className={`p-2 rounded-lg text-xs border ${
                            isCorrect
                              ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534] font-bold'
                              : 'bg-white border-[#E2E8F0] text-[#475569]'
                          }`}
                        >
                          <span className="mr-1.5">{opt})</span> {optText || '—'} {isCorrect && '✓ (Correct)'}
                        </div>
                      );
                    })}
                  </div>

                  {q.explication && (
                    <div className="text-[11px] text-[#475569] bg-white p-3 rounded-lg border border-[#F1F5F9] mt-2 space-y-1">
                      <strong className="text-[#0F2C59] block">Corrigé explicatif :</strong>
                      <RichTextView content={q.explication} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
