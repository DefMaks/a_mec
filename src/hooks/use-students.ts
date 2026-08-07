import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Eleve } from '@/types/database.types';

export function useStudents(classId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['students', classId],
    queryFn: async () => {
      let query = supabase
        .from('eleves')
        .select('*, classes(*, niveaux(*)), parent(*)')
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('classe_id', classId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Eleve[];
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (studentData: { pseudonyme: string; classe_id?: string; parent_id?: string }) => {
      const code_acces = 'MEC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('eleves')
        .insert([{ ...studentData, code_acces }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
