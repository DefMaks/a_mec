import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Eleve } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export function useStudents(classId?: string, isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['students', classId, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      let query = supabase
        .from('eleves')
        .select('*, classes(*, niveaux(*)), parent(*)')
        .order('created_at', { ascending: false });

      if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
        query = query.eq('ecole_id', DEFAULT_SCHOOL_ID);
      }

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
  const supabase = createClient();

  return useMutation({
    mutationFn: async (studentData: {
      nom_complet: string;
      matricule?: string;
      classe_id?: string;
      ecole_id?: string;
    }) => {
      const targetSchoolId = studentData.ecole_id || DEFAULT_SCHOOL_ID;
      const { data, error } = await supabase
        .from('eleves')
        .insert([
          {
            nom_complet: studentData.nom_complet,
            matricule: studentData.matricule || `ADS-${Date.now().toString().slice(-4)}`,
            classe_id: studentData.classe_id,
            ecole_id: targetSchoolId,
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
