import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export function useTeachers(filters?: { search?: string; activeOnly?: boolean }, isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['teachers', filters, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('role', 'teacher')
          .order('nom_complet', { ascending: true });

        if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
          query = query.eq('ecole_id', DEFAULT_SCHOOL_ID);
        }

        if (filters?.search) {
          query = query.ilike('nom_complet', `%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erreur récupération enseignants:', error.message);
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        return data.map((t: any) => ({
          ...t,
          ecoles: t.ecoles || { nom: 'Académie du Salut' },
        })) as Profile[];
      } catch (err: any) {
        console.error('Erreur chargement teachers:', err?.message);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (teacherData: {
      nom_complet: string;
      email: string;
      telephone?: string;
      ecole_id?: string;
    }) => {
      const targetSchoolId = teacherData.ecole_id || DEFAULT_SCHOOL_ID;
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            nom_complet: teacherData.nom_complet,
            email: teacherData.email,
            telephone: teacherData.telephone,
            ecole_id: targetSchoolId,
            role: 'teacher',
          },
        ])
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
