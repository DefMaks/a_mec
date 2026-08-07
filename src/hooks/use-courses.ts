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
        console.error('Error fetching courses from Supabase:', error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        matiere_id: item.matieres?.id,
        matiere_nom: item.matieres?.nom || '',
        classe: item.classe || '',
        chapitres_count: item.chapitres?.length || 0,
        created_at: item.created_at,
      }));
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
      ecole_id?: string;
    }) => {
      const targetSchoolId = courseData.ecole_id || DEFAULT_SCHOOL_ID;
      const { data, error } = await supabase
        .from('cours')
        .insert([
          {
            titre: courseData.titre,
            description: courseData.description,
            classe: courseData.classe,
            matiere_id: courseData.matiere_id,
            ecole_id: targetSchoolId,
          },
        ])
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
