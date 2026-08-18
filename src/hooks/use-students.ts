import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Eleve } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export function useStudents(classId?: string, isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['students', classId, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      try {
        let query = supabase
          .from('eleves')
          .select('*')
          .order('created_at', { ascending: false });

        if (classId) {
          query = query.eq('classe_id', classId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erreur récupération élèves:', error.message);
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        // Récupérer les classes pour afficher le libellé de classe
        let classesMap: Record<string, string> = {};
        try {
          const { data: clsData } = await supabase.from('classes').select('id, niveau_id, option_id, vacation');
          if (clsData) {
            clsData.forEach((c: any) => {
              classesMap[c.id] = c.vacation ? `Classe (${c.vacation})` : `Classe #${c.id.slice(0, 5)}`;
            });
          }
        } catch {}

        return data.map((s: any) => ({
          ...s,
          nom_complet: s.nom_complet || s.pseudonyme || 'Élève',
          pseudonyme: s.pseudonyme || s.nom_complet || 'Élève',
          code_acces: s.code_acces || `MEC-${s.id?.slice(0, 6)?.toUpperCase() || '123456'}`,
          parent: s.parent || {
            id: s.parent_id,
            nom_complet: s.parent_nom || 'Parent Référent',
          },
          classes: s.classes || {
            id: s.classe_id,
            nom: classesMap[s.classe_id] || s.classe || 'Classe Assignée',
          },
        })) as Eleve[];
      } catch (err: any) {
        console.error('Erreur chargement students:', err?.message);
        return [];
      }
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (studentData: {
      nom_complet?: string;
      pseudonyme?: string;
      matricule?: string;
      classe_id?: string;
      ecole_id?: string;
    }) => {
      const name = studentData.nom_complet || studentData.pseudonyme || 'Élève';
      const insertPayload: any = {
        pseudonyme: name,
        nom_complet: name,
        code_acces: `MEC-${Math.floor(100000 + Math.random() * 900000)}`,
        matricule: studentData.matricule || `ADS-${Date.now().toString().slice(-4)}`,
      };

      if (studentData.classe_id) {
        insertPayload.classe_id = studentData.classe_id;
      }

      const { data, error } = await supabase
        .from('eleves')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
