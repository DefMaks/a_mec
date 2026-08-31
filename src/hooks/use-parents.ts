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
    queryKey: ['parents', isSuperAdmin],
    queryFn: async (): Promise<ParentItem[]> => {
      try {
        // 1. Essayer de récupérer depuis profiles (role = 'parent')
        const { data: profileParents, error: pErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'parent')
          .order('created_at', { ascending: false });

        let parentsRaw = profileParents;

        if (pErr || !parentsRaw || parentsRaw.length === 0) {
          // Fallback table parents
          const { data: tableParents } = await supabase
            .from('parents')
            .select('*');
          parentsRaw = tableParents || [];
        }

        // Récupérer les élèves pour lier les enfants
        let elevesList: any[] = [];
        try {
          const { data: eData } = await supabase.from('eleves').select('id, parent_id, pseudonyme, nom_complet, classe_id');
          if (eData) elevesList = eData;
        } catch {}

        return (parentsRaw || []).map((p: any) => {
          const linkedStudents = elevesList.filter((e) => e.parent_id === p.id);
          const formattedChildren = linkedStudents.map((e) => ({
            id: e.id,
            nom_complet: e.nom_complet || e.pseudonyme || 'Élève',
            classe: 'Classe Primaire / Secondaire',
            ecole_nom: 'Académie du Salut (ADS)',
          }));

          return {
            id: p.id,
            nom_complet: p.nom_complet || p.pseudonyme || 'Parent Référent',
            telephone: p.telephone || '+243 810 000 000',
            email: p.email || undefined,
            commune_ville: p.commune_ville || 'Kinshasa',
            statut_abonnement: (p.statut_abonnement || (p.active !== false ? 'ACTIF' : 'EN_ATTENTE')) as any,
            created_at: p.created_at || new Date().toISOString(),
            eleves_lies: formattedChildren.length > 0 ? formattedChildren : (Array.isArray(p.eleves_lies) ? p.eleves_lies : []),
          };
        });
      } catch (err: any) {
        console.error('Erreur chargement parents:', err?.message);
        return [];
      }
    },
  });
}
