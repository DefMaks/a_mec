'use client';

import React, { useState } from 'react';
import { useQuizzes, useSaveQuizAttempt, QuizItem } from '@/hooks/use-quizzes';

export default function StudentQuizzesPage() {
  const { data: quizzes, isLoading } = useQuizzes();
  const saveAttemptMutation = useSaveQuizAttempt();

  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const startQuiz = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setFinalScore(0);
  };

  const handleSelectOption = (numOrder: number, option: 'A' | 'B' | 'C' | 'D') => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [numOrder]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !activeQuiz.questions) return;

    let score = 0;
    activeQuiz.questions.forEach((q) => {
      const userChoice = selectedAnswers[q.numOrder];
      if (userChoice === q.correctOption) {
        score += 1;
      }
    });

    setFinalScore(score);
    setQuizSubmitted(true);

    const reussi = score >= 5;
    await saveAttemptMutation.mutateAsync({
      quizId: activeQuiz.id,
      score,
      totalQuestions: activeQuiz.questions.length,
      reponses: selectedAnswers,
      reussi,
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-500/20 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>✍️</span> Quizzes & Évaluations Standardisées EXETAT / TENAFEP
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Répondez aux séries de 10 questions officielles pour tester votre préparation aux examens d État en RDC.
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>📝</span> 10 Questions par Quiz
          </div>
        </div>
      </div>

      {/* Main Container */}
      {!activeQuiz ? (
        /* Quiz Selection Grid */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span> Quizzes Disponibles pour votre Classe
          </h2>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Chargement de la banque de quizzes...
            </div>
          ) : quizzes && quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/40 transition flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {quiz.niveau || 'EXETAT'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {quiz.classe || '6ème Math-Physique'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug">{quiz.titre}</h3>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <span>❓ {quiz.total_questions || 10} Questions</span>
                      <span>⏱️ {quiz.duree_minutes || 20} Min</span>
                    </div>
                  </div>

                  <button
                    onClick={() => startQuiz(quiz)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>🚀 Démarrer l Évaluation</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
              Aucun quiz disponible pour le moment.
            </div>
          )}
        </div>
      ) : (
        /* Active Quiz Runner */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                {activeQuiz.niveau || 'EXETAT'} • {activeQuiz.classe}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{activeQuiz.titre}</h2>
            </div>
            <button
              onClick={() => setActiveQuiz(null)}
              className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition self-start sm:self-auto"
            >
              ← Quitter le Quiz
            </button>
          </div>

          {/* Result Card if submitted */}
          {quizSubmitted ? (
            <div className="bg-slate-950 border border-slate-800 p-6 md:p-8 rounded-2xl text-center space-y-4">
              <div className="text-5xl font-black text-teal-400">
                {finalScore} / {activeQuiz.questions?.length || 10}
              </div>
              <div className="text-lg font-bold text-white">
                {finalScore >= 5 ? '🎉 Félicitations ! Quiz Réussi' : '⚠️ Note insuffisante'}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {finalScore >= 5
                  ? 'Vous avez obtenu plus de 50% de réussite. Votre tentative a été transmise à votre enseignant.'
                  : 'Révisez les chapitres de ce cours et retentez l évaluation pour consolider vos acquis.'}
              </p>

              {/* Question Review List */}
              <div className="text-left mt-6 pt-6 border-t border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Correction détaillée des 10 questions :
                </h3>
                <div className="space-y-3">
                  {activeQuiz.questions?.map((q) => {
                    const userAns = selectedAnswers[q.numOrder];
                    const isCorrect = userAns === q.correctOption;
                    return (
                      <div
                        key={q.numOrder}
                        className={}
                      >
                        <div className="font-bold flex justify-between">
                          <span>Question {q.numOrder} : {q.question}</span>
                          <span>{isCorrect ? '✅ Exact' : '❌ Inexact'}</span>
                        </div>
                        <div className="text-[11px] opacity-80">
                          Votre réponse : {userAns || 'Aucune'} • Réponse correcte : <strong>{q.correctOption}</strong>
                        </div>
                        {q.explication && (
                          <div className="text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800 text-slate-300">
                            💡 Explication : {q.explication}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => startQuiz(activeQuiz)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
                >
                  🔄 Repasser le Quiz
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
                >
                  Retour aux Quizzes
                </button>
              </div>
            </div>
          ) : (
            /* Question Stepper */
            activeQuiz.questions && activeQuiz.questions.length > 0 ? (
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Question {currentQuestionIndex + 1} / {activeQuiz.questions.length}</span>
                    <span>
                      {Object.keys(selectedAnswers).length} / {activeQuiz.questions.length} Répondues
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-purple-500 h-full transition-all duration-300"
                      style={{
                        width: ,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Active Question */}
                {(() => {
                  const q = activeQuiz.questions[currentQuestionIndex];
                  const currentSelection = selectedAnswers[q.numOrder];

                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
                      <h3 className="text-lg font-bold text-white">
                        <span className="text-purple-400 font-mono mr-2">Q{q.numOrder}.</span>
                        {q.question}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const optionText =
                            optKey === 'A'
                              ? q.optionA
                              : optKey === 'B'
                              ? q.optionB
                              : optKey === 'C'
                              ? q.optionC
                              : q.optionD;

                          const isSelected = currentSelection === optKey;

                          return (
                            <button
                              key={optKey}
                              onClick={() => handleSelectOption(q.numOrder, optKey)}
                              className={}
                            >
                              <span
                                className={}
                              >
                                {optKey}
                              </span>
                              <span className="flex-1">{optionText}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
                  >
                    ← Précédent
                  </button>

                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
                    >
                      Suivant →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2.5 px-6 rounded-xl transition shadow-lg"
                    >
                      Valider & Soumettre les 10 Réponses
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-sm py-12">
                Ce quiz ne contient aucune question.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
