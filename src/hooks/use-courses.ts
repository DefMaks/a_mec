import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import { getInitialAssignments } from './use-course-assignments';
import { STANDARD_PROMOTIONS, BASE_TEACHERS } from '@/lib/constants/school-structure';
import { MESURE_PRIMARY_COURSES } from '@/lib/simulation/mesure-courses-simulation';

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

export const LOCAL_COURSES_KEY = 'e_rdc_custom_courses_v1';
export const LOCAL_CHAPTERS_KEY = 'e_rdc_custom_chapters_v1';

export function getStoredCourses(): CourseItem[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_COURSES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return [];
}

export function saveStoredCourses(courses: CourseItem[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(courses));
    } catch {}
  }
}

export function useCourses(classeId?: string, isSuperAdmin: boolean = false) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['courses', classeId, isSuperAdmin],
    queryFn: async (): Promise<CourseItem[]> => {
      try {
        let coursData: any[] = [];
        try {
          const { data, error } = await supabase
            .from('cours')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            coursData = data;
          }
        } catch (err: any) {
          console.warn('Erreur chargement cours Supabase:', err?.message);
        }

        // Récupérer les cours stockés localement ou la base de simulation
        const localCourses = getStoredCourses();
        const baseSimulated = localCourses.length > 0 ? localCourses : MESURE_PRIMARY_COURSES;

        // Fusion sans doublon par ID
        const coursesMap = new Map<string, any>();
        baseSimulated.forEach((c) => coursesMap.set(c.id, c));
        coursData.forEach((c) => {
          const existing = coursesMap.get(c.id);
          coursesMap.set(c.id, { ...existing, ...c });
        });

        const mergedCourses = Array.from(coursesMap.values());

        if (mergedCourses.length === 0) {
          return [];
        }

        let matieresList: any[] = [];
        let chapitresList: any[] = [];

        try {
          const { data: mData } = await supabase.from('matiere').select('*');
          if (mData) matieresList = mData;
        } catch {}

        try {
          const { data: chData } = await supabase.from('chapitres').select('*');
          if (chData) chapitresList = chData;
        } catch {}

        // Récupérer les chapitres locaux
        if (typeof window !== 'undefined') {
          try {
            const rawCh = localStorage.getItem(LOCAL_CHAPTERS_KEY);
            if (rawCh) {
              const localCh = JSON.parse(rawCh);
              localCh.forEach((lch: any) => {
                if (!chapitresList.some((c) => c.id === lch.id)) {
                  chapitresList.push(lch);
                }
              });
            }
          } catch {}
        }

        const assignments = getInitialAssignments();

        const allMapped = mergedCourses.map((item: any) => {
          const matchedMatiere = matieresList.find((m) => m.id === item.matiere_id);
          
          // Chapitres associés
          let matchedChapitres = chapitresList.filter((ch) => ch.cours_id === item.id);
          if (matchedChapitres.length === 0 && Array.isArray(item.chapitres)) {
            matchedChapitres = item.chapitres;
          }

          const chapitres = matchedChapitres.map((ch: any, idx: number) => ({
            id: ch.id || `ch-${idx + 1}`,
            cours_id: item.id,
            titre: ch.titre || `Chapitre ${idx + 1}`,
            position: ch.position || ch.ordre || idx + 1,
            duree_minutes: ch.duree_minutes || 25,
            contenu: ch.contenu || ch.contenu_html || '',
            audio_url: ch.audio_url || null,
            pdf_url: ch.pdf_url || null,
          }));

          const matiereNom =
            matchedMatiere?.nom || item.matiere_nom || item.matiere || 'Mathématiques';

          // Résolution dynamique de la classe et de l'enseignant
          const assignedClasse = assignments.find((a) => a.cours_id === item.id);
          const targetClassId = assignedClasse?.classe_id || item.classe_id;
          const promo = STANDARD_PROMOTIONS.find((p) => p.id === targetClassId);
          const targetClassName = promo?.nom || item.classe || (assignedClasse ? 'Classe Assignée' : 'Toutes les Classes');

          const targetTeacherId = assignedClasse?.enseignant_id || item.enseignant_id || promo?.titulaire_id;
          const matchedTeacher = BASE_TEACHERS.find((t) => t.id === targetTeacherId);
          const targetTeacherName = matchedTeacher?.nom_complet || item.enseignant_nom || 'Professeur Titulaire';

          return {
            id: item.id,
            titre: item.titre || 'Cours Pédagogique',
            description: item.description || '',
            matiere_id: item.matiere_id,
            matiere_nom: matiereNom,
            matiere: matiereNom,
            classe: targetClassName,
            classe_id: targetClassId,
            enseignant_id: targetTeacherId,
            enseignant_nom: targetTeacherName,
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

      // Persistance dans le cache local des cours
      try {
        const stored = getStoredCourses();
        saveStoredCourses([
          insertedCourse,
          ...stored.filter((c) => c.id !== insertedCourse.id),
        ]);
      } catch {}

      // Assigner à la table cours_classes
      const targetClasses = courseData.target_classe_ids && courseData.target_classe_ids.length > 0
        ? courseData.target_classe_ids
        : [courseData.classe_id || null];

      const currentAssignments = getInitialAssignments();
      const newAssignments = targetClasses.map((clId) => ({
        id: `assign-${insertedCourse.id}-${clId}-${Date.now()}`,
        cours_id: insertedCourse.id,
        classe_id: clId,
        enseignant_id: courseData.enseignant_id || undefined,
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
