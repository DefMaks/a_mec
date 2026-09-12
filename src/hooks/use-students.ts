import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Eleve } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import { calculateAccessCountdown, renewAccessCode } from '@/lib/access-code-utils';

export function useStudents(classId?: string, isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['students', classId, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      let rawData: any[] = [];
      try {
        let query = supabase
          .from('eleves')
          .select('*')
          .order('created_at', { ascending: false });

        if (classId) {
          query = query.eq('classe_id', classId);
        }

        const { data, error } = await query;
        if (!error && data) {
          rawData = data;
        }
      } catch (err: any) {
        console.error('Erreur chargement students:', err?.message);
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

      return rawData.map((s: any) => {
        // Vérifier si un renouvellement local récent existe pour cet élève
        let localRenewal: any = null;
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`ads_student_code_${s.id}`);
          if (stored) {
            try {
              localRenewal = JSON.parse(stored);
            } catch {}
          }
        }

        const codeAcces = localRenewal?.code_acces || s.code_acces || `ADS-${s.id?.slice(0, 4)?.toUpperCase() || '7842'}`;
        const lastUpdated = localRenewal?.derniere_mise_a_jour_code || s.derniere_mise_a_jour_code || s.created_at || new Date().toISOString();
        const expiresAt = localRenewal?.date_expiration_code || s.date_expiration_code || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        const forfaitActif = localRenewal?.forfait_actif || s.forfait_actif || 'mensuel';

        return {
          ...s,
          nom_complet: s.nom_complet || s.pseudonyme || 'Élève',
          pseudonyme: s.pseudonyme || s.nom_complet || 'Élève',
          code_acces: codeAcces,
          code_acces_actif: true,
          derniere_mise_a_jour_code: lastUpdated,
          date_expiration_code: expiresAt,
          forfait_actif: forfaitActif,
          parent: s.parent || {
            id: s.parent_id || 'parent-1',
            nom_complet: s.parent_nom || 'Parent Référent',
          },
          classes: s.classes || {
            id: s.classe_id,
            nom: classesMap[s.classe_id] || s.classe || 'Classe Assignée',
          },
        } as Eleve;
      });
    },
  });
}

export function useUpdateStudentAccessCode() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      durationDays = 30,
      typeForfait = 'mensuel',
    }: {
      studentId: string;
      durationDays?: number;
      typeForfait?: 'mensuel' | 'trimestriel' | 'annuel';
    }) => {
      const renewal = renewAccessCode(durationDays);

      if (typeof window !== 'undefined') {
        localStorage.setItem(`ads_student_code_${studentId}`, JSON.stringify({
          ...renewal,
          forfait_actif: typeForfait,
        }));
      }

      try {
        await supabase
          .from('eleves')
          .update({
            code_acces: renewal.code_acces,
            code_acces_actif: true,
            derniere_mise_a_jour_code: renewal.derniere_mise_a_jour_code,
            date_expiration_code: renewal.date_expiration_code,
          })
          .eq('id', studentId);
      } catch (e) {}

      return renewal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
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
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
      const code = `ADS-${Math.floor(1000 + Math.random() * 9000)}`;

      const insertPayload: any = {
        pseudonyme: name,
        nom_complet: name,
        code_acces: code,
        code_acces_actif: true,
        derniere_mise_a_jour_code: now.toISOString(),
        date_expiration_code: expiresAt.toISOString(),
        forfait_actif: 'mensuel',
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

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
