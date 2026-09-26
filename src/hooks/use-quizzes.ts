import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface QuizQuestion {
  id?: string;
  numOrder: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explication?: string;
  points?: number;
}

export interface QuizItem {
  id: string;
  titre: string;
  matiere_nom?: string;
  niveau?: string;
  classe?: string;
  total_questions: number;
  duree_minutes: number;
  created_at: string;
  questions?: QuizQuestion[];
  chapitre_id?: string | null;
  chapitre_titre?: string | null;
  cours_id?: string | null;
  cours_titre?: string | null;
}

export const LOCAL_QUIZZES_KEY = 'ads_custom_quizzes_v1';
export const LOCAL_QUIZ_ATTACHMENTS_KEY = 'ads_quiz_attachments_v1';

export function getStoredQuizzes(): QuizItem[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_QUIZZES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return [];
}

export function saveStoredQuizzes(quizzes: QuizItem[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_QUIZZES_KEY, JSON.stringify(quizzes));
    } catch {}
  }
}

export function getStoredAttachments(): Record<string, { quiz_id: string; quiz_titre?: string; chapitre_id: string; cours_id?: string }> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_QUIZ_ATTACHMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return {
    'f27f1eec-b8e7-4365-ace7-b9309a4371f0': {
      quiz_id: 'cb436cdb-c816-4183-91c5-b5cc4c9fce80',
      quiz_titre: 'Quiz QCM 10 questions (Primaire - Mix)',
      chapitre_id: 'f27f1eec-b8e7-4365-ace7-b9309a4371f0',
      cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37139',
    },
  };
}

export function saveStoredAttachments(map: Record<string, any>) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_QUIZ_ATTACHMENTS_KEY, JSON.stringify(map));
    } catch {}
  }
}

export function resetQuizzes() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_QUIZZES_KEY);
      localStorage.removeItem(LOCAL_QUIZ_ATTACHMENTS_KEY);
    } catch {}
  }
}

/**
 * Hook pour récupérer la cartographie chapitre -> quiz
 */
export function useQuizAttachments() {
  return useQuery({
    queryKey: ['quiz_attachments'],
    queryFn: async (): Promise<Record<string, { quiz_id: string; quiz_titre?: string; chapitre_id: string; cours_id?: string }>> => {
      const local = getStoredAttachments();
      try {
        const res = await fetch('/api/sync?type=attachments', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data) {
          const merged = { ...local, ...json.data };
          saveStoredAttachments(merged);
          return merged;
        }
      } catch {}
      return local;
    },
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
  });
}

export function useQuizzes() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async (): Promise<QuizItem[]> => {
      // 1. Récupérer les liaisons chapitre <-> quiz
      let attachmentsMap: Record<string, any> = getStoredAttachments();
      try {
        const resAtt = await fetch('/api/sync?type=attachments', { cache: 'no-store' });
        const jsonAtt = await resAtt.json();
        if (jsonAtt.success && jsonAtt.data) {
          attachmentsMap = { ...attachmentsMap, ...jsonAtt.data };
        }
      } catch {}

      // Inverser pour recherche rapide par quiz_id
      const quizToChapitreMap: Record<string, { chapitre_id: string; quiz_titre?: string; cours_id?: string }> = {};
      Object.entries(attachmentsMap).forEach(([chapitreId, info]) => {
        if (info.quiz_id) {
          quizToChapitreMap[info.quiz_id] = {
            chapitre_id: chapitreId,
            quiz_titre: info.quiz_titre,
            cours_id: info.cours_id,
          };
        }
      });

      // 2. Récupérer les quiz depuis /api/sync
      let syncQuizzes: QuizItem[] = [];
      try {
        const resSync = await fetch('/api/sync?type=quizzes', { cache: 'no-store' });
        const jsonSync = await resSync.json();
        if (jsonSync.success && Array.isArray(jsonSync.data)) {
          syncQuizzes = jsonSync.data;
        }
      } catch {}

      // 3. Récupérer les quiz locaux
      const localQuizzes = getStoredQuizzes();

      // 4. Récupérer depuis Supabase
      try {
        const { data: quizData, error: quizError } = await supabase
          .from('quiz')
          .select('*');

        const dbMapped: QuizItem[] = (quizData || []).map((q: any) => {
          const ans = q.answers || {};
          const rawQuestions = Array.isArray(ans?.questions)
            ? ans.questions
            : Array.isArray(q.questions)
            ? q.questions
            : Array.isArray(q.quiz)
            ? q.quiz
            : Array.isArray(q.answers)
            ? q.answers
            : [];

          const mappedQuestions: QuizQuestion[] = (rawQuestions || []).map((item: any, idx: number) => ({
            id: item.id || `q-${idx + 1}`,
            numOrder: item.num_order || item.numOrder || idx + 1,
            question: item.question || `Question n°${idx + 1}`,
            optionA: item.option_a || item.optionA || item.options?.[0] || 'Option A',
            optionB: item.option_b || item.optionB || item.options?.[1] || 'Option B',
            optionC: item.option_c || item.optionC || item.options?.[2] || 'Option C',
            optionD: item.option_d || item.optionD || item.options?.[3] || 'Option D',
            correctOption: (item.correct_option || item.correctOption || item.correct_answer || 'A').toString().toUpperCase() as 'A' | 'B' | 'C' | 'D',
            explication: item.explication || item.explanation || 'Explication détaillée disponible.',
            points: item.points || 1,
          }));

          const linkedAttachment = quizToChapitreMap[q.id];
          const resolvedChapitreId = q.chapitre_id || ans.chapitre_id || linkedAttachment?.chapitre_id || null;
          const resolvedCoursId = ans.cours_id || linkedAttachment?.cours_id || null;

          return {
            id: q.id,
            titre: q.titre || ans.titre || 'Évaluation Standard',
            matiere_nom: ans.matiere_nom || q.matiere_nom || q.matiere || 'Formation Générale',
            niveau: ans.niveau || q.niveau || 'EXETAT',
            classe: ans.classe || q.classe || 'Toutes les classes',
            total_questions: mappedQuestions.length > 0 ? mappedQuestions.length : 10,
            duree_minutes: ans.duree_minutes || q.duree_minutes || 30,
            created_at: q.created_at || ans.created_at || new Date().toISOString(),
            chapitre_id: resolvedChapitreId,
            chapitre_titre: ans.chapitre_titre || null,
            cours_id: resolvedCoursId,
            cours_titre: ans.cours_titre || null,
            questions: mappedQuestions,
          };
        });

        // Combiner sans doublons par ID
        const combinedMap = new Map<string, QuizItem>();
        dbMapped.forEach((q) => combinedMap.set(q.id, q));
        syncQuizzes.forEach((q) => {
          const existing = combinedMap.get(q.id) || {};
          combinedMap.set(q.id, { ...existing, ...q });
        });
        localQuizzes.forEach((q) => {
          const existing = combinedMap.get(q.id) || {};
          combinedMap.set(q.id, { ...existing, ...q });
        });

        // Enrichir les liaisons si attachées
        const results = Array.from(combinedMap.values()).map((q) => {
          const att = quizToChapitreMap[q.id];
          if (att && !q.chapitre_id) {
            return {
              ...q,
              chapitre_id: att.chapitre_id,
              cours_id: q.cours_id || att.cours_id || null,
            };
          }
          return q;
        });

        return results;
      } catch (err: any) {
        console.error('Erreur chargement quizzes:', err?.message);
        return localQuizzes;
      }
    },
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (payload: {
      titre: string;
      classe: string;
      niveau: 'TENAFEP' | 'EXETAT' | 'Classe_Standard';
      duree_minutes: number;
      matiere_id?: string;
      matiere_nom?: string;
      matiere?: string;
      cours_id?: string;
      cours_titre?: string;
      chapitre_id?: string;
      chapitre_titre?: string;
      ecole_id?: string;
      questions: QuizQuestion[];
    }) => {
      if (payload.questions.length !== 10) {
        throw new Error('Chaque quiz doit obligatoirement contenir exactement 10 questions.');
      }

      const structuredQuestions = payload.questions.map((q) => ({
        num_order: q.numOrder,
        question: q.question,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_option: q.correctOption,
        explication: q.explication,
        points: q.points || 1,
        correct_answer: {
          content: (q[`option${q.correctOption}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'] as string) || 'Option',
        },
        incorrect_answers: (['A', 'B', 'C', 'D'] as const)
          .filter((opt) => opt !== q.correctOption)
          .map((opt) => ({
            content: (q[`option${opt}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'] as string) || 'Option',
          })),
      }));

      const newQuizId = `quiz-${Date.now()}-${Math.random().toString(36).slice(-6)}`;

      const newQuizItem: QuizItem = {
        id: newQuizId,
        titre: payload.titre,
        matiere_nom: payload.matiere_nom || payload.matiere || 'Formation Générale',
        classe: payload.classe,
        niveau: payload.niveau,
        total_questions: 10,
        duree_minutes: payload.duree_minutes,
        created_at: new Date().toISOString(),
        chapitre_id: payload.chapitre_id || null,
        chapitre_titre: payload.chapitre_titre || null,
        cours_id: payload.cours_id || null,
        cours_titre: payload.cours_titre || null,
        questions: payload.questions,
      };

      // 1. Sauvegarde dans le service de synchronisation partagé multi-appareils
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_quiz',
            payload: newQuizItem,
          }),
        });
      } catch (err: any) {
        console.warn('Erreur API sync save_quiz:', err?.message);
      }

      // 2. Si un chapitre est rattaché, enregistrer immédiatement la liaison
      if (payload.chapitre_id) {
        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'attach_quiz',
              payload: {
                quiz_id: newQuizId,
                quiz_titre: payload.titre,
                chapitre_id: payload.chapitre_id,
                cours_id: payload.cours_id,
              },
            }),
          });
        } catch {}

        const attStored = getStoredAttachments();
        attStored[payload.chapitre_id] = {
          quiz_id: newQuizId,
          quiz_titre: payload.titre,
          chapitre_id: payload.chapitre_id,
          cours_id: payload.cours_id,
        };
        saveStoredAttachments(attStored);
      }

      // 3. Sauvegarde dans le cache local
      try {
        const stored = getStoredQuizzes();
        saveStoredQuizzes([newQuizItem, ...stored]);
      } catch {}

      return newQuizItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz_attachments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher_chapters'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation pour lier / attacher un quiz existant à une leçon (chapitre)
 */
export function useAttachQuizToLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      quiz_id: string;
      quiz_titre?: string;
      chapitre_id: string;
      chapitre_titre?: string;
      cours_id?: string;
      cours_titre?: string;
    }) => {
      // 1. Envoyer à l'API de synchronisation pour propagation cross-device
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'attach_quiz',
            payload: {
              quiz_id: payload.quiz_id,
              quiz_titre: payload.quiz_titre,
              chapitre_id: payload.chapitre_id,
              cours_id: payload.cours_id,
            },
          }),
        });
      } catch (err: any) {
        console.warn('Erreur sync attach_quiz:', err?.message);
      }

      // 2. Mettre à jour localement les attachements
      const attachments = getStoredAttachments();
      attachments[payload.chapitre_id] = {
        quiz_id: payload.quiz_id,
        quiz_titre: payload.quiz_titre,
        chapitre_id: payload.chapitre_id,
        cours_id: payload.cours_id,
      };
      saveStoredAttachments(attachments);

      // 3. Mettre à jour la liste locale des quiz
      const storedQuizzes = getStoredQuizzes();
      const updatedQuizzes = storedQuizzes.map((q) => {
        if (q.id === payload.quiz_id) {
          return {
            ...q,
            chapitre_id: payload.chapitre_id,
            chapitre_titre: payload.chapitre_titre || q.chapitre_titre,
            cours_id: payload.cours_id || q.cours_id,
            cours_titre: payload.cours_titre || q.cours_titre,
          };
        }
        return q;
      });
      saveStoredQuizzes(updatedQuizzes);

      return attachments[payload.chapitre_id];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz_attachments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher_chapters'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation pour détacher un quiz d'une leçon (chapitre)
 */
export function useDetachQuizFromLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { chapitre_id: string; quiz_id?: string }) => {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'detach_quiz',
            payload,
          }),
        });
      } catch (err: any) {
        console.warn('Erreur sync detach_quiz:', err?.message);
      }

      const attachments = getStoredAttachments();
      delete attachments[payload.chapitre_id];
      saveStoredAttachments(attachments);

      if (payload.quiz_id) {
        const storedQuizzes = getStoredQuizzes();
        const updated = storedQuizzes.map((q) => {
          if (q.id === payload.quiz_id) {
            return { ...q, chapitre_id: null, chapitre_titre: null };
          }
          return q;
        });
        saveStoredQuizzes(updated);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz_attachments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher_chapters'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation pour soumettre les réponses d'un élève à un quiz
 */
export function useSubmitQuizAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      quiz_id: string;
      score: number;
      total_questions: number;
      reponses: Record<number, string>;
    }) => {
      if (typeof window !== 'undefined') {
        try {
          const key = `ads_quiz_results_${payload.quiz_id}`;
          const existing = localStorage.getItem(key);
          const history = existing ? JSON.parse(existing) : [];
          const record = {
            ...payload,
            completed_at: new Date().toISOString(),
          };
          localStorage.setItem(key, JSON.stringify([record, ...(Array.isArray(history) ? history : [])]));
        } catch {}
      }

      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz_results'] });
      queryClient.invalidateQueries({ queryKey: ['student_quizzes'] });
    },
  });
}

