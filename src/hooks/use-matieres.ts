import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface MatiereItem {
  id: string;
  nom: string;
  code: string;
  description?: string | null;
  created_at?: string;
  cours_count?: number;
}

const LOCAL_MATIERES_KEY = 'e_rdc_custom_matieres';

const BASE_MATIERES: MatiereItem[] = [
  { id: 'mat-math', nom: 'Mathématiques', code: 'MATH', description: 'Algèbre, Géométrie, Calcul & Mesures' },
  { id: 'mat-lnat', nom: 'Langues Nationales', code: 'LNAT', description: 'Lingala, Swahili, Kikongo, Tshiluba (Lecture & Écriture)' },
  { id: 'mat-fr', nom: 'Français & Communication', code: 'FRAN', description: 'Vocabulaire, Expression Orale & Grammaire' },
  { id: 'mat-env', nom: 'Étude du Milieu & Éveil', code: 'EVEI', description: 'Sciences d\'Observation, Hygiène & Écosystèmes' },
  { id: 'mat-soc', nom: 'Sciences Sociales & Civisme', code: 'SOCI', description: 'Éducation Civique, Morale, Famille & Histoire' },
  { id: 'mat-arts', nom: 'Arts & Activités Pratiques', code: 'ARTS', description: 'Dessin, Chant, Musique & Travaux Manuels' },
  { id: 'mat-phys', nom: 'Physique & Technologie', code: 'PHYS', description: 'Mécanique, Énergie & Ondes' },
  { id: 'mat-chim', nom: 'Chimie', code: 'CHIM', description: 'Chimie Générale & Expérimentale' },
  { id: 'mat-svt', nom: 'Biologie / SVT', code: 'SVT', description: 'Sciences de la Vie et de la Terre' },
  { id: 'mat-info', nom: 'Informatique & Numérique', code: 'INFO', description: 'Initiation au Numérique & Algorithmique' },
  { id: 'mat-ang', nom: 'Anglais', code: 'ANGL', description: 'English Grammar, Reading & Vocabulary' },
];

export function getStoredMatieres(): MatiereItem[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_MATIERES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  return [];
}

export function saveStoredMatieres(list: MatiereItem[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_MATIERES_KEY, JSON.stringify(list));
    } catch {}
  }
}

export function useMatieres() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['matieres'],
    queryFn: async (): Promise<MatiereItem[]> => {
      const localCustom = getStoredMatieres();
      let remoteData: any[] = [];

      try {
        // Table officielle Supabase: 'matiere'
        const { data: mData, error: mError } = await supabase
          .from('matiere')
          .select('*')
          .order('nom', { ascending: true });

        if (!mError && mData && mData.length > 0) {
          remoteData = mData;
        }
      } catch (err: any) {
        // Fallback silencieux en local
      }

      // Nombre de cours liés
      let coursList: any[] = [];
      try {
        const { data: cData } = await supabase.from('cours').select('id, matiere_id, matiere');
        if (cData) coursList = cData;
      } catch {}

      // Fusionner la base + remote + local
      const mergedList: MatiereItem[] = [];

      // 1. Matières distantes Supabase (table public.matiere)
      remoteData.forEach((m: any) => {
        mergedList.push({
          id: m.id,
          nom: m.nom,
          code: m.code || m.nom.slice(0, 4).toUpperCase(),
          description: m.description || '',
          created_at: m.created_at || new Date().toISOString(),
          cours_count: coursList.filter(
            (c) => c.matiere_id === m.id || c.matiere === m.nom
          ).length,
        });
      });

      // 2. Matières par défaut du programme national
      BASE_MATIERES.forEach((bm) => {
        if (!mergedList.some((m) => m.id === bm.id || m.nom.toLowerCase() === bm.nom.toLowerCase())) {
          mergedList.push({
            ...bm,
            created_at: new Date().toISOString(),
            cours_count: coursList.filter((c) => c.matiere_id === bm.id || c.matiere === bm.nom).length,
          });
        }
      });

      // 3. Matières créées localement par l'utilisateur
      localCustom.forEach((lm) => {
        if (!mergedList.some((m) => m.id === lm.id || m.nom.toLowerCase() === lm.nom.toLowerCase())) {
          mergedList.push({
            ...lm,
            cours_count: coursList.filter((c) => c.matiere_id === lm.id || c.matiere === lm.nom).length,
          });
        }
      });

      return mergedList;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateMatiere() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (payload: { nom: string; code?: string; description?: string }) => {
      const codeGen = payload.code?.trim() || payload.nom.slice(0, 4).toUpperCase();
      const newMatiere: MatiereItem = {
        id: `mat-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
        nom: payload.nom.trim(),
        code: codeGen,
        description: payload.description || '',
        created_at: new Date().toISOString(),
        cours_count: 0,
      };

      // 1. Sauvegarde locale immédiate pour réactivité UX instantanée
      const stored = getStoredMatieres();
      saveStoredMatieres([...stored, newMatiere]);

      // 2. Insertion directe dans la table Supabase 'matiere'
      const insertData = {
        id: newMatiere.id,
        nom: newMatiere.nom,
        code: newMatiere.code,
        description: newMatiere.description,
      };

      try {
        const { error } = await supabase.from('matiere').insert([insertData]);
        if (error) {
          console.warn('Avertissement insertion matiere:', error.message);
        }
      } catch (dbErr) {
        // Sauvegardé en local avec succès
      }

      return newMatiere;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matieres'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteMatiere() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Suppression locale
      const stored = getStoredMatieres();
      saveStoredMatieres(stored.filter((m) => m.id !== id));

      // 2. Suppression distante dans la table 'matiere'
      try {
        await supabase.from('matiere').delete().eq('id', id);
      } catch {}

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matieres'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
