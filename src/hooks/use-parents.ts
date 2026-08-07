import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export interface ParentItem {
  id: string;
  nom_complet: string;
  telephone: string;
  email?: string;
  commune_ville?: string;
  statut_abonnement: 'ACTIF' | 'EN_ATTENTE' | 'EXPIRER';
  eleves_lies: { id: string; nom_complet: string; classe: string; ecole_nom: string }[];
  created_at: string;
}

export function useParents(isSuperAdmin: boolean = false) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['parents', isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async (): Promise<ParentItem[]> => {
      let query = supabase
        .from('parents')
        .select(`
          id,
          nom_complet,
          telephone,
          email,
          commune_ville,
          statut_abonnement,
          created_at,
          parent_eleves (
            eleves ( id, nom_complet, classe, ecoles ( nom ) )
          )
        `)
        .order('created_at', { ascending: false });

      if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
        query = query.eq('ecole_id', DEFAULT_SCHOOL_ID);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching parents from Supabase:', error.message);
        return [];
      }

      return (data || []).map((p: any) => ({
        id: p.id,
        nom_complet: p.nom_complet || '',
        telephone: p.telephone || '',
        email: p.email,
        commune_ville: p.commune_ville || '',
        statut_abonnement: p.statut_abonnement || 'EN_ATTENTE',
        created_at: p.created_at,
        eleves_lies: (p.parent_eleves || []).map((pe: any) => ({
          id: pe.eleves?.id || '',
          nom_complet: pe.eleves?.nom_complet || '',
          classe: pe.eleves?.classe || '',
          ecole_nom: pe.eleves?.ecoles?.nom || '',
        })),
      }));
    },
  });
}
