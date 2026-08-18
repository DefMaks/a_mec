'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuizzes, useSubmitQuizAnswers } from '@/hooks/use-quizzes';
import {
  Award,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { RichTextView } from '@/components/editor/rich-text-view';

export default function StudentQuizzesPage() {
  const { data: quizzes, isLoading } = useQuizzes();
  const submitAnswersMutation = useSubmitQuizAnswers();

  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Démarrer un quiz
  const handleStartQuiz = (q: any) => {
    setActiveQuiz(q);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setScore(0);
  };

  // Sélectionner une réponse
  const handleSelectAnswer = (optionContent: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optionContent,
    }));
  };

  // Valider et calculer le score (Norme 10 Questions RDC)
  const handleFinishQuiz = () => {
    if (!activeQuiz) return;
    const questions = activeQuiz.questions || [];
    let calculatedScore = 0;

    questions.forEach((q: any, idx: number) => {
      const selected = selectedAnswers[idx];
      const correct = q.correct_answer?.content || q.correct_answer;
      if (selected === correct) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsCompleted(true);

    // Envoi optimiste
    if (activeQuiz.id) {
      submitAnswersMutation.mutate({
        quiz_id: activeQuiz.id,
        score: calculatedScore,
        total_questions: questions.length || 10,
        reponses: selectedAnswers,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête Espace Quiz Élève */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <Award className="w-3 h-3 text-[#D4AF37]" />
              Séries QCM Standardisées (10 Qs)
            </span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              Préparation TENAFEP & EXETAT
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Évaluations & Tests d'Examen d'État
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            Testez vos connaissances sur des séries de 10 questions corrigées automatiquement avec barème sur 10 points.
          </p>
        </div>

        <Link
          href="/student/courses"
          className="px-4 py-2 bg-white text-[#0F2C59] border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 self-start md:self-center"
        >
          <span>Consulter les Cours</span>
        </Link>
      </div>

      {/* Mode Quiz Actif Interactif */}
      {activeQuiz ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 shadow-xs space-y-6 max-w-3xl mx-auto">
          {/* Header Quiz Actif */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#D4AF37]/30 uppercase">
                {activeQuiz.niveau}
              </span>
              <h2 className="text-lg font-bold text-[#0F2C59] mt-1">{activeQuiz.titre}</h2>
            </div>
            <button
              onClick={() => setActiveQuiz(null)}
              className="text-xs font-semibold text-[#64748B] hover:text-[#0F2C59] px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC]"
            >
              Quitter
            </button>
          </div>

          {!isCompleted ? (
            <div className="space-y-6">
              {/* Indicateur de Progression (Question X sur 10) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F2C59]">
                  <span>
                    Question {currentQuestionIdx + 1} sur {activeQuiz.questions?.length || 10}
                  </span>
                  <span className="text-[#D4AF37]">
                    {Math.round(((currentQuestionIdx + 1) / (activeQuiz.questions?.length || 10)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0F2C59] h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIdx + 1) / (activeQuiz.questions?.length || 10)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Énoncé de la question */}
              {activeQuiz.questions && activeQuiz.questions[currentQuestionIdx] ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <div className="text-sm md:text-base font-bold text-[#0F2C59] leading-relaxed">
                      <RichTextView content={activeQuiz.questions[currentQuestionIdx].question} />
                    </div>
                  </div>

                  {/* Options de réponse QCM */}
                  <div className="space-y-2.5">
                    {[
                      activeQuiz.questions[currentQuestionIdx].correct_answer,
                      ...(activeQuiz.questions[currentQuestionIdx].incorrect_answers || []),
                    ]
                      .map((opt) => (typeof opt === 'string' ? opt : opt?.content || ''))
                      .sort()
                      .map((optContent, oIdx) => {
                        const isSelected = selectedAnswers[currentQuestionIdx] === optContent;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(optContent)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-xs'
                                : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B]'
                            }`}
                          >
                            <span>{optContent}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#64748B]">Question introuvable.</p>
              )}

              {/* Boutons de navigation Question */}
              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl disabled:opacity-40"
                >
                  Précédente
                </button>

                {currentQuestionIdx + 1 < (activeQuiz.questions?.length || 10) ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                    className="px-5 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <span>Suivante</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishQuiz}
                    className="px-5 py-2 text-xs font-bold bg-[#15803D] text-white hover:bg-[#15803D]/90 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valider & Voir Note /10</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Résultat du Quiz */
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#0F2C59] border border-[#0F2C59]/20 flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-8 h-8 text-[#D4AF37]" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#0F2C59]">Évaluation Terminée !</h3>
                <p className="text-xs text-[#64748B] mt-1">Votre résultat a été enregistré avec succès.</p>
              </div>

              <div className="inline-block bg-[#F8FAFC] border border-[#E2E8F0] px-6 py-4 rounded-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Note Obtenue
                </span>
                <span className="text-4xl font-extrabold text-[#0F2C59] font-tabular">
                  {score} <span className="text-lg text-[#64748B]">/ {activeQuiz.questions?.length || 10}</span>
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => handleStartQuiz(activeQuiz)}
                  className="px-4 py-2 bg-white text-[#0F2C59] border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Recommencer</span>
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-4 py-2 bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl text-xs font-bold transition"
                >
                  Choisir un autre test
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Liste des Quizzes Disponibles */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(quizzes || []).map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#FFFBEB] text-[#B45309] border border-[#D4AF37]/30 uppercase">
                    {q.niveau}
                  </span>
                  <span className="text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                    {q.total_questions || 10} Questions (10 Pts)
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[#0F2C59] mt-3 group-hover:text-[#D4AF37] transition-colors">
                  {q.titre}
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  {q.matiere_nom || q.classe || 'Matière STEM'} • Durée : {q.duree_minutes} minutes
                </p>
              </div>

              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                  Corrigé officiel
                </span>
                <button
                  onClick={() => handleStartQuiz(q)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 text-xs font-bold transition flex items-center gap-1"
                >
                  <Award className="w-3 h-3 text-[#D4AF37]" />
                  <span>Passer le test</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
