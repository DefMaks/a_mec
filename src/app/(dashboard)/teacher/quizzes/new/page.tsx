'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateQuiz, QuizQuestion } from '@/hooks/use-quizzes';
import { useTeacherMe, useTeacherAssignments, useTeacherChapters } from '@/hooks/use-teacher-data';
import {
  HelpCircle,
  ArrowLeft,
  BookOpen,
  School,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  GraduationCap,
  FileCheck,
} from 'lucide-react';
import { TipTapEditor } from '@/components/editor/tiptap-editor';
import { RoleGuard } from '@/components/layout/role-guard';

// Helper to initialize 10 standard questions
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
  const { data: me } = useTeacherMe();
  const profileId = me?.profileId || null;

  const { data: assignments, isLoading: loadingAssignments } = useTeacherAssignments(profileId);
  const { data: chaptersData } = useTeacherChapters(profileId);
  const createQuizMutation = useCreateQuiz();

  const [titre, setTitre] = useState('');
  const [selectedClasseId, setSelectedClasseId] = useState('');
  const [selectedCoursId, setSelectedCoursId] = useState('');
  const [selectedChapitreId, setSelectedChapitreId] = useState('');
  const [selectedMatiereId, setSelectedMatiereId] = useState('');
  const [niveau, setNiveau] = useState<'EXETAT' | 'TENAFEP' | 'Classe_Standard'>('EXETAT');
  const [dureeMinutes, setDureeMinutes] = useState(30);

  const [questions, setQuestions] = useState<QuizQuestion[]>(createInitialTenQuestions());
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const activeQuestion = questions[activeQuestionIndex];

  // Auto select first class / cours when loaded
  useEffect(() => {
    if (assignments?.classes && assignments.classes.length > 0 && !selectedClasseId) {
      setSelectedClasseId(assignments.classes[0].id);
    }
  }, [assignments, selectedClasseId]);

  useEffect(() => {
    if (chaptersData?.cours && chaptersData.cours.length > 0 && !selectedCoursId) {
      setSelectedCoursId(chaptersData.cours[0].id);
    }
  }, [chaptersData, selectedCoursId]);

  // Filtered chapters for the selected course
  const availableChapters = (chaptersData?.chapitres || []).filter(
    (ch) => !selectedCoursId || ch.cours_id === selectedCoursId
  );

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
      setFormError('Veuillez saisir le titre officiel du quiz.');
      return;
    }

    // Validate that all 10 questions have at least a statement and 4 options
    for (let i = 0; i < 10; i++) {
      const q = questions[i];
      if (!q.question.trim() || !q.optionA.trim() || !q.optionB.trim()) {
        setFormError(`La Question #${i + 1} est incomplète (intitulé ou options de réponse manquants).`);
        setActiveQuestionIndex(i);
        return;
      }
    }

    const selectedClasse = assignments?.classes.find((c) => c.id === selectedClasseId);
    const selectedCourse = chaptersData?.cours.find((c) => c.id === selectedCoursId);
    const selectedMatiere = assignments?.matieres.find((m) => m.id === selectedMatiereId);

    try {
      await createQuizMutation.mutateAsync({
        titre,
        classe: selectedClasse?.nom || 'Toutes les classes',
        matiere_id: selectedMatiereId || selectedCourse?.matiere_id || undefined,
        matiere_nom: selectedMatiere?.nom || selectedCourse?.matiere_nom || 'Discipline Générale',
        matiere: selectedMatiere?.nom || selectedCourse?.matiere_nom || 'Discipline Générale',
        cours_id: selectedCoursId || undefined,
        chapitre_id: selectedChapitreId || undefined,
        niveau,
        duree_minutes: dureeMinutes,
        questions,
      });
      router.push('/teacher/quizzes');
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors de la sauvegarde du questionnaire.');
    }
  };

  return (
    <RoleGuard allowedRoles={['teacher', 'super_admin', 'admin']} moduleName="la création de Quiz">
      <div className="space-y-6">
        {/* Top Header Card */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-xs border border-[#D4AF37]/30">
            <HelpCircle className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F2C59]">
              Constructeur de Quiz Pédagogique (10 Questions Standard)
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Affectation aux classes assignées & alignement au programme national (TENAFEP / EXETAT).
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/teacher/quizzes')}
          className="bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F2C59] border border-[#CBD5E1] font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux Quiz</span>
        </button>
      </div>

      {formError && (
        <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitQuiz} className="space-y-6">
        {/* 1. Informations Générales & Affectations Pédagogiques */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
            <School className="w-4 h-4 text-[#0F2C59]" />
            <h2 className="text-sm font-bold text-[#0F2C59]">
              1. Paramètres du Quiz & Rapprochement de Classe / Cours
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Titre Officiel du Quiz *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Évaluation Sommative #1 : Algèbre Linéaire & Trigonométrie"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Niveau d'Évaluation
              </label>
              <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value as any)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              >
                <option value="EXETAT">EXETAT (Humanités / Secondaire)</option>
                <option value="TENAFEP">TENAFEP (Éducation de Base)</option>
                <option value="Classe_Standard">Contrôle Continu Standard</option>
              </select>
            </div>
          </div>

          {/* Classes & Cours attachés au professeur */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Classe Assignée *
              </label>
              <select
                value={selectedClasseId}
                onChange={(e) => setSelectedClasseId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              >
                {assignments?.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Cours Pédagogique Associé
              </label>
              <select
                value={selectedCoursId}
                onChange={(e) => {
                  setSelectedCoursId(e.target.value);
                  setSelectedChapitreId('');
                }}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              >
                <option value="">-- Tous les cours --</option>
                {chaptersData?.cours.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Chapitre / Leçon Spécifique
              </label>
              <select
                value={selectedChapitreId}
                onChange={(e) => setSelectedChapitreId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              >
                <option value="">-- Évaluation globale du cours --</option>
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.ordre || 1} - {ch.titre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Durée du Quiz (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={dureeMinutes}
                onChange={(e) => setDureeMinutes(Number(e.target.value))}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              />
            </div>
          </div>
        </div>

        {/* 2. Éditeur des 10 Questions Standard */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h2 className="text-sm font-bold text-[#0F2C59]">
                2. Saisie des 10 Questions QCM (Édition : Question #{activeQuestionIndex + 1})
              </h2>
            </div>
            <span className="text-[11px] bg-[#0F2C59]/10 text-[#0F2C59] font-bold px-3 py-1 rounded-lg">
              Format Standard : 10 Questions / 10 Points
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
                      ? 'bg-[#0F2C59] text-[#D4AF37] border-[#0F2C59] shadow-sm ring-2 ring-[#D4AF37]/40'
                      : isFilled
                      ? 'bg-[#F8FAFC] text-[#0F2C59] border-[#CBD5E1]'
                      : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] hover:text-[#0F2C59]'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  <span className="text-[10px]">{isFilled ? '✓' : '•'}</span>
                </button>
              );
            })}
          </div>

          {/* Active Question Editor */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-5 space-y-4">
            <div>
              <TipTapEditor
                label={`Énoncé de la Question #${activeQuestionIndex + 1} (Texte, Formules & Diagrammes) *`}
                value={activeQuestion.question}
                onChange={(html) => handleUpdateQuestion('question', html)}
                placeholder={`Ex: Observez la figure ou le graphique ci-dessous et déterminez la valeur de la dérivée en x=0...`}
                compact
                minHeight="110px"
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
                        ? 'bg-[#F0FDF4] border-[#86EFAC] shadow-2xs'
                        : 'bg-white border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#0F2C59]">Option {optKey}</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#16A34A]">
                        <input
                          type="radio"
                          name={`correct-${activeQuestionIndex}`}
                          checked={isCorrect}
                          onChange={() => handleUpdateQuestion('correctOption', optKey)}
                          className="accent-[#16A34A]"
                        />
                        Bonne réponse
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder={`Réponse possible ${optKey}`}
                      value={(activeQuestion[optProp] as string) || ''}
                      onChange={(e) => handleUpdateQuestion(optProp, e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#0F2C59]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Explanation with TipTap */}
            <div>
              <TipTapEditor
                label="Explication & Corrigé Pédagogique (Démonstration & Schémas)"
                value={activeQuestion.explication || ''}
                onChange={(html) => handleUpdateQuestion('explication', html)}
                placeholder="Rappel méthodologique, démonstration, étapes de calcul ou justification illustrée..."
                compact
                minHeight="90px"
              />
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
              className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F2C59] rounded-xl text-xs font-bold disabled:opacity-40 transition"
            >
              &larr; Question précédente
            </button>
            <span className="text-xs text-[#64748B] font-bold">
              Question {activeQuestionIndex + 1} sur 10
            </span>
            <button
              type="button"
              disabled={activeQuestionIndex === 9}
              onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
              className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F2C59] rounded-xl text-xs font-bold disabled:opacity-40 transition"
            >
              Question suivante &rarr;
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={createQuizMutation.isPending}
            className="bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold px-6 py-3 rounded-xl transition shadow-xs flex items-center gap-2 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {createQuizMutation.isPending
                ? 'Sauvegarde du quiz...'
                : 'Enregistrer le Quiz Complet (10 Questions)'}
            </span>
          </button>
        </div>
      </form>
      </div>
    </RoleGuard>
  );
}
