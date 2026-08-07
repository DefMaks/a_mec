// src/hooks/use-parents.ts
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export interface ParentItem {
  id: string;
  nom_complet: string;
  telephone?: string;
  email?: string;
  commune_ville?: string;
  statut_abonnement: 'ACTIF' | 'EN_ATTENTE' | 'EXPIRER';
  profile_status: boolean;
  eleves_lies: {
    id: string;
    pseudonyme: string;
    classe_id?: string;
  }[];
  created_at: string;
}

export function useParents(isSuperAdmin: boolean = false) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['parents', isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async (): Promise<ParentItem[]> => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          nom_complet,
          ecole_id,
          profile_status,
          created_at,
          parent_enfant!parent_enfant_parent_id_fkey (
            eleves (
              id,
              pseudonyme,
              classe_id
            )
          ),
          eleves!eleves_parent_id_fkey (
            id,
            pseudonyme,
            classe_id
          )
        `)
        .eq('role', 'parent')
        .order('created_at', { ascending: false });

      // Filtrer : inclure l'école par défaut OU les profils sans école (ecole_id is null)
      if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
        query = query.or(`ecole_id.eq.${DEFAULT_SCHOOL_ID},ecole_id.is.null`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching parents from Supabase:', error.message);
        return [];
      }

      return (data || []).map((p: any) => {
        const elevesFromJonction = (p.parent_enfant || [])
          .map((pe: any) => pe.eleves)
          .filter(Boolean);

        const elevesFromDirectFK = p.eleves || [];

        const allEleves = [...elevesFromJonction, ...elevesFromDirectFK];
        const uniqueElevesMap = new Map();

        allEleves.forEach((e: any) => {
          if (e && e.id && !uniqueElevesMap.has(e.id)) {
            uniqueElevesMap.set(e.id, {
              id: e.id,
              pseudonyme: e.pseudonyme || 'Élève',
              classe_id: e.classe_id,
            });
          }
        });

        return {
          id: p.id,
          nom_complet: p.nom_complet || 'Parent sans nom',
          profile_status: p.profile_status ?? false,
          statut_abonnement: p.profile_status ? 'ACTIF' : 'EN_ATTENTE',
          created_at: p.created_at,
          eleves_lies: Array.from(uniqueElevesMap.values()),
        };
      });
    },
  });
}