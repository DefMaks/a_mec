import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Eleve } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import { calculateAccessCountdown, renewAccessCode } from '@/lib/access-code-utils';

const LOCAL_STUDENTS_KEY = 'e_rdc_custom_students';

export function getStoredStudents(): any[] {
  if (typeof window !== 'undefined') {
    try {
      const s = localStorage.getItem(LOCAL_STUDENTS_KEY);
      if (s) return JSON.parse(s);
    } catch {}
  }
  return [];
}

export function saveStoredStudents(list: any[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(list));
    } catch {}
  }
}

export function useStudents(classId?: string, isSuperAdmin: boolean = false, parentId?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['students', classId, isSuperAdmin, parentId, DEFAULT_SCHOOL_ID],
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

        if (parentId) {
          query = query.eq('parent_id', parentId);
        }

        const { data, error } = await query;
        if (!error && data) {
          rawData = data;
        }
      } catch (err: any) {
        console.error('Erreur chargement students:', err?.message);
      }

      // Récupérer les étudiants locaux (créés ou inscrits via l'interface)
      const localStudents = getStoredStudents();

      // Fusionner: rawData (Supabase) + localStudents
      const mergedList: any[] = [...rawData];

      localStudents.forEach((ls) => {
        if (!mergedList.some((m) => m.id === ls.id)) {
          mergedList.push(ls);
        }
      });

      // Récupérer les classes pour afficher le libellé de classe
      let classesMap: Record<string, string> = {
        '730145b3-b30f-4aff-b0ab-c7550849d5fe': '1ère Primaire',
        'classe-4eme-math': '4ème Humanités Math-Physique',
        'classe-6eme-prim': '6ème Primaire (TENAFEP)',
      };

      try {
        const { data: clsData } = await supabase.from('classes').select('id, name, vacation');
        if (clsData) {
          clsData.forEach((c: any) => {
            classesMap[c.id] = c.name || `Classe #${c.id.slice(0, 5)}`;
          });
        }
      } catch {}

      // Classes custom locales
      if (typeof window !== 'undefined') {
        try {
          const s = localStorage.getItem('e_rdc_custom_classes');
          if (s) {
            const list = JSON.parse(s);
            list.forEach((c: any) => {
              if (!classesMap[c.id]) {
                classesMap[c.id] = c.nom || c.name || 'Classe';
              }
            });
          }
        } catch {}
      }

      let finalResults = mergedList.map((s: any) => {
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
          code_acces_actif: s.code_acces_actif !== false,
          derniere_mise_a_jour_code: lastUpdated,
          date_expiration_code: expiresAt,
          forfait_actif: forfaitActif,
          parent: s.parent || {
            id: s.parent_id || null,
            nom_complet: s.parent_nom || 'Parent / Tuteur',
          },
          classes: s.classes || {
            id: s.classe_id,
            nom: classesMap[s.classe_id] || s.classe || 'Classe Assignée',
          },
        } as Eleve;
      });

      if (parentId) {
        finalResults = finalResults.filter((s) => s.parent_id === parentId || s.parent?.id === parentId);
      }

      if (classId) {
        finalResults = finalResults.filter((s) => s.classe_id === classId);
      }

      return finalResults;
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

export interface CreateStudentPayload {
  nom_complet?: string;
  pseudonyme?: string;
  matricule?: string;
  classe_id?: string;
  ecole_id?: string;
  parent_id?: string;
  parent_nom?: string;
  parent_telephone?: string;
  sexe?: 'M' | 'F' | string;
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (studentData: CreateStudentPayload) => {
      const name = studentData.nom_complet || studentData.pseudonyme || 'Élève';
      const pseudo = studentData.pseudonyme || name.split(' ')[0] + ' ' + (name.split(' ')[1] ? name.split(' ')[1][0] + '.' : '');
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
      const code = `ADS-${Math.floor(1000 + Math.random() * 9000)}`;
      const studentId = `child-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const insertPayload: any = {
        id: studentId,
        pseudonyme: pseudo,
        nom_complet: name,
        code_acces: code,
        code_acces_actif: true,
        derniere_mise_a_jour_code: now.toISOString(),
        date_expiration_code: expiresAt.toISOString(),
        forfait_actif: 'mensuel',
        matricule: studentData.matricule || `ADS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        parent_id: studentData.parent_id || 'parent-mukendi',
        parent_nom: studentData.parent_nom || 'Parent Référent',
        created_at: now.toISOString(),
      };

      if (studentData.classe_id) {
        insertPayload.classe_id = studentData.classe_id;
      }

      // Enregistrer dans localStorage
      const stored = getStoredStudents();
      saveStoredStudents([...stored, insertPayload]);

      // Tenter l'insertion Supabase
      try {
        const { data, error } = await supabase
          .from('eleves')
          .insert([
            {
              pseudonyme: pseudo,
              nom_complet: name,
              code_acces: code,
              code_acces_actif: true,
              matricule: insertPayload.matricule,
              classe_id: studentData.classe_id,
              parent_id: studentData.parent_id,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return data;
        }
      } catch {}

      return insertPayload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
  });
}
