import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export interface CourseItem {
  id: string;
  titre: string;
  description?: string;
  matiere_id?: string;
  matiere_nom?: string;
  classe?: string;
  enseignant_id?: string;
  ecole_id?: string;
  created_at?: string;
  chapitres_count?: number;
}

export interface ChapterItem {
  id: string;
  cours_id: string;
  titre: string;
  ordre: number;
  contenu?: string;
  audio_url?: string;
  video_url?: string;
  pdf_url?: string;
  created_at?: string;
}

export function useCourses(isSuperAdmin: boolean = false) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['courses', isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async (): Promise<CourseItem[]> => {
      let query = supabase
        .from('cours')
        .select(`
          id,
          titre,
          description,
          classe,
          created_at,
          matieres ( id, nom ),
          chapitres ( id )
        `)
        .order('created_at', { ascending: false });

      if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
        query = query.eq('ecole_id', DEFAULT_SCHOOL_ID);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Fallback local courses:', error.message);
        return [
          {
            id: 'c-101',
            titre: 'Analyse Mathématique - Fonctions Dérivables & Intégrales',
            description: 'Programme officiel EXETAT RDC pour les sections scientifiques.',
            matiere_nom: 'Mathématiques',
            classe: '6ème Math-Physique',
            ecole_id: DEFAULT_SCHOOL_ID || '64c583de-e9e2-456b-8942-164656544661',
            chapitres_count: 5,
            created_at: new Date().toISOString(),
          },
          {
            id: 'c-102',
            titre: 'Physique Quantique & Optique Géométrique',
            description: 'Optique, réfraction et lois de Snell-Descartes.',
            matiere_nom: 'Physique',
            classe: '6ème Math-Physique',
            ecole_id: DEFAULT_SCHOOL_ID || '64c583de-e9e2-456b-8942-164656544661',
            chapitres_count: 3,
            created_at: new Date().toISOString(),
          },
        ];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        matiere_id: item.matieres?.id,
        matiere_nom: item.matieres?.nom || 'Général',
        classe: item.classe || 'Toutes',
        chapitres_count: item.chapitres?.length || 0,
        created_at: item.created_at,
      }));
    },
  });
}
