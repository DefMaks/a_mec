import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export interface ChapterItem {
  id: string;
  cours_id?: string;
  titre: string;
  ordre?: number;
  position?: number;
  duree_minutes?: number | null;
  contenu?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  pdf_url?: string | null;
  created_at?: string;
}

export interface CourseItem {
  id: string;
  titre: string;
  description?: string;
  matiere_id?: string;
  matiere_nom?: string;
  matiere?: string;
  classe?: string;
  enseignant_id?: string;
  enseignant_nom?: string;
  ecole_id?: string;
  created_at?: string;
  chapitres_count?: number;
  chapitres?: ChapterItem[];
}

export type Course = CourseItem;

export function useCourses(isSuperAdmin: boolean = false) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['courses', isSuperAdmin],
    queryFn: async (): Promise<CourseItem[]> => {
      try {
        const query = supabase
          .from('cours')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: coursData, error: coursError } = await query;

        if (coursError) {
          console.error('Erreur récupération cours:', coursError.message);
          return [];
        }

        if (!coursData || coursData.length === 0) {
          return [];
        }

        let matieresList: any[] = [];
        let chapitresList: any[] = [];

        try {
          const { data: mData } = await supabase.from('matieres').select('*');
          if (mData) matieresList = mData;
        } catch {}

        try {
          const { data: chData } = await supabase.from('chapitres').select('*');
          if (chData) chapitresList = chData;
        } catch {}

        return coursData.map((item: any) => {
          const matchedMatiere = matieresList.find((m) => m.id === item.matiere_id);
          const matchedChapitres = chapitresList.filter((ch) => ch.cours_id === item.id);

          const chapitres = (matchedChapitres.length > 0
            ? matchedChapitres
            : Array.isArray(item.chapitres)
            ? item.chapitres
            : []
          ).map((ch: any, idx: number) => ({
            id: ch.id || `ch-${idx + 1}`,
            cours_id: item.id,
            titre: ch.titre || `Chapitre ${idx + 1}`,
            position: ch.position || ch.ordre || idx + 1,
            duree_minutes: ch.duree_minutes || 25,
            contenu: ch.contenu || ch.contenu_html || '',
            audio_url: ch.audio_url || null,
            pdf_url: ch.pdf_url || null,
          }));

          const matiereNom = matchedMatiere?.nom || item.matiere_nom || item.matiere || 'Discipline Générale';

          return {
            id: item.id,
            titre: item.titre || 'Cours Pédagogique',
            description: item.description || '',
            matiere_id: item.matiere_id,
            matiere_nom: matiereNom,
            matiere: matiereNom,
            classe: item.classe || 'Toutes les classes',
            chapitres_count: chapitres.length,
            chapitres: chapitres,
            created_at: item.created_at || new Date().toISOString(),
          };
        });
      } catch (err: any) {
        console.error('Erreur chargement cours:', err?.message);
        return [];
      }
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (courseData: {
      titre: string;
      description?: string;
      classe?: string;
      matiere_id?: string;
      matiere_nom?: string;
      matiere?: string;
      ecole_id?: string;
    }) => {
      const insertPayload: any = {
        titre: courseData.titre,
        description: courseData.description || '',
        is_published: true,
      };

      if (courseData.matiere_id) insertPayload.matiere_id = courseData.matiere_id;
      if (courseData.classe) insertPayload.classe = courseData.classe;

      const { data, error } = await supabase
        .from('cours')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
