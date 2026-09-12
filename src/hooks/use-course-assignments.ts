import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CoursClasse, Cours, Classe, Profile } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export interface LearningDomain {
  id: string;
  nom: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  courseIds: string[];
}

export const LEARNING_DOMAINS: LearningDomain[] = [
  {
    id: 'langues',
    nom: 'Langues & Communication',
    description: 'Langues nationales (Lingala/Swahili/Kikongo/Tshiluba) et Français fondamental',
    color: '#0F2C59',
    badgeBg: '#EFF6FF',
    badgeText: '#1E40AF',
    courseIds: [
      '98656796-d9d1-4de6-83d7-7302f4ad8d21',
      'ce832303-22f4-4bfe-93d3-d8b27becc142',
      'cfc2ee53-321e-4855-b528-53c460dfe25a',
      '2d121977-a258-4fe9-97f5-34ab0bbd2a07',
      '8e1257b9-174f-418e-990a-609dadbefcd2',
    ],
  },
  {
    id: 'maths',
    nom: 'Mathématiques & Sciences',
    description: 'Calcul mental, arithmétique, géométrie et initiation à la mesure',
    color: '#008080',
    badgeBg: '#F0FDFA',
    badgeText: '#0F766E',
    courseIds: [
      'd795462b-18ed-4ac4-b1d5-126796273389',
      '5681f0fa-bc21-495c-a219-b09162372829',
      '0430841f-f4cc-4e3d-977f-91b6adf37139',
    ],
  },
  {
    id: 'eveil',
    nom: 'Éveil Scientifique & Environnement',
    description: 'Observation du monde vivant, écosystèmes et hygiène corporelle & sanitaire',
    color: '#15803D',
    badgeBg: '#F0FDF4',
    badgeText: '#15803D',
    courseIds: [
      '181e884f-b0af-4861-a8df-eb793e2435cb',
      '163fa90d-d812-4760-a268-64eeaf80e5be',
    ],
  },
  {
    id: 'social',
    nom: 'Sciences Sociales & Civisme',
    description: 'Citoyenneté congolaise, valeurs morales, repères temporels et vie en communauté',
    color: '#C86B43',
    badgeBg: '#FFF7ED',
    badgeText: '#C2410C',
    courseIds: [
      '28ff3596-4a96-4b8c-8aae-4b01008e3a8f',
      'fa0eedb7-9f9e-43a4-901a-771c0c7fea54',
      '65bad74c-0c39-4a8e-9df1-1aa121da5849',
      '45ec3ccc-dca8-4a41-9536-8dc31dd80d26',
    ],
  },
  {
    id: 'arts_sports',
    nom: 'Arts & Activités Pratiques',
    description: 'Développement psychomoteur, motricité fine, chant, rythmes et travaux manuels',
    color: '#7C3AED',
    badgeBg: '#FAF5FF',
    badgeText: '#6D28D9',
    courseIds: [
      '9741388b-1d36-4232-b87b-e38c3eae88db',
      'a2b8c267-4467-4bb8-8637-7bdfbbae68b7',
      '9190d42b-33c7-44d5-b989-f856504536ad',
      'e58247ed-6ff8-403e-8bbc-f3f168003219',
    ],
  },
];

const LOCAL_STORAGE_KEY = 'e_rdc_cours_classes_assignments';
const LOCAL_CLASSES_KEY = 'e_rdc_custom_classes';

export function getInitialAssignments(): CoursClasse[] {
  return [];
}

export function saveAssignmentsLocally(assignments: CoursClasse[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assignments));
    } catch {}
  }
}

/**
 * Hook pour récupérer et synchroniser les assignations Cours <-> Classes
 */
export function useCourseAssignments(classeId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['cours_classes', classeId],
    queryFn: async (): Promise<CoursClasse[]> => {
      let assignments: CoursClasse[] = getInitialAssignments();

      try {
        let query = supabase.from('cours_classes').select('*');
        if (classeId) {
          query = query.eq('classe_id', classeId);
        }

        const { data, error } = await query;
        if (!error && data) {
          assignments = data as CoursClasse[];
          saveAssignmentsLocally(assignments);
        }
      } catch (e) {
        // Ignorer l'erreur
      }

      if (classeId) {
        return assignments.filter((a) => a.classe_id === classeId);
      }

      return assignments;
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Hook pour assigner un cours unique à une classe
 */
export function useAssignCourseToClass() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      cours_id,
      classe_id,
      enseignant_id = '',
      annee_scolaire = '2025-2026',
    }: {
      cours_id: string;
      classe_id: string;
      enseignant_id?: string;
      annee_scolaire?: string;
    }) => {
      const current = getInitialAssignments();
      const existingIndex = current.findIndex((a) => a.cours_id === cours_id && a.classe_id === classe_id);

      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          enseignant_id,
          est_actif: true,
        };
        saveAssignmentsLocally(updated);
      } else {
        const newAssignment: CoursClasse = {
          id: `assign-${cours_id}-${classe_id}-${Date.now()}`,
          cours_id,
          classe_id,
          enseignant_id,
          est_actif: true,
          annee_scolaire,
          created_at: new Date().toISOString(),
        };
        saveAssignmentsLocally([...current, newAssignment]);
      }

      try {
        await supabase.from('cours_classes').upsert(
          {
            cours_id,
            classe_id,
            enseignant_id,
            est_actif: true,
            annee_scolaire,
          },
          { onConflict: 'cours_id,classe_id' }
        );
      } catch {}

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cours_classes'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
}

/**
 * Hook pour dissocier un cours d'une classe
 */
export function useUnassignCourseFromClass() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ cours_id, classe_id }: { cours_id: string; classe_id: string }) => {
      const current = getInitialAssignments();
      const filtered = current.filter(
        (a) => !(a.cours_id === cours_id && a.classe_id === classe_id)
      );
      saveAssignmentsLocally(filtered);

      try {
        await supabase
          .from('cours_classes')
          .delete()
          .match({ cours_id, classe_id });
      } catch {}

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cours_classes'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
}

/**
 * Hook pour assigner en lot une liste de cours à une classe (par Domaine ou Programme complet)
 */
export function useBulkAssignCourses() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      cours_ids,
      classe_id,
      enseignant_id = '',
      annee_scolaire = '2025-2026',
    }: {
      cours_ids: string[];
      classe_id: string;
      enseignant_id?: string;
      annee_scolaire?: string;
    }) => {
      const current = getInitialAssignments();
      const updatedList = [...current];

      const newRows: any[] = [];

      cours_ids.forEach((cId) => {
        const existingIdx = updatedList.findIndex((a) => a.cours_id === cId && a.classe_id === classe_id);
        if (existingIdx >= 0) {
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            enseignant_id,
            est_actif: true,
          };
        } else {
          updatedList.push({
            id: `assign-${cId}-${classe_id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            cours_id: cId,
            classe_id,
            enseignant_id,
            est_actif: true,
            annee_scolaire,
            created_at: new Date().toISOString(),
          });
        }

        newRows.push({
          cours_id: cId,
          classe_id,
          enseignant_id,
          est_actif: true,
          annee_scolaire,
        });
      });

      saveAssignmentsLocally(updatedList);

      try {
        await supabase.from('cours_classes').upsert(newRows, { onConflict: 'cours_id,classe_id' });
      } catch {}

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cours_classes'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
}

/**
 * Hook pour désassigner un lot de cours d'une classe
 */
export function useBulkUnassignCourses() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      cours_ids,
      classe_id,
    }: {
      cours_ids: string[];
      classe_id: string;
    }) => {
      const current = getInitialAssignments();
      const filtered = current.filter(
        (a) => !(cours_ids.includes(a.cours_id) && a.classe_id === classe_id)
      );
      saveAssignmentsLocally(filtered);

      try {
        await supabase
          .from('cours_classes')
          .delete()
          .eq('classe_id', classe_id)
          .in('cours_id', cours_ids);
      } catch {}

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cours_classes'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
}

/**
 * Hook pour gérer les classes (lecture et création de classes par l'Admin)
 */
export function useAllClasses() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['classes_list'],
    queryFn: async (): Promise<Classe[]> => {
      let customClasses: Classe[] = [];
      if (typeof window !== 'undefined') {
        try {
          const s = localStorage.getItem(LOCAL_CLASSES_KEY);
          if (s) customClasses = JSON.parse(s);
        } catch {}
      }

      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*, niveaux(*), profiles(*)');

        if (!error && data) {
          const mapped = data.map((c: any) => ({
            ...c,
            nom: c.name || c.nom || 'Classe',
          })) as Classe[];

          const merged = [...mapped];
          customClasses.forEach((cc) => {
            if (!merged.some((m) => m.id === cc.id)) {
              merged.push(cc);
            }
          });
          return merged;
        }
      } catch {}

      return customClasses;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer une nouvelle classe par l'Admin
 */
export function useCreateAdminClass() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      nom,
      niveau_id = '53b37e2f-110b-4551-ac31-e018305f74d5',
      titulaire_id = '',
      ecole_id = DEFAULT_SCHOOL_ID,
    }: {
      nom: string;
      niveau_id?: string;
      titulaire_id?: string;
      ecole_id?: string;
    }) => {
      const newClass: Classe = {
        id: `class-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nom,
        niveau_id,
        titulaire_id,
        ecole_id,
        created_at: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(LOCAL_CLASSES_KEY);
          const list: Classe[] = stored ? JSON.parse(stored) : [];
          list.push(newClass);
          localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(list));
        } catch {}
      }

      try {
        await supabase.from('classes').insert({
          id: newClass.id,
          name: nom,
          niveau_id,
          titulaire_id,
          ecole_id,
        });
      } catch {}

      return newClass;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes_list'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}
