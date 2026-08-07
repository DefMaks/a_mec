import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Ecole } from '@/types/database.types';

export function useSchools() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ecoles')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw new Error(error.message);
      return data as Ecole[];
    },
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (schoolData: { nom: string; rccm?: string; id_nat?: string }) => {
      const { data, error } = await supabase
        .from('ecoles')
        .insert([schoolData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
  });
}
