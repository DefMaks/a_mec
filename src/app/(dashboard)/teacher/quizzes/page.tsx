'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useQuizzes,
  useQuizAttachments,
  useAttachQuizToLesson,
  useDetachQuizFromLesson,
  QuizItem,
} from '@/hooks/use-quizzes';
import { useTeacherMe, useTeacherChapters } from '@/hooks/use-teacher-data';
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
  Link as LinkIcon,
  AlertCircle,
  Unlink,
} from 'lucide-react';
import { RichTextView } from '@/components/editor/rich-text-view';
import { RoleGuard } from '@/components/layout/role-guard';

export default function TeacherQuizzesPage() {
  const { data: me } = useTeacherMe();
  const profileId = me?.profileId || null;
  const { data: quizzes, isLoading } = useQuizzes();
  const { data: quizAttachments } = useQuizAttachments();
  const { data: chaptersData } = useTeacherChapters(profileId);
  const attachQuizMutation = useAttachQuizToLesson();
  const detachQuizMutation = useDetachQuizFromLesson();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);

  // Modal to attach/link quiz to a lesson
  const [attachingQuiz, setAttachingQuiz] = useState<QuizItem | null>(null);
  const [selectedChapterIdToAttach, setSelectedChapterIdToAttach] = useState('');

  const allChapitres = chaptersData?.chapitres || [];

  const filteredQuizzes = (quizzes || []).filter((q) => {
    return (
      q.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.matiere_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.classe?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenAttachModal = (quiz: QuizItem) => {
    setAttachingQuiz(quiz);
    // Find current attached chapter if any
    const attachedEntry = Object.values(quizAttachments || {}).find((att) => att.quiz_id === quiz.id);
    setSelectedChapterIdToAttach(quiz.chapitre_id || attachedEntry?.chapitre_id || '');
  };

  const handleSaveQuizAttachment = async () => {
    if (!attachingQuiz) return;
    if (!selectedChapterIdToAttach) {
      // Detach if cleared
      const attachedEntry = Object.values(quizAttachments || {}).find((att) => att.quiz_id === attachingQuiz.id);
      if (attachedEntry || attachingQuiz.chapitre_id) {
        await detachQuizMutation.mutateAsync({
          chapitre_id: attachedEntry?.chapitre_id || attachingQuiz.chapitre_id || '',
          quiz_id: attachingQuiz.id,
        });
      }
      setAttachingQuiz(null);
      return;
    }

    const targetChapitre = allChapitres.find((c) => c.id === selectedChapterIdToAttach);
    await attachQuizMutation.mutateAsync({
      quiz_id: attachingQuiz.id,
      quiz_titre: attachingQuiz.titre,
      chapitre_id: selectedChapterIdToAttach,
      chapitre_titre: targetChapitre?.titre || 'Leçon',
      cours_id: targetChapitre?.cours_id,
      cours_titre: targetChapitre?.cours?.titre,
    });
    setAttachingQuiz(null);
  };

  return (
    <RoleGuard allowedRoles={['teacher', 'super_admin', 'admin']} moduleName="la gestion des Quizzes & Évaluations">
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
          {filteredQuizzes.map((quiz) => {
            const attachedEntry = Object.values(quizAttachments || {}).find((att) => att.quiz_id === quiz.id);
            const targetChapitreId = quiz.chapitre_id || attachedEntry?.chapitre_id;
            const targetChapter = targetChapitreId ? allChapitres.find((c) => c.id === targetChapitreId) : null;

            return (
              <div
                key={quiz.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-xs"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
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

                  {/* Lesson Attachment Status */}
                  <div className="pt-0.5">
                    {targetChapter || targetChapitreId ? (
                      <div className="inline-flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-lg text-xs text-[#166534]">
                        <BookOpen className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
                        <span className="font-medium">
                          Rattaché à la leçon : <strong className="font-bold text-[#0F2C59]">{targetChapter?.titre || quiz.chapitre_titre || 'Leçon'}</strong>
                          {targetChapter?.cours?.titre && (
                            <span className="text-[#64748B] text-[11px] ml-1">({targetChapter.cours.titre})</span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 bg-[#FFFBEB] border border-[#FEF3C7] px-2.5 py-1 rounded-lg text-xs text-[#92400E]">
                        <AlertCircle className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                        <span className="font-medium text-[11px]">Non rattaché à une leçon</span>
                      </div>
                    )}
                  </div>

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

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenAttachModal(quiz)}
                    className="bg-white hover:bg-[#F8FAFC] text-[#0F2C59] border border-[#CBD5E1] text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Lier ce quiz à un chapitre / une leçon"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{targetChapter || targetChapitreId ? 'Modifier liaison' : 'Lier à une leçon'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedQuiz(quiz)}
                    className="bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Aperçu & Corrigé</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attach Quiz to Lesson Modal */}
      {attachingQuiz && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2C59]">Lier à une leçon pédagogique</h2>
                  <p className="text-[11px] text-[#64748B] truncate max-w-xs">{attachingQuiz.titre}</p>
                </div>
              </div>
              <button
                onClick={() => setAttachingQuiz(null)}
                className="text-[#94A3B8] hover:text-[#0F2C59] text-sm p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] text-[#64748B]">
                  <strong>Discipline :</strong> {attachingQuiz.matiere_nom || 'Général'} • {attachingQuiz.classe}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  <strong>Barème :</strong> 10 questions corrigées sur 10 points
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1.5">
                  Choisissez la leçon (chapitre) à laquelle rattacher cette évaluation :
                </label>
                {allChapitres.length === 0 ? (
                  <p className="text-xs text-[#DC2626]">
                    Vous n'avez pas encore publié de leçon. Créez d'abord un chapitre dans l'onglet Cours.
                  </p>
                ) : (
                  <select
                    value={selectedChapterIdToAttach}
                    onChange={(e) => setSelectedChapterIdToAttach(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  >
                    <option value="">-- Détacher de toute leçon (Quiz libre) --</option>
                    {allChapitres.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.titre} — {ch.cours?.titre || 'Cours'} ({ch.cours?.matiere_nom || 'Discipline'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <p className="text-[11px] text-[#64748B] bg-[#FFFBEB] p-2.5 rounded-xl border border-[#D4AF37]/20">
                💡 Dès la liaison enregistrée, les élèves verront automatiquement ce quiz proposé à la fin de la leçon correspondante.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setAttachingQuiz(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F2C59]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={attachQuizMutation.isPending || detachQuizMutation.isPending}
                onClick={handleSaveQuizAttachment}
                className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {attachQuizMutation.isPending || detachQuizMutation.isPending
                    ? 'Enregistrement...'
                    : 'Confirmer la liaison'}
                </span>
              </button>
            </div>
          </div>
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
    </RoleGuard>
  );
}
