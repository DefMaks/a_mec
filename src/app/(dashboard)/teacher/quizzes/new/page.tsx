'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateQuiz, QuizQuestion } from '@/hooks/use-quizzes';

// Helper to initialize 10 questions
const createInitialTenQuestions = (): QuizQuestion[] => {
  return Array.from({ length: 10 }, (_, index) => ({
    numOrder: index + 1,
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explication: '',
    points: 1,
  }));
};

export default function NewQuizPage() {
  const router = useRouter();
  const createQuizMutation = useCreateQuiz();

  const [titre, setTitre] = useState('');
  const [classe, setClasse] = useState('6ème Math-Physique');
  const [niveau, setNiveau] = useState<'EXETAT' | 'TENAFEP' | 'Classe_Standard'>('EXETAT');
  const [dureeMinutes, setDureeMinutes] = useState(30);

  const [questions, setQuestions] = useState<QuizQuestion[]>(createInitialTenQuestions());
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const activeQuestion = questions[activeQuestionIndex];

  const handleUpdateQuestion = (field: keyof QuizQuestion, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[activeQuestionIndex] = {
        ...next[activeQuestionIndex],
        [field]: value,
      };
      return next;
    });
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!titre.trim()) {
      setFormError('Veuillez saisir le titre du quiz.');
      return;
    }

    // Validate that all 10 questions have at least a statement and 4 options
    for (let i = 0; i < 10; i++) {
      const q = questions[i];
      if (!q.question.trim() || !q.optionA.trim() || !q.optionB.trim()) {
        setFormError(`La Question #${i + 1} est incomplète (intitulé ou options A/B manquants).`);
        setActiveQuestionIndex(i);
        return;
      }
    }

    try {
      await createQuizMutation.mutateAsync({
        titre,
        classe,
        niveau,
        duree_minutes: dureeMinutes,
        questions,
      });
      router.push('/teacher/quizzes');
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors de la sauvegarde du quiz.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>✍️</span> Constructeur de Quiz Standardisé (10 Questions)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Remplissez les 10 questions obligatoires pour valider le quiz pour les examens d État.
          </p>
        </div>
        <button
          onClick={() => router.push('/teacher/quizzes')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-sm transition"
        >
          &larr; Retour à la liste
        </button>
      </div>

      {formError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium">
          ⚠️ {formError}
        </div>
      )}

      <form onSubmit={handleSubmitQuiz} className="space-y-6">
        {/* Main Quiz Info */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            1. Informations Générales du Questionnaire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Titre Officiel du Quiz
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Évaluation EXETAT #1 - Algèbre et Trigonométrie"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Niveau Examen</label>
              <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <option value="EXETAT">EXETAT (Humanités)</option>
                <option value="TENAFEP">TENAFEP (Éducation de Base)</option>
                <option value="Classe_Standard">Évaluation de classe</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Durée (Minutes)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={dureeMinutes}
                onChange={(e) => setDureeMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>
        </div>

        {/* 10 Questions Tab Selector */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">
              2. Saisie des 10 Questions (Question actuelle : #{activeQuestionIndex + 1})
            </h2>
            <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 font-semibold px-3 py-1 rounded-lg">
              Total Fixe : 10 Questions
            </span>
          </div>

          {/* Stepper Buttons 1 to 10 */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const isFilled = q.question.trim().length > 0 && q.optionA.trim().length > 0;
              const isActive = idx === activeQuestionIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg'
                      : isFilled
                      ? 'bg-slate-800 text-teal-300 border-teal-500/30'
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  <span className="text-[9px] opacity-75">{isFilled ? '✓' : '•'}</span>
                </button>
              );
            })}
          </div>

          {/* Active Question Editor */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-teal-400 mb-1">
                Intitulé de la Question #{activeQuestionIndex + 1}
              </label>
              <textarea
                rows={2}
                placeholder={`Ex: Formuler la propriété mathématique relative à la dérivée de la fonction ln(x) en x = ${activeQuestionIndex + 1}...`}
                value={activeQuestion.question}
                onChange={(e) => handleUpdateQuestion('question', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            {/* Options A, B, C, D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const optProp = `option${optKey}` as keyof QuizQuestion;
                const isCorrect = activeQuestion.correctOption === optKey;
                return (
                  <div
                    key={optKey}
                    className={`p-3 rounded-xl border transition ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-300">Option {optKey}</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-emerald-400">
                        <input
                          type="radio"
                          name={`correct-${activeQuestionIndex}`}
                          checked={isCorrect}
                          onChange={() => handleUpdateQuestion('correctOption', optKey)}
                          className="accent-teal-500"
                        />
                        Bonne réponse
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder={`Réponse possible ${optKey}`}
                      value={(activeQuestion[optProp] as string) || ''}
                      onChange={(e) => handleUpdateQuestion(optProp, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Explication / Corrigé détaillé (affiché après soumission)
              </label>
              <input
                type="text"
                placeholder="Rappel théorique ou démarche de calcul..."
                value={activeQuestion.explication || ''}
                onChange={(e) => handleUpdateQuestion('explication', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold disabled:opacity-40"
            >
              &larr; Question précédente
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Question {activeQuestionIndex + 1} / 10
            </span>
            <button
              type="button"
              disabled={activeQuestionIndex === 9}
              onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold disabled:opacity-40"
            >
              Question suivante &rarr;
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={createQuizMutation.isPending}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-2 text-sm"
          >
            <span>💾</span> Enregistrer le Quiz Complété (10 Questions)
          </button>
        </div>
      </form>
    </div>
  );
}
