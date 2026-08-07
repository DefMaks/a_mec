// src/hooks/use-students.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Eleve } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export function useStudents(classId?: string, isSuperAdmin: boolean = false) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['students', classId, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      let query = supabase
        .from('eleves')
        .select(`
          *,
          classes (
            *,
            niveaux (*)
          ),
          parent:profiles!eleves_parent_id_fkey (
            id,
            nom_complet,
            role,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('classe_id', classId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching students from Supabase:', error.message);
        return [] as Eleve[];
      }

      return (data || []) as Eleve[];
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (studentData: {
      pseudonyme: string;
      code_acces?: string;
      classe_id?: string;
      parent_id?: string;
    }) => {
      const code = studentData.code_acces || Math.floor(1000000000 + Math.random() * 9000000000).toString();

      const { data, error } = await supabase
        .from('eleves')
        .insert([
          {
            pseudonyme: studentData.pseudonyme,
            code_acces: code,
            classe_id: studentData.classe_id,
            parent_id: studentData.parent_id,
          },
        ])
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