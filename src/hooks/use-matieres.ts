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

export function useMatieres() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['matieres'],
    queryFn: async (): Promise<MatiereItem[]> => {
      try {
        const { data: matieresData, error } = await supabase
          .from('matieres')
          .select('*')
          .order('nom', { ascending: true });

        if (error) {
          console.warn('Erreur récupération matieres:', error.message);
        }

        let coursList: any[] = [];
        try {
          const { data: cData } = await supabase.from('cours').select('id, matiere_id');
          if (cData) coursList = cData;
        } catch {}

        const rawList = (matieresData && matieresData.length > 0)
          ? matieresData
          : [
              { id: 'mat-math', nom: 'Mathématiques', code: 'MATH', description: 'Algèbre, Géométrie, Analyse & Trigonométrie STEM' },
              { id: 'mat-phys', nom: 'Physique', code: 'PHYS', description: 'Mécanique, Électricité, Optique & Ondes' },
              { id: 'mat-chim', nom: 'Chimie', code: 'CHIM', description: 'Chimie Générale, Organique & Minérale' },
              { id: 'mat-fr', nom: 'Français & Littérature', code: 'FRAN', description: 'Grammaire, Dissertation & Littérature Africaine' },
              { id: 'mat-svt', nom: 'Biologie / SVT', code: 'SVT', description: 'Génétique, Écologie & Sciences de la Vie' },
              { id: 'mat-info', nom: 'Informatique & Algorithmique', code: 'INFO', description: 'Programmation, TICE & Culture Numérique' },
              { id: 'mat-hist', nom: 'Histoire & Géographie', code: 'HIST', description: 'Histoire de la RDC et Géographie Africaine' },
              { id: 'mat-ang', nom: 'Anglais', code: 'ANGL', description: 'Grammar, Reading Comprehension & Vocabulary' },
            ];

        return rawList.map((m: any) => ({
          id: m.id,
          nom: m.nom,
          code: m.code || m.nom.slice(0, 4).toUpperCase(),
          description: m.description || '',
          created_at: m.created_at || new Date().toISOString(),
          cours_count: coursList.filter((c) => c.matiere_id === m.id).length,
        }));
      } catch (err: any) {
        console.error('Erreur chargement matieres:', err?.message);
        return [];
      }
    },
  });
}

export function useCreateMatiere() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (payload: { nom: string; code?: string; description?: string }) => {
      const codeGen = payload.code?.trim() || payload.nom.slice(0, 4).toUpperCase();
      const insertData: any = {
        nom: payload.nom.trim(),
        code: codeGen,
      };
      if (payload.description) insertData.description = payload.description;

      const { data, error } = await supabase
        .from('matieres')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.warn('Erreur insertion matiere:', error.message);
        // Fallback optimiste
        return {
          id: `mat-${Date.now()}`,
          nom: payload.nom,
          code: codeGen,
          description: payload.description,
        };
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matieres'] });
      queryClient.invalidateQueries({ queryKey: ['teacher_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteMatiere() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('matieres').delete().eq('id', id);
      if (error) {
        console.warn('Erreur suppression matiere:', error.message);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matieres'] });
      queryClient.invalidateQueries({ queryKey: ['teacher_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
