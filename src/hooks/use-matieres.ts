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
      let remoteData: any[] = [];

      try {
        // Table officielle Supabase: 'matiere'
        const { data: mData, error: mError } = await supabase
          .from('matiere')
          .select('*')
          .order('nom', { ascending: true });

        if (!mError && mData) {
          remoteData = mData;
        }
      } catch (err: any) {
        // Ignorer l'erreur
      }

      // Nombre de cours liés
      let coursList: any[] = [];
      try {
        const { data: cData } = await supabase.from('cours').select('id, matiere_id, matiere');
        if (cData) coursList = cData;
      } catch {}

      const mergedList: MatiereItem[] = [];

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

      const insertData = {
        id: newMatiere.id,
        nom: newMatiere.nom,
        code: newMatiere.code,
        description: newMatiere.description,
      };

      const { error } = await supabase.from('matiere').insert([insertData]);
      if (error) {
        throw new Error(error.message);
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
      await supabase.from('matiere').delete().eq('id', id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matieres'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
