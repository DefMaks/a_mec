import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Ecole } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export function useSchools(isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['schools', isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      try {
        let query = supabase
          .from('ecoles')
          .select('*')
          .order('nom', { ascending: true });

        if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
          query = query.eq('id', DEFAULT_SCHOOL_ID);
        }

        const { data, error } = await query;

        if (error) {
          console.warn('Supabase schools query info:', error.message);
          return [
            {
              id: DEFAULT_SCHOOL_ID,
              nom: 'Académie du Salut!',
              rccm: 'CD/KNG/RCCM/20-A-00652',
              id_nat: 'ID-NAT 01-910-N58634L',
            },
          ] as Ecole[];
        }

        if (!data || data.length === 0) {
          return [
            {
              id: DEFAULT_SCHOOL_ID,
              nom: 'Académie du Salut!',
              rccm: 'CD/KNG/RCCM/20-A-00652',
              id_nat: 'ID-NAT 01-910-N58634L',
            },
          ] as Ecole[];
        }

        return (data || []) as Ecole[];
      } catch (err: any) {
        console.warn('Erreur résiliente schools:', err?.message);
        return [
          {
            id: DEFAULT_SCHOOL_ID,
            nom: 'Académie du Salut!',
            rccm: 'CD/KNG/RCCM/20-A-00652',
            id_nat: 'ID-NAT 01-910-N58634L',
          },
        ] as Ecole[];
      }
    },
    staleTime: 1000 * 60 * 5,
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
