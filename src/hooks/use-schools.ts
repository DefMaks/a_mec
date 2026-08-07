import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Ecole } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID, APP_NAME, APP_SHORT_NAME } from '@/lib/config';

export function useSchools(isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['schools', isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      let query = supabase
        .from('ecoles')
        .select('*')
        .order('nom', { ascending: true });

      if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
        query = query.eq('id', DEFAULT_SCHOOL_ID);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Fallback local schools:', error.message);
        const defaultSchool: Ecole = {
          id: DEFAULT_SCHOOL_ID || '64c583de-e9e2-456b-8942-164656544661',
          nom: `${APP_NAME} (${APP_SHORT_NAME})`,
          rccm: 'CD/KIN/RCCM/2024-B-0192',
          id_nat: '01-93-N38102A',
          code_ecole: 'ADS-KIN-001',
          adresse: 'Avenue de la Paix #42, Gombe',
          telephone: '+243810000001',
          email: 'admin@academiedusalut.cd',
          ville: 'Kinshasa',
          province: 'Kinshasa',
          created_at: new Date().toISOString(),
        };

        if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
          return [defaultSchool];
        }

        return [
          defaultSchool,
          {
            id: 'ec-202',
            nom: 'Collège Boboto',
            rccm: 'CD/KIN/RCCM/2020-B-0012',
            id_nat: '01-93-N11201B',
            code_ecole: 'BOB-KIN-002',
            adresse: 'Avenue Boboto, Gombe',
            telephone: '+243812345678',
            email: 'info@boboto.cd',
            ville: 'Kinshasa',
            province: 'Kinshasa',
            created_at: new Date().toISOString(),
          },
        ] as Ecole[];
      }

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
