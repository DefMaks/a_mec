// src/hooks/use-courses.ts
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
  created_at?: string;
  chapitres_count?: number;
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
          created_at,
          matiere:matiere_id ( id, nom ),
          chapitres ( id )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching courses from Supabase:', error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        titre: item.titre,
        matiere_id: item.matiere?.id,
        matiere_nom: item.matiere?.nom || '',
        chapitres_count: item.chapitres?.length || 0,
        created_at: item.created_at,
      }));
    },
  });
}

export function useCourse(id: string) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['course', id],
    queryFn: async (): Promise<CourseItem | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('cours')
        .select(`
          id,
          titre,
          matiere_id,
          created_at,
          matiere:matiere_id ( id, nom )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching course:', error.message);
        return null;
      }

      return {
        id: data.id,
        titre: data.titre,
        matiere_id: data.matiere_id,
        matiere_nom: (data.matiere as any)?.nom || '',
        created_at: data.created_at,
      };
    },
    enabled: !!id,
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
    }) => {
      const { data, error } = await supabase
        .from('cours')
        .insert([
          {
            titre: courseData.titre,
            matiere_id: courseData.matiere_id,
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

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      titre: string;
      matiere_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('cours')
        .update({
          titre: payload.titre,
          matiere_id: payload.matiere_id,
        })
        .eq('id', payload.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
    },
  });
}