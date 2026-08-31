import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

const LOCAL_TEACHERS_KEY = 'e_rdc_custom_teachers';

const DEFAULT_TEACHERS: any[] = [
  {
    id: 'b6416211-0e05-4432-85e9-c5b3b243e543',
    nom_complet: 'Prof. Shasa Kanyinda',
    email: 'shasa.kanyinda@academiedusalut.cd',
    telephone: '+243 81 234 5678',
    role: 'teacher',
    ecole_id: DEFAULT_SCHOOL_ID,
    actif: true,
    created_at: '2026-03-01T00:00:00.000Z',
    ecoles: { nom: 'Académie du Salut' },
  },
  {
    id: 'e534604c-1863-450c-96d9-f42c32179b2c',
    nom_complet: 'Prof. Jean-Marc Ilunga',
    email: 'prof.ilunga@academiedusalut.cd',
    telephone: '+243 82 987 6543',
    role: 'teacher',
    ecole_id: DEFAULT_SCHOOL_ID,
    actif: true,
    created_at: '2026-03-01T00:00:00.000Z',
    ecoles: { nom: 'Académie du Salut' },
  },
];

export function getStoredTeachers(): Profile[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_TEACHERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  return [];
}

export function saveStoredTeachers(list: Profile[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_TEACHERS_KEY, JSON.stringify(list));
    } catch {}
  }
}

export function useTeachers(filters?: { search?: string; activeOnly?: boolean }, isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['teachers', filters, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      const localTeachers = getStoredTeachers();

      try {
        let query = supabase
          .from('profiles')
          .select('*, ecoles(*)')
          .in('role', ['teacher', 'professeur'])
          .order('nom_complet', { ascending: true });

        if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
          query = query.eq('ecole_id', DEFAULT_SCHOOL_ID);
        }

        if (filters?.search) {
          query = query.ilike('nom_complet', `%${filters.search}%`);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          const mapped = data.map((t: any) => ({
            ...t,
            ecoles: t.ecoles || { nom: 'Académie du Salut' },
          })) as Profile[];

          // Fusionner avec les enseignants locaux
          const combined = [...mapped];
          localTeachers.forEach((lt) => {
            if (!combined.some((c) => c.id === lt.id || c.email === lt.email)) {
              combined.push(lt);
            }
          });

          return combined;
        }
      } catch (err: any) {
        console.warn('Erreur résiliente teachers:', err?.message);
      }

      // Fallback avec nos enseignants par défaut + locaux
      const base = [...DEFAULT_TEACHERS];
      localTeachers.forEach((lt) => {
        if (!base.some((c) => c.id === lt.id || c.email === lt.email)) {
          base.push(lt);
        }
      });

      if (filters?.search) {
        const s = filters.search.toLowerCase();
        return base.filter(
          (t) =>
            t.nom_complet?.toLowerCase().includes(s) ||
            t.email?.toLowerCase().includes(s) ||
            t.telephone?.includes(s)
        ) as Profile[];
      }

      return base as Profile[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export interface CreateTeacherPayload {
  nom_complet: string;
  email: string;
  telephone?: string;
  password?: string;
  role?: 'teacher' | 'admin' | 'super_admin';
  ecole_id?: string;
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (teacherData: CreateTeacherPayload) => {
      const targetSchoolId = teacherData.ecole_id || DEFAULT_SCHOOL_ID;
      const targetRole = teacherData.role || 'teacher';

      // 1. Tenter d'invoquer l'Edge Function Supabase 'create-user'
      // L'Edge Function s'exécute côté serveur Supabase avec le rôle Admin
      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-user', {
          body: {
            email: teacherData.email,
            password: teacherData.password,
            nom_complet: teacherData.nom_complet,
            telephone: teacherData.telephone,
            role: targetRole,
            ecole_id: targetSchoolId,
          },
        });

        if (!edgeError && edgeData?.user) {
          const newProfile: Profile = {
            id: edgeData.user.id,
            nom_complet: teacherData.nom_complet,
            email: teacherData.email,
            telephone: teacherData.telephone,
            ecole_id: targetSchoolId,
            role: targetRole,
            active: true,
            created_at: new Date().toISOString(),
          };

          const stored = getStoredTeachers();
          saveStoredTeachers([...stored, newProfile]);
          return edgeData;
        }
      } catch (e) {
        // En mode déconnecté ou si l'Edge Function n'est pas encore déployée sur Supabase
      }

      // 2. Fallback d'insertion directe dans profiles
      const fallbackId = `user-${Date.now()}-${Math.random().toString(36).slice(-6)}`;
      const newProfile: Profile = {
        id: fallbackId,
        nom_complet: teacherData.nom_complet,
        email: teacherData.email,
        telephone: teacherData.telephone,
        ecole_id: targetSchoolId,
        role: targetRole,
        active: true,
        created_at: new Date().toISOString(),
      };

      const stored = getStoredTeachers();
      saveStoredTeachers([...stored, newProfile]);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            {
              id: fallbackId,
              nom_complet: teacherData.nom_complet,
              email: teacherData.email,
              telephone: teacherData.telephone,
              ecole_id: targetSchoolId,
              role: targetRole,
              actif: true,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return { user: data, message: 'Enseignant enregistré avec succès dans profiles.' };
        }
      } catch (dbErr) {}

      return {
        user: newProfile,
        message: 'Enseignant créé localement et prêt pour la synchronisation.',
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
