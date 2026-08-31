import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import { getInitialAssignments, PRIMARY_CLASS_ID, PROF_SHASA_ID } from './use-course-assignments';

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
  classe_id?: string;
  enseignant_id?: string;
  enseignant_nom?: string;
  ecole_id?: string;
  created_at?: string;
  chapitres_count?: number;
  chapitres?: ChapterItem[];
}

export type Course = CourseItem;

export function useCourses(classeId?: string, isSuperAdmin: boolean = false) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['courses', classeId, isSuperAdmin],
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
          const { data: mData } = await supabase.from('matiere').select('*');
          if (mData) {
            matieresList = mData;
          }
        } catch {}

        try {
          const { data: chData } = await supabase.from('chapitres').select('*');
          if (chData) chapitresList = chData;
        } catch {}

        const assignments = getInitialAssignments();

        const allMapped = coursData.map((item: any) => {
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
          
          // Chercher l'assignation de classe
          const assignedClasse = assignments.find((a) => a.cours_id === item.id);

          return {
            id: item.id,
            titre: item.titre || 'Cours Pédagogique',
            description: item.description || '',
            matiere_id: item.matiere_id,
            matiere_nom: matiereNom,
            matiere: matiereNom,
            classe: assignedClasse ? '1ère Primaire' : item.classe || '1ère Primaire',
            classe_id: assignedClasse?.classe_id || PRIMARY_CLASS_ID,
            enseignant_id: assignedClasse?.enseignant_id || PROF_SHASA_ID,
            enseignant_nom: 'Prof. Shasa Kanyinda',
            chapitres_count: chapitres.length,
            chapitres: chapitres,
            created_at: item.created_at || new Date().toISOString(),
          };
        });

        if (classeId) {
          // Filtrer selon la classe
          const assignedCourseIds = assignments
            .filter((a) => a.classe_id === classeId && a.est_actif !== false)
            .map((a) => a.cours_id);

          return allMapped.filter(
            (c) => assignedCourseIds.includes(c.id) || c.classe_id === classeId
          );
        }

        return allMapped;
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
      classe_id?: string;
      target_classe_ids?: string[];
      matiere_id?: string;
      matiere_nom?: string;
      matiere?: string;
      enseignant_id?: string;
      ecole_id?: string;
    }) => {
      const insertPayload: any = {
        titre: courseData.titre,
        description: courseData.description || '',
        is_published: true,
      };

      if (courseData.matiere_id) insertPayload.matiere_id = courseData.matiere_id;
      if (courseData.classe) insertPayload.classe = courseData.classe;

      let insertedCourse: any = null;

      try {
        const { data, error } = await supabase
          .from('cours')
          .insert([insertPayload])
          .select()
          .single();

        if (!error && data) {
          insertedCourse = data;
        }
      } catch {}

      if (!insertedCourse) {
        insertedCourse = {
          id: `cours-${Date.now()}`,
          titre: courseData.titre,
          description: courseData.description || '',
          matiere_id: courseData.matiere_id,
          created_at: new Date().toISOString(),
        };
      }

      // Assigner à la table cours_classes
      const targetClasses = courseData.target_classe_ids && courseData.target_classe_ids.length > 0
        ? courseData.target_classe_ids
        : [courseData.classe_id || PRIMARY_CLASS_ID];

      const currentAssignments = getInitialAssignments();
      const newAssignments = targetClasses.map((clId) => ({
        id: `assign-${insertedCourse.id}-${clId}-${Date.now()}`,
        cours_id: insertedCourse.id,
        classe_id: clId,
        enseignant_id: courseData.enseignant_id || PROF_SHASA_ID,
        est_actif: true,
        annee_scolaire: '2025-2026',
        created_at: new Date().toISOString(),
      }));

      // Sauvegarde
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'e_rdc_cours_classes_assignments',
            JSON.stringify([...currentAssignments, ...newAssignments])
          );
        } catch {}
      }

      try {
        await supabase.from('cours_classes').insert(
          newAssignments.map((a) => ({
            cours_id: a.cours_id,
            classe_id: a.classe_id,
            enseignant_id: a.enseignant_id,
            est_actif: true,
          }))
        );
      } catch {}

      return insertedCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['cours_classes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
    },
  });
}
