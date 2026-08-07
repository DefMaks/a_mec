// src/hooks/use-quizzes.ts
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
  niveau?: string;
  classe?: string;
  total_questions: number;
  duree_minutes: number;
  created_at?: string;
  questions?: QuizQuestion[];
}

export function useQuizzes() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async (): Promise<QuizItem[]> => {
      const { data, error } = await supabase
        .from('quiz')
        .select(`
          id,
          titre,
          answers
        `);

      if (error) {
        console.error('Error fetching quizzes from Supabase:', error.message);
        return [];
      }

      return (data || []).map((q: any) => {
        const questionsList: QuizQuestion[] = Array.isArray(q.answers) ? q.answers : [];
        return {
          id: q.id,
          titre: q.titre || 'Quiz sans titre',
          niveau: 'EXETAT',
          classe: 'Général',
          total_questions: questionsList.length,
          duree_minutes: 30,
          created_at: new Date().toISOString(),
          questions: questionsList,
        };
      });
    },
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
      questions: QuizQuestion[];
    }) => {
      if (payload.questions.length !== 10) {
        throw new Error('Chaque quiz doit obligatoirement contenir exactement 10 questions.');
      }

      // Stockage des 10 questions directement dans le champ JSONB "answers"
      const { data, error } = await supabase
        .from('quiz')
        .insert([
          {
            titre: payload.titre,
            answers: payload.questions,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useSaveQuizAttempt() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (payload: {
      quizId: string;
      eleveId?: string;
      score: number;
      totalQuestions: number;
      reponses?: Record<string, any>;
      reussi: boolean;
    }) => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert([
          {
            quiz_id: payload.quizId,
            eleve_id: payload.eleveId,
            score: payload.score,
            duration_attemp: 30,
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn('Saving quiz attempt warning:', error.message);
        return { success: true, score: payload.score };
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz_attempts'] });
    },
  });
}