'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Link as LinkIcon,
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

function NewQuizForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedCoursId = searchParams.get('coursId') || searchParams.get('courseId') || '';
  const preselectedChapitreId = searchParams.get('chapitreId') || searchParams.get('chapterId') || '';

  const { data: me } = useTeacherMe();
  const profileId = me?.profileId || null;

  const { data: assignments, isLoading: loadingAssignments } = useTeacherAssignments(profileId);
  const { data: chaptersData } = useTeacherChapters(profileId);
  const createQuizMutation = useCreateQuiz();

  const [titre, setTitre] = useState('');
  const [selectedClasseId, setSelectedClasseId] = useState('');
  const [selectedCoursId, setSelectedCoursId] = useState(preselectedCoursId);
  const [selectedChapitreId, setSelectedChapitreId] = useState(preselectedChapitreId);
  const [selectedMatiereId, setSelectedMatiereId] = useState('');
  const [dureeMinutes, setDureeMinutes] = useState(30);

  const [questions, setQuestions] = useState<QuizQuestion[]>(createInitialTenQuestions());
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const allCourses = useMemo(() => chaptersData?.cours || [], [chaptersData?.cours]);
  const allChapitres = useMemo(() => chaptersData?.chapitres || [], [chaptersData?.chapitres]);

  // Pre-select if URL params provided
  useEffect(() => {
    if (preselectedCoursId && !selectedCoursId) {
      setSelectedCoursId(preselectedCoursId);
    }
    if (preselectedChapitreId && !selectedChapitreId) {
      setSelectedChapitreId(preselectedChapitreId);
    }
  }, [preselectedCoursId, preselectedChapitreId, selectedCoursId, selectedChapitreId]);

  // Si un chapitre est présélectionné, trouver son cours parent et son titre pour suggérer un titre de quiz
  useEffect(() => {
    if (selectedChapitreId && allChapitres.length > 0) {
      const ch = allChapitres.find((c) => c.id === selectedChapitreId);
      if (ch) {
        if (!selectedCoursId && ch.cours_id) {
          setSelectedCoursId(ch.cours_id);
        }
        if (!titre) {
          setTitre(`Quiz : ${ch.titre} (10 Questions)`);
        }
      }
    }
  }, [selectedChapitreId, allChapitres, selectedCoursId, titre]);

  // Auto-détection du niveau pédagogique (TENAFEP / EXETAT) à partir de la classe sélectionnée
  const selectedClasse = useMemo(() => {
    return assignments?.classes.find((c) => c.id === selectedClasseId);
  }, [assignments?.classes, selectedClasseId]);

  const derivedNiveau: 'EXETAT' | 'TENAFEP' | 'Classe_Standard' = useMemo(() => {
    if (!selectedClasse) return 'EXETAT';
    const label = (selectedClasse.niveau_nom || selectedClasse.nom || '').toLowerCase();
    if (
      label.includes('eb') ||
      label.includes('primaire') ||
      label.includes('base') ||
      label.includes('7') ||
      label.includes('8')
    ) {
      return 'TENAFEP';
    }
    return 'EXETAT';
  }, [selectedClasse]);

  // Auto select first class when loaded if none selected
  useEffect(() => {
    if (assignments?.classes && assignments.classes.length > 0 && !selectedClasseId) {
      setSelectedClasseId(assignments.classes[0].id);
    }
  }, [assignments, selectedClasseId]);

  // Cours disponibles : Prioriser selon la classe mais donner accès à tous les cours si besoin
  const availableCours = useMemo(() => {
    if (!allCourses || allCourses.length === 0) return [];
    if (!selectedClasseId || selectedClasseId === 'ALL') return allCourses;

    const matched = allCourses.filter((c) => c.classe_id === selectedClasseId);
    return matched.length > 0 ? matched : allCourses;
  }, [allCourses, selectedClasseId]);

  useEffect(() => {
    if (availableCours.length > 0 && !selectedCoursId) {
      setSelectedCoursId(availableCours[0].id);
    }
  }, [availableCours, selectedCoursId]);

  // Filtered chapters for the selected course
  const availableChapters = useMemo(() => {
    if (!allChapitres) return [];
    if (selectedCoursId) {
      return allChapitres.filter((ch) => ch.cours_id === selectedCoursId);
    }
    return allChapitres;
  }, [allChapitres, selectedCoursId]);

  const selectedChapter = useMemo(() => {
    return allChapitres.find((ch) => ch.id === selectedChapitreId);
  }, [allChapitres, selectedChapitreId]);

  const selectedCourse = useMemo(() => {
    return allCourses.find((c) => c.id === selectedCoursId);
  }, [allCourses, selectedCoursId]);

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

    const selectedMatiere = assignments?.matieres.find((m) => m.id === selectedMatiereId);

    try {
      await createQuizMutation.mutateAsync({
        titre,
        classe: selectedClasse?.nom || selectedCourse?.classe || 'Toutes les classes',
        matiere_id: selectedMatiereId || selectedCourse?.matiere_id || undefined,
        matiere_nom: selectedMatiere?.nom || selectedCourse?.matiere_nom || 'Discipline Générale',
        matiere: selectedMatiere?.nom || selectedCourse?.matiere_nom || 'Discipline Générale',
        cours_id: selectedCoursId || undefined,
        cours_titre: selectedCourse?.titre || undefined,
        chapitre_id: selectedChapitreId || undefined,
        chapitre_titre: selectedChapter?.titre || undefined,
        niveau: derivedNiveau,
        duree_minutes: dureeMinutes,
        questions,
      });

      // Rediriger vers la page des cours ou des quiz
      if (selectedChapitreId) {
        router.push('/teacher/courses');
      } else {
        router.push('/teacher/quizzes');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors de la sauvegarde du questionnaire.');
    }
  };

  const activeQuestion = questions[activeQuestionIndex];

  return (
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
              Rattachez ce quiz à une leçon spécifique ou à un cours pour évaluer les compétences des élèves.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F2C59] border border-[#CBD5E1] font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
      </div>

      {/* Linked Lesson Banner */}
      {selectedChapter ? (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-xl flex items-center justify-between gap-3 text-xs text-[#166534]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] font-bold flex-shrink-0">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#15803D]">
                🔗 Quiz rattaché à la leçon : <span className="underline">{selectedChapter.titre}</span>
              </p>
              <p className="text-[11px] text-[#166534]/80">
                Cours : {selectedCourse?.titre || 'Cours parent'} • Ce quiz apparaîtra directement sur la fiche de cette leçon.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedChapitreId('')}
            className="text-[11px] font-bold text-[#DC2626] hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#FECACA]"
          >
            Délier
          </button>
        </div>
      ) : (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4 rounded-xl flex items-center gap-2.5 text-xs text-[#1E40AF]">
          <LinkIcon className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
          <div>
            <strong>Conseil Pédagogique :</strong> Sélectionnez un <strong>Cours</strong> puis une <strong>Leçon (Chapitre)</strong> ci-dessous pour que le quiz soit directement relié et déblocable après la lecture de la leçon.
          </div>
        </div>
      )}

      {formError && (
        <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitQuiz} className="space-y-6">
        {/* 1. Informations Générales & Rattachement Pédagogique */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-[#0F2C59]" />
              <h2 className="text-sm font-bold text-[#0F2C59]">
                1. Paramètres du Quiz & Rattachement à une Leçon
              </h2>
            </div>
            {selectedClasse && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#64748B] font-medium hidden sm:inline">Examen d'État cible :</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    derivedNiveau === 'EXETAT'
                      ? 'bg-[#0F2C59]/10 text-[#0F2C59] border border-[#0F2C59]/20'
                      : 'bg-[#008080]/10 text-[#008080] border border-[#008080]/20'
                  }`}
                >
                  {derivedNiveau}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2C59] mb-1">
              Titre Officiel du Quiz *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Évaluation Sommative : Les longueurs et unités de mesure"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
            />
          </div>

          {/* Sélecteurs : Classe, Cours et Leçon */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Classe Cible
              </label>
              <select
                value={selectedClasseId}
                onChange={(e) => {
                  setSelectedClasseId(e.target.value);
                }}
                disabled={loadingAssignments}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 font-medium cursor-pointer disabled:opacity-60"
              >
                <option value="ALL">Toutes les classes</option>
                {assignments?.classes && assignments.classes.length > 0 ? (
                  assignments.classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.nom}
                    </option>
                  ))
                ) : (
                  <option value="">1ère Primaire (ADS)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Cours Pédagogique Parent *
              </label>
              <select
                value={selectedCoursId}
                onChange={(e) => {
                  setSelectedCoursId(e.target.value);
                  setSelectedChapitreId('');
                }}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 font-medium cursor-pointer"
              >
                <option value="">-- Choisir un cours --</option>
                {availableCours.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titre} {c.classe ? `(${c.classe})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1 flex items-center justify-between">
                <span>Leçon / Chapitre à lier</span>
                {selectedChapitreId && (
                  <span className="text-[10px] text-[#16A34A] font-bold">✓ Relié</span>
                )}
              </label>
              <select
                value={selectedChapitreId}
                onChange={(e) => setSelectedChapitreId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 font-medium cursor-pointer"
              >
                <option value="">-- Évaluation globale du cours (Sans leçon) --</option>
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Leçon #{ch.position || ch.ordre || 1} : {ch.titre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Durée (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={dureeMinutes}
                onChange={(e) => setDureeMinutes(Number(e.target.value))}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 font-medium"
              />
            </div>
          </div>
        </div>

        {/* 2. Éditeur des 10 Questions */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#0F2C59]" />
              <h2 className="text-sm font-bold text-[#0F2C59]">
                2. Les 10 Questions Standard (Notation /10 points)
              </h2>
            </div>
            <div className="text-xs text-[#64748B]">
              Question active : <span className="font-bold text-[#0F2C59]">#{activeQuestionIndex + 1} / 10</span>
            </div>
          </div>

          {/* Navigation des questions (1 à 10) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {questions.map((q, idx) => {
              const isFilled = q.question.trim().length > 0 && q.optionA.trim().length > 0;
              const isActive = idx === activeQuestionIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-[#0F2C59] text-white shadow-md ring-2 ring-[#0F2C59]/30'
                      : isFilled
                      ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                      : 'bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Éditeur de la question active */}
          <div className="space-y-4 bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]">
            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1.5 flex items-center justify-between">
                <span>Énoncé de la Question #{activeQuestionIndex + 1} *</span>
                <span className="text-[10px] text-[#64748B]">Barème : 1 point</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Quelle est l'unité principale employée pour mesurer des longueurs dans le système métrique standard ?"
                value={activeQuestion.question}
                onChange={(e) => handleUpdateQuestion('question', e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              />
            </div>

            {/* Les 4 options */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#0F2C59]">
                Options de Réponse (Cochez l'option correcte) *
              </label>
              {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                const optKey = `option${opt}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';
                const isCorrect = activeQuestion.correctOption === opt;
                return (
                  <div
                    key={opt}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                      isCorrect
                        ? 'bg-[#F0FDF4] border-[#86EFAC]'
                        : 'bg-white border-[#E2E8F0]'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#0F2C59]">
                      <input
                        type="radio"
                        name={`correctOption-${activeQuestionIndex}`}
                        checked={isCorrect}
                        onChange={() => handleUpdateQuestion('correctOption', opt)}
                        className="w-4 h-4 text-[#008080] focus:ring-[#008080] cursor-pointer"
                      />
                      <span>Option {opt}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`Texte de l'option ${opt}...`}
                      value={activeQuestion[optKey]}
                      onChange={(e) => handleUpdateQuestion(optKey, e.target.value)}
                      className="flex-1 bg-transparent text-xs text-[#1E293B] focus:outline-none"
                    />
                    {isCorrect && (
                      <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Bonne réponse
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explication pédagogique */}
            <div>
              <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                Explication Pédagogique (Affichée après la validation du quiz)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Le mètre (m) est l'unité de base internationale de longueur. Le décimètre et le centimètre sont des sous-multiples."
                value={activeQuestion.explication || ''}
                onChange={(e) => handleUpdateQuestion('explication', e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
              />
            </div>
          </div>

          {/* Navigation entre questions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F2C59] rounded-xl text-xs font-bold hover:bg-[#F1F5F9] disabled:opacity-40 cursor-pointer"
            >
              ← Question précédente
            </button>

            {activeQuestionIndex < 9 ? (
              <button
                type="button"
                onClick={() => setActiveQuestionIndex((prev) => Math.min(9, prev + 1))}
                className="px-4 py-2 bg-[#0F2C59] text-white rounded-xl text-xs font-bold hover:bg-[#0F2C59]/90 cursor-pointer"
              >
                Question suivante →
              </button>
            ) : (
              <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Toutes les 10 questions prêtes !
              </span>
            )}
          </div>
        </div>

        {/* Boutons d'Action finaux */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#64748B] hover:bg-[#F8FAFC] text-xs font-bold cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createQuizMutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#008080] hover:bg-[#008080]/90 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {createQuizMutation.isPending
                ? 'Enregistrement en cours...'
                : selectedChapitreId
                ? 'Créer & Attacher à la Leçon'
                : 'Enregistrer le Quiz (10 Questions)'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewQuizPage() {
  return (
    <RoleGuard allowedRoles={['teacher', 'super_admin', 'admin']} moduleName="la création de Quiz">
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Initialisation du constructeur de quiz...</div>}>
        <NewQuizForm />
      </Suspense>
    </RoleGuard>
  );
}
