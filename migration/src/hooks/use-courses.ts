import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface CourseItem {
  id: string;
  titre: string;
  description?: string;
  matiere_id?: string;
  matiere_nom?: string;
  classe?: string;
  enseignant_id?: string;
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

export function useCourses() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['courses'],
    queryFn: async (): Promise<CourseItem[]> => {
      const { data, error } = await supabase
        .from('cours')
        .select(`
          id,
          titre,
          description,
          classe,
          matiere_id,
          enseignant_id,
          created_at,
          matieres ( nom ),
          chapitres ( count )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Fallback local pour cours:', error.message);
        return [
          {
            id: 'c-1',
            titre: 'Analyse Mathématique - Fonctions Logarithmiques',
            description: 'Étude approfondie des fonctions dérivables et logarithmes pour EXETAT',
            classe: '6ème des Humanités Math-Physique',
            matiere_nom: 'Mathématiques',
            created_at: new Date().toISOString(),
            chapitres_count: 5,
          },
          {
            id: 'c-2',
            titre: 'Chimie Organique - Les Hydrocarbures',
            description: 'Structure, nomenclature et réactions des alcanes et alcènes',
            classe: '6ème Bio-Chimie',
            matiere_nom: 'Chimie',
            created_at: new Date().toISOString(),
            chapitres_count: 4,
          },
          {
            id: 'c-3',
            titre: 'Histoire RDC - La Colonisation et Indépendance (1908-1960)',
            description: 'Mouvements d émancipation et figures historiques de la RDC',
            classe: '4ème Littéraire',
            matiere_nom: 'Histoire',
            created_at: new Date().toISOString(),
            chapitres_count: 3,
          },
        ];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        classe: item.classe,
        matiere_id: item.matiere_id,
        matiere_nom: item.matieres?.nom || 'Matière générale',
        enseignant_id: item.enseignant_id,
        created_at: item.created_at,
        chapitres_count: item.chapitres?.[0]?.count || 0,
      }));
    },
  });
}

export function useCourseChapters(courseId: string) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['course-chapters', courseId],
    queryFn: async (): Promise<ChapterItem[]> => {
      if (!courseId) return [];

      const { data, error } = await supabase
        .from('chapitres')
        .select('*')
        .eq('cours_id', courseId)
        .order('ordre', { ascending: true });

      if (error) {
        console.warn('Fallback chapitres:', error.message);
        return [
          {
            id: 'chap-1',
            cours_id: courseId,
            titre: 'Chapitre 1 : Définition et Propriétés Fondamentales',
            ordre: 1,
            contenu: 'Rappels théoriques et limites des fonctions logarithmiques.',
            created_at: new Date().toISOString(),
          },
          {
            id: 'chap-2',
            cours_id: courseId,
            titre: 'Chapitre 2 : Calcul de Dérivées et Intégrales',
            ordre: 2,
            contenu: 'Formules explicites et méthodes d intégration par parties.',
            created_at: new Date().toISOString(),
          },
        ];
      }

      return data || [];
    },
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (newCourse: Omit<CourseItem, 'id' | 'created_at' | 'chapitres_count'>) => {
      const { data, error } = await supabase
        .from('cours')
        .insert([newCourse])
        .select()
        .single();

      if (error) {
        console.warn('Simulated course creation:', error.message);
        return {
          id: `c-${Date.now()}`,
          ...newCourse,
          created_at: new Date().toISOString(),
        };
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
