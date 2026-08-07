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
          niveau,
          classe,
          duree_minutes,
          created_at,
          quiz_questions (
            id,
            num_order,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explication,
            points
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quizzes from Supabase:', error.message);
        return [];
      }

      return (data || []).map((q: any) => ({
        id: q.id,
        titre: q.titre,
        matiere_nom: q.matiere_nom || '',
        niveau: q.niveau || '',
        classe: q.classe || '',
        total_questions: q.quiz_questions?.length || 0,
        duree_minutes: q.duree_minutes || 0,
        created_at: q.created_at,
        questions: (q.quiz_questions || []).map((item: any) => ({
          id: item.id,
          numOrder: item.num_order,
          question: item.question,
          optionA: item.option_a,
          optionB: item.option_b,
          optionC: item.option_c,
          optionD: item.option_d,
          correctOption: item.correct_option,
          explication: item.explication,
          points: item.points || 1,
        })),
      }));
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

      const { data: quizData, error: quizError } = await supabase
        .from('quiz')
        .insert([{
          titre: payload.titre,
          classe: payload.classe,
          niveau: payload.niveau,
          duree_minutes: payload.duree_minutes,
        }])
        .select()
        .single();

      if (quizError) {
        throw new Error(quizError.message);
      }

      const questionsToInsert = payload.questions.map((q) => ({
        quiz_id: quizData.id,
        num_order: q.numOrder,
        question: q.question,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_option: q.correctOption,
        explication: q.explication,
        points: q.points || 1,
      }));

      const { error: questionsError } = await supabase.from('quiz_questions').insert(questionsToInsert);
      if (questionsError) throw new Error(questionsError.message);

      return quizData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}
