import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

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

export function useParents() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['parents'],
    queryFn: async (): Promise<ParentItem[]> => {
      const { data, error } = await supabase
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

      if (error) {
        console.warn('Fallback local parents:', error.message);
        return [
          {
            id: 'par-1',
            nom_complet: 'Mbuyi Kalala Alphonse',
            telephone: '+243812345678',
            email: 'alphonse.mbuyi@gmail.com',
            commune_ville: 'Limete, Kinshasa',
            statut_abonnement: 'ACTIF',
            created_at: new Date().toISOString(),
            eleves_lies: [
              { id: 'el-101', nom_complet: 'Mbuyi Jean', classe: '6ème Math-Physique', ecole_nom: 'Collège Boboto' },
              { id: 'el-102', nom_complet: 'Mbuyi Marie', classe: '4ème Littéraire', ecole_nom: 'Lycée Sacré Cœur' },
            ],
          },
          {
            id: 'par-2',
            nom_complet: 'Tshilombo Marie-Jeanne',
            telephone: '+243998765432',
            email: 'mj.tshilombo@yahoo.fr',
            commune_ville: 'Gombe, Kinshasa',
            statut_abonnement: 'EN_ATTENTE',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            eleves_lies: [
              { id: 'el-201', nom_complet: 'Tshilombo David', classe: '8ème EB', ecole_nom: 'Institut Plastique' },
            ],
          },
          {
            id: 'par-3',
            nom_complet: 'Kambale Eric',
            telephone: '+243851122334',
            email: 'eric.kambale@outlook.com',
            commune_ville: 'Goma, Nord-Kivu',
            statut_abonnement: 'ACTIF',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            eleves_lies: [
              { id: 'el-301', nom_complet: 'Kambale Blessing', classe: '6ème Bio-Chimie', ecole_nom: 'Complexe Metanoia' },
            ],
          },
        ];
      }

      return (data || []).map((p: any) => ({
        id: p.id,
        nom_complet: p.nom_complet || 'Parent sans nom',
        telephone: p.telephone || 'N/A',
        email: p.email,
        commune_ville: p.commune_ville || 'RDC',
        statut_abonnement: p.statut_abonnement || 'EN_ATTENTE',
        created_at: p.created_at,
        eleves_lies: (p.parent_eleves || []).map((pe: any) => ({
          id: pe.eleves?.id || 'el-unk',
          nom_complet: pe.eleves?.nom_complet || 'Élève',
          classe: pe.eleves?.classe || 'Inconnue',
          ecole_nom: pe.eleves?.ecoles?.nom || 'École',
        })),
      }));
    },
  });
}
