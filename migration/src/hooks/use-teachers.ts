import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

export function useTeachers(filters?: { search?: string; activeOnly?: boolean }) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['teachers', filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, ecoles(nom)')
        .eq('role', 'teacher')
        .order('nom_complet', { ascending: true });

      if (filters?.search) {
        query = query.ilike('nom_complet', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Profile[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (teacherData: { nom_complet: string; email: string; telephone?: string; ecole_id?: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ ...teacherData, role: 'teacher' }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}
