import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID, APP_NAME, APP_SHORT_NAME } from '@/lib/config';

export function useTeachers(filters?: { search?: string; activeOnly?: boolean }, isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['teachers', filters, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, ecoles(nom)')
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
        console.warn('Fallback local teachers:', error.message);
        const schoolName = `${APP_NAME} (${APP_SHORT_NAME})`;
        return [
          {
            id: 'tch-1',
            nom_complet: 'Prof. Kalala Jean',
            email: 'kalala.jean@academiedusalut.cd',
            role: 'teacher',
            telephone: '+243815550001',
            ecole_id: DEFAULT_SCHOOL_ID || '64c583de-e9e2-456b-8942-164656544661',
            ecoles: { nom: schoolName },
            created_at: new Date().toISOString(),
          },
          {
            id: 'tch-2',
            nom_complet: 'Mme. Bakonzo Esther',
            email: 'esther.bakonzo@academiedusalut.cd',
            role: 'teacher',
            telephone: '+243998887766',
            ecole_id: DEFAULT_SCHOOL_ID || '64c583de-e9e2-456b-8942-164656544661',
            ecoles: { nom: schoolName },
            created_at: new Date().toISOString(),
          },
        ] as Profile[];
      }

      return data as Profile[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
