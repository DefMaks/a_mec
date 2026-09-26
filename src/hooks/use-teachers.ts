import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile, UserRole } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import {
  BASE_TEACHERS,
  STANDARD_PROMOTIONS,
  getStoredTeacherClassesMap,
  saveStoredTeacherClassesMap,
  getStoredClassTitulaireMap,
  saveStoredClassTitulaireMap,
  LOCAL_TEACHERS_KEY,
  LOCAL_CLASSES_KEY,
  LOCAL_TEACHER_CLASSES_KEY,
  LOCAL_CLASS_TITULAIRE_MAP,
  AssignedClassInfo,
} from '@/lib/constants/school-structure';

export type { AssignedClassInfo };

export interface TeacherItem extends Profile {
  active: boolean;
  actif: boolean;
  assigned_class_ids: string[];
  titulaire_class_ids: string[];
  assigned_classes: AssignedClassInfo[];
}

const DEFAULT_TEACHERS: TeacherItem[] = BASE_TEACHERS as unknown as TeacherItem[];

const REMOVED_DEFAULT_TEACHER_IDS = [
  'e534604c-1863-450c-96d9-f42c32179b2c', // Jean-Marc Ilunga
  'f645715d-2974-561d-a7e0-f53d4328ac54', // Marie-Claire Tshisekedi
  'c2d3e4f5-teacher-mwamba-uuid',         // Christian Mwamba
  'd4e5f6a7-admin-direction-uuid',        // direction@academiedusalut.cd (Béatrice Kalonji mock)
  'a1b2c3d4-super-admin-defmaks-uuid',    // Super Administrateur ADS mock
];

export function getStoredTeachers(): any[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_TEACHERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.filter((t: any) => !REMOVED_DEFAULT_TEACHER_IDS.includes(t.id));
      }
    } catch {}
  }
  return [];
}

export function resetTeachersToDefault() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_TEACHERS_KEY);
      localStorage.removeItem(LOCAL_TEACHER_CLASSES_KEY);
      localStorage.removeItem(LOCAL_CLASS_TITULAIRE_MAP);
    } catch {}
  }
}

export function saveStoredTeachers(list: any[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_TEACHERS_KEY, JSON.stringify(list));
    } catch {}
  }
}

export function getTeacherClassesMap(): Record<string, { classIds: string[]; titulaireClassIds: string[] }> {
  return getStoredTeacherClassesMap();
}

export function saveTeacherClassesMap(map: Record<string, { classIds: string[]; titulaireClassIds: string[] }>) {
  saveStoredTeacherClassesMap(map);
}

export function useTeachers(
  filters?: { search?: string; activeOnly?: boolean; role?: string },
  isSuperAdmin: boolean = false
) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['teachers', filters, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async (): Promise<TeacherItem[]> => {
      const localTeachers = getStoredTeachers();
      const teacherClassMap = getStoredTeacherClassesMap();
      const titulaireMap = getStoredClassTitulaireMap();

      // 1. Récupérer toutes les classes connues (Standard + Supabase + Custom)
      const mergedClassesMap = new Map<string, { id: string; nom: string; titulaire_id?: string | null }>();

      STANDARD_PROMOTIONS.forEach((sc) => {
        mergedClassesMap.set(sc.id, {
          id: sc.id,
          nom: sc.nom || 'Promotion',
          titulaire_id: sc.titulaire_id || null,
        });
      });

      try {
        const { data: clsData } = await supabase.from('classes').select('id, name, titulaire_id');
        if (clsData) {
          clsData.forEach((c: any) => {
            const existing = mergedClassesMap.get(c.id);
            mergedClassesMap.set(c.id, {
              ...(existing || {}),
              id: c.id,
              nom: c.name || existing?.nom || `Classe #${c.id.slice(0, 5)}`,
              titulaire_id: c.titulaire_id || existing?.titulaire_id || null,
            });
          });
        }
      } catch {}

      // Récupérer aussi les classes custom locales
      if (typeof window !== 'undefined') {
        try {
          const s = localStorage.getItem(LOCAL_CLASSES_KEY);
          if (s) {
            const custom = JSON.parse(s);
            custom.forEach((cc: any) => {
              const existing = mergedClassesMap.get(cc.id);
              mergedClassesMap.set(cc.id, {
                ...(existing || {}),
                id: cc.id,
                nom: cc.nom || cc.name || existing?.nom || 'Classe',
                titulaire_id: cc.titulaire_id || existing?.titulaire_id || null,
              });
            });
          }
        } catch {}
      }

      const allClassesList = Array.from(mergedClassesMap.values());

      // 2. Récupérer les enseignants synchronisés multi-appareils (Server Sync API + Supabase table 'teacher')
      let syncTeachers: any[] = [];
      try {
        const resSync = await fetch('/api/sync?type=teachers', { cache: 'no-store' });
        const jsonSync = await resSync.json();
        if (jsonSync.success && Array.isArray(jsonSync.data)) {
          syncTeachers = jsonSync.data.filter((t: any) => !REMOVED_DEFAULT_TEACHER_IDS.includes(t.id));
        }
      } catch {}

      let dbTeachersList: any[] = [];
      try {
        const { data: tData, error: tErr } = await supabase
          .from('teacher')
          .select('*')
          .order('created_at', { ascending: false });

        if (!tErr && tData) {
          tData.forEach((tRow: any) => {
            const targetId = tRow.profile_id || tRow.id;
            if (REMOVED_DEFAULT_TEACHER_IDS.includes(targetId)) return;

            let parsedMeta: any = null;
            if (tRow.specialite && tRow.specialite.startsWith('{')) {
              try {
                parsedMeta = JSON.parse(tRow.specialite);
              } catch {}
            }
            if (parsedMeta) {
              dbTeachersList.push({
                id: targetId,
                nom_complet: parsedMeta.nom_complet,
                email: parsedMeta.email,
                telephone: parsedMeta.telephone,
                role: parsedMeta.role || 'teacher',
                ecole_id: parsedMeta.ecole_id || DEFAULT_SCHOOL_ID,
                specialite: parsedMeta.specialite,
                assigned_class_ids: parsedMeta.assigned_class_ids || [],
                titulaire_class_ids: parsedMeta.titulaire_class_ids || [],
                active: true,
                actif: true,
                created_at: tRow.created_at,
              });
            } else if (tRow.profile_id) {
              // Profil de base
              dbTeachersList.push({
                id: tRow.profile_id,
                nom_complet: tRow.specialite ? `Enseignant (${tRow.specialite})` : 'Enseignant',
                email: `prof.${tRow.profile_id.slice(0, 8)}@academiedusalut.cd`,
                telephone: '+243 81 000 0000',
                role: 'teacher',
                ecole_id: DEFAULT_SCHOOL_ID,
                specialite: tRow.specialite || 'Enseignement Primaire',
                assigned_class_ids: [],
                titulaire_class_ids: [],
                active: true,
                actif: true,
                created_at: tRow.created_at,
              });
            }
          });
        }
      } catch (err: any) {
        console.warn('Erreur résiliente lecture Supabase teacher table:', err?.message);
      }

      // 3. Récupérer les profils depuis Supabase profiles si accessible
      let baseProfiles: any[] = [];
      try {
        let query = supabase
          .from('profiles')
          .select('id, nom_complet, role, ecole_id, created_at, ecoles(id, nom)')
          .in('role', ['teacher', 'professeur', 'admin', 'super_admin'])
          .order('nom_complet', { ascending: true });

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          baseProfiles = data;
        }
      } catch (err: any) {
        console.warn('Erreur résiliente teachers query:', err?.message);
      }

      // 4. Fusionner baseProfiles + dbTeachersList + syncTeachers + DEFAULT_TEACHERS + localTeachers
      const mergedMap = new Map<string, any>();

      // Insérer les enseignants par défaut (Prof. Shasa Kanyinda)
      DEFAULT_TEACHERS.forEach((t) => {
        mergedMap.set(t.id, { ...t });
      });

      // Insérer les profils authentiques de Supabase profiles
      baseProfiles.forEach((p) => {
        const existing = mergedMap.get(p.id) || {};
        mergedMap.set(p.id, {
          ...existing,
          ...p,
          ecoles: p.ecoles || existing.ecoles || { nom: 'Académie du Salut' },
        });
      });

      // Insérer les enseignants de la table 'teacher' de Supabase
      dbTeachersList.forEach((dt) => {
        const existing = mergedMap.get(dt.id) || {};
        mergedMap.set(dt.id, {
          ...existing,
          ...dt,
        });
      });

      // Insérer les enseignants synchronisés multi-appareils (Server Sync API)
      syncTeachers.forEach((st) => {
        const existing = mergedMap.get(st.id) || {};
        mergedMap.set(st.id, {
          ...existing,
          ...st,
        });
      });

      // Insérer ou écraser avec les modifications créées/sauvegardées localement
      localTeachers.forEach((lt) => {
        const existing = mergedMap.get(lt.id) || {};
        mergedMap.set(lt.id, {
          ...existing,
          ...lt,
        });
      });

      // 4. Enrichir chaque profil avec le statut actif et ses affectations de classes
      const enrichedList: TeacherItem[] = Array.from(mergedMap.values()).map((prof) => {
        // Vérifier override statut actif local
        let isActive = prof.active !== false && prof.actif !== false;
        if (typeof window !== 'undefined') {
          const override = localStorage.getItem(`e_rdc_teacher_active_${prof.id}`);
          if (override !== null) {
            isActive = override === 'true';
          }
        }

        const mappedAssignments = teacherClassMap[prof.id];
        let allAssignedIds: string[] = [];
        let allTitulaireIds: string[] = [];

        if (mappedAssignments) {
          allAssignedIds = [...mappedAssignments.classIds];
          allTitulaireIds = [...mappedAssignments.titulaireClassIds];
        } else {
          allAssignedIds = [...(prof.assigned_class_ids || [])];
          allTitulaireIds = [...(prof.titulaire_class_ids || [])];
        }

        // Synchroniser avec titulaireMap
        Object.entries(titulaireMap).forEach(([classId, teacherId]) => {
          if (teacherId === prof.id) {
            if (!allAssignedIds.includes(classId)) allAssignedIds.push(classId);
            if (!allTitulaireIds.includes(classId)) allTitulaireIds.push(classId);
          } else if (teacherId) {
            allTitulaireIds = allTitulaireIds.filter((id) => id !== classId);
          }
        });

        const assigned_classes: AssignedClassInfo[] = allAssignedIds
          .map((cId) => {
            const cls = allClassesList.find((c) => c.id === cId);
            return {
              id: cId,
              nom: cls ? cls.nom : `Promotion #${cId.slice(0, 5)}`,
              is_titulaire: allTitulaireIds.includes(cId),
            };
          })
          .filter(Boolean);

        return {
          id: prof.id,
          nom_complet: prof.nom_complet || 'Enseignant',
          email: prof.email || `${prof.nom_complet.toLowerCase().replace(/[^a-z0-9]/g, '.')}@academiedusalut.cd`,
          telephone: prof.telephone || '+243 81 000 0000',
          role: (prof.role === 'professeur' ? 'teacher' : prof.role) as UserRole,
          ecole_id: prof.ecole_id || DEFAULT_SCHOOL_ID,
          active: isActive,
          actif: isActive,
          created_at: prof.created_at || new Date().toISOString(),
          ecoles: prof.ecoles || { id: DEFAULT_SCHOOL_ID, nom: 'Académie du Salut', created_at: '' },
          assigned_class_ids: allAssignedIds,
          titulaire_class_ids: allTitulaireIds,
          assigned_classes,
        };
      });

      // 5. Filtrage
      let results = enrichedList;

      // Règle de visibilité : Seul le super_admin peut voir les super_admin. L'admin voit les admins et professeurs.
      if (!isSuperAdmin) {
        results = results.filter((t) => t.role !== 'super_admin');
      }

      if (filters?.role) {
        results = results.filter((t) => t.role === filters.role);
      }

      if (filters?.activeOnly) {
        results = results.filter((t) => t.active);
      }

      if (filters?.search) {
        const s = filters.search.toLowerCase();
        results = results.filter(
          (t) =>
            t.nom_complet.toLowerCase().includes(s) ||
            t.email?.toLowerCase().includes(s) ||
            t.telephone?.includes(s) ||
            t.assigned_classes.some((c) => c.nom.toLowerCase().includes(s))
        );
      }

      return results;
    },
    staleTime: 1000 * 5, // 5 secondes pour une réactivité multi-appareils instantanée
    refetchOnWindowFocus: true,
  });
}

export interface CreateTeacherPayload {
  nom_complet: string;
  email: string;
  telephone?: string;
  password?: string;
  role?: 'teacher' | 'admin' | 'super_admin';
  ecole_id?: string;
  specialite?: string;
  assigned_class_ids?: string[];
  titulaire_class_ids?: string[];
  affectations?: {
    classe_id: string;
    role_professeur?: 'titulaire' | 'enseignant' | 'co-enseignant';
  }[];
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (teacherData: CreateTeacherPayload) => {
      const targetSchoolId = teacherData.ecole_id || DEFAULT_SCHOOL_ID;
      const targetRole = teacherData.role || 'teacher';
      const assignedClassIds = teacherData.assigned_class_ids || [];
      const titulaireClassIds = teacherData.titulaire_class_ids || [];

      // Préparer les affectations structurées recommandées
      const titulaireSet = new Set(titulaireClassIds);
      const affectations = teacherData.affectations || assignedClassIds.map((cid) => ({
        classe_id: cid,
        role_professeur: (titulaireSet.has(cid) ? 'titulaire' : 'enseignant') as 'titulaire' | 'enseignant',
      }));

      // 1. Invoquer l'Edge Function Supabase 'create-user'
      // Endpoint: https://fkuyjdfmpdzpaycfopmd.supabase.co/functions/v1/create-user
      let createdId = `user-${Date.now()}-${Math.random().toString(36).slice(-6)}`;
      let edgeSuccess = false;
      let finalPassword = teacherData.password || 'Temp123456!';

      try {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-user', {
          body: {
            email: teacherData.email,
            phone: teacherData.telephone,
            telephone: teacherData.telephone,
            password: teacherData.password || 'Temp123456!',
            nom_complet: teacherData.nom_complet,
            role: targetRole,
            ecole_id: targetSchoolId,
            specialite: teacherData.specialite || null,
            profile_status: true,
            email_confirm: true,
            phone_confirm: true,
            affectations,
            assigned_class_ids: assignedClassIds,
            titulaire_class_ids: titulaireClassIds,
          },
        });

        if (edgeError) {
          console.warn('Appel Edge Function create-user:', edgeError.message);
        } else if (edgeData?.user_id || edgeData?.user?.id) {
          createdId = edgeData.user_id || edgeData.user.id;
          if (edgeData.temporary_password) {
            finalPassword = edgeData.temporary_password;
          }
          edgeSuccess = true;
        }
      } catch (err: any) {
        console.warn('Erreur résiliente Edge Function create-user:', err?.message);
      }

      // 2. Si l'Edge function n'est pas encore déployée ou a échoué, tenter insertion locale de secours
      if (!edgeSuccess) {
        try {
          await supabase
            .from('profiles')
            .insert([
              {
                id: createdId,
                nom_complet: teacherData.nom_complet,
                role: targetRole,
                ecole_id: targetSchoolId,
              },
            ]);
        } catch {}
      }

      // 3. Sauvegarder dans le stockage local et dans l'API de synchronisation partagée multi-appareils
      const newTeacher: any = {
        id: createdId,
        nom_complet: teacherData.nom_complet,
        email: teacherData.email,
        telephone: teacherData.telephone || '+243 81 000 0000',
        role: targetRole,
        ecole_id: targetSchoolId,
        specialite: teacherData.specialite || 'Enseignement Primaire',
        active: true,
        actif: true,
        password: finalPassword,
        created_at: new Date().toISOString(),
        assigned_class_ids: assignedClassIds,
        titulaire_class_ids: titulaireClassIds,
      };

      // Mettre à jour Supabase table 'teacher' pour synchronisation cross-device pérenne
      try {
        const metaPayload = JSON.stringify({
          nom_complet: newTeacher.nom_complet,
          email: newTeacher.email,
          telephone: newTeacher.telephone,
          role: newTeacher.role,
          specialite: newTeacher.specialite,
          assigned_class_ids: assignedClassIds,
          titulaire_class_ids: titulaireClassIds,
          ecole_id: targetSchoolId,
        });

        const { data: upT } = await supabase
          .from('teacher')
          .update({ specialite: metaPayload })
          .eq('profile_id', createdId)
          .select();

        if (!upT || upT.length === 0) {
          await supabase.from('teacher').insert([{
            profile_id: createdId,
            specialite: metaPayload,
          }]);
        }
      } catch (err: any) {
        console.warn('Erreur mise à jour table teacher Supabase:', err?.message);
      }

      // Synchroniser avec l'API serveur Next.js pour partage immédiat PC <-> Mobile
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_teacher',
            payload: newTeacher,
          }),
        });
      } catch (err: any) {
        console.warn('Erreur API sync save_teacher:', err?.message);
      }

      const stored = getStoredTeachers();
      saveStoredTeachers([...stored, newTeacher]);

      // 4. Mettre à jour l'affectation des classes
      if (assignedClassIds.length > 0 || titulaireClassIds.length > 0) {
        const map = getTeacherClassesMap();
        map[createdId] = {
          classIds: assignedClassIds,
          titulaireClassIds,
        };
        saveTeacherClassesMap(map);

        // Mettre à jour titulaire_id sur classes
        if (titulaireClassIds.length > 0) {
          try {
            await supabase
              .from('classes')
              .update({ titulaire_id: createdId })
              .in('id', titulaireClassIds);
          } catch {}
        }
      }

      return newTeacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['all_classes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    },
  });
}

export interface UpdateTeacherPayload {
  id: string;
  nom_complet: string;
  email?: string;
  telephone?: string;
  role?: 'teacher' | 'admin' | 'super_admin';
  ecole_id?: string;
  active?: boolean;
  assigned_class_ids?: string[];
  titulaire_class_ids?: string[];
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (payload: UpdateTeacherPayload) => {
      const { id, nom_complet, email, telephone, role, ecole_id, active, assigned_class_ids, titulaire_class_ids } =
        payload;

      // 1. Mettre à jour le stockage local
      const stored = getStoredTeachers();
      const existingIdx = stored.findIndex((t) => t.id === id);

      const updatedRecord = {
        id,
        nom_complet,
        email,
        telephone,
        role: role || 'teacher',
        ecole_id: ecole_id || DEFAULT_SCHOOL_ID,
        active: active !== false,
        actif: active !== false,
        assigned_class_ids: assigned_class_ids || [],
        titulaire_class_ids: titulaire_class_ids || [],
        updated_at: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        stored[existingIdx] = { ...stored[existingIdx], ...updatedRecord };
        saveStoredTeachers(stored);
      } else {
        saveStoredTeachers([...stored, updatedRecord]);
      }

      if (typeof window !== 'undefined' && active !== undefined) {
        localStorage.setItem(`e_rdc_teacher_active_${id}`, String(active));
      }

      // 2. Mettre à jour la cartographie des classes assignées
      if (assigned_class_ids !== undefined || titulaire_class_ids !== undefined) {
        const map = getTeacherClassesMap();
        map[id] = {
          classIds: assigned_class_ids || [],
          titulaireClassIds: titulaire_class_ids || [],
        };
        saveTeacherClassesMap(map);

        // Mettre à jour les classes custom dans le stockage local
        if (typeof window !== 'undefined') {
          try {
            const s = localStorage.getItem('e_rdc_custom_classes');
            if (s) {
              const list = JSON.parse(s);
              const updatedList = list.map((c: any) => {
                if (titulaire_class_ids?.includes(c.id)) {
                  return { ...c, titulaire_id: id };
                }
                if (c.titulaire_id === id && !titulaire_class_ids?.includes(c.id)) {
                  return { ...c, titulaire_id: null };
                }
                return c;
              });
              localStorage.setItem('e_rdc_custom_classes', JSON.stringify(updatedList));
            }
          } catch {}
        }

        // Tenter la mise à jour Supabase des classes
        try {
          if (titulaire_class_ids && titulaire_class_ids.length > 0) {
            await supabase
              .from('classes')
              .update({ titulaire_id: id })
              .in('id', titulaire_class_ids);
          }
        } catch {}
      }

      // 3. Tenter la mise à jour Supabase de la table teacher et profile
      try {
        const metaPayload = JSON.stringify({
          nom_complet: updatedRecord.nom_complet,
          email: updatedRecord.email,
          telephone: updatedRecord.telephone,
          role: updatedRecord.role,
          specialite: (existingIdx >= 0 && stored[existingIdx]?.specialite) || 'Enseignement Primaire',
          assigned_class_ids: updatedRecord.assigned_class_ids,
          titulaire_class_ids: updatedRecord.titulaire_class_ids,
          ecole_id: updatedRecord.ecole_id,
        });

        await supabase
          .from('teacher')
          .update({ specialite: metaPayload })
          .eq('profile_id', id);
      } catch (err: any) {
        console.warn('Erreur mise à jour table teacher Supabase:', err?.message);
      }

      // Synchroniser avec l'API serveur Next.js pour partage immédiat PC <-> Mobile
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_teacher',
            payload: updatedRecord,
          }),
        });
      } catch (err: any) {
        console.warn('Erreur API sync save_teacher:', err?.message);
      }

      try {
        const updateObj: any = { nom_complet };
        if (role) updateObj.role = role;
        if (ecole_id) updateObj.ecole_id = ecole_id;

        await supabase.from('profiles').update(updateObj).eq('id', id);
      } catch (err: any) {
        console.warn('Erreur mise à jour Supabase profile:', err?.message);
      }

      return updatedRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['all_classes'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

/**
 * Mutation pour activer ou désactiver un enseignant/personnel (CRU-Désactivable)
 */
export function useToggleTeacherActive() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ teacherId, currentActive }: { teacherId: string; currentActive: boolean }) => {
      const nextActive = !currentActive;

      // 1. Mettre à jour dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`e_rdc_teacher_active_${teacherId}`, String(nextActive));
      }

      const stored = getStoredTeachers();
      const idx = stored.findIndex((t) => t.id === teacherId);
      if (idx >= 0) {
        stored[idx].active = nextActive;
        stored[idx].actif = nextActive;
        saveStoredTeachers(stored);
      } else {
        const def = DEFAULT_TEACHERS.find((t) => t.id === teacherId);
        if (def) {
          saveStoredTeachers([...stored, { ...def, active: nextActive, actif: nextActive }]);
        }
      }

      // 2. Tenter de synchroniser si une colonne actif/active existe
      try {
        await supabase.from('profiles').update({ actif: nextActive }).eq('id', teacherId);
      } catch {}

      return { teacherId, active: nextActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

/**
 * Mutation dédiée pour affecter des classes à un enseignant ("il doit être assignable également")
 */
export function useAssignTeacherClasses() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      teacherId,
      assignedClassIds,
      titulaireClassIds = [],
    }: {
      teacherId: string;
      assignedClassIds: string[];
      titulaireClassIds?: string[];
    }) => {
      // 1. Sauvegarder la cartographie des classes assignées
      const teacherMap = getStoredTeacherClassesMap();
      teacherMap[teacherId] = {
        classIds: assignedClassIds,
        titulaireClassIds,
      };

      // 2. Mettre à jour la cartographie globale des titulaires
      const titulaireMap = getStoredClassTitulaireMap();

      // Pour les promotions où cet enseignant est titulaire
      titulaireClassIds.forEach((cId) => {
        titulaireMap[cId] = teacherId;
        // Retirer ce titulariat des autres enseignants
        Object.keys(teacherMap).forEach((otherId) => {
          if (otherId !== teacherId) {
            teacherMap[otherId].titulaireClassIds = (teacherMap[otherId].titulaireClassIds || []).filter(
              (id) => id !== cId
            );
          }
        });
      });

      // Retirer le titulariat des promotions qui ne sont plus dans titulaireClassIds
      Object.entries(titulaireMap).forEach(([cId, tId]) => {
        if (tId === teacherId && !titulaireClassIds.includes(cId)) {
          delete titulaireMap[cId];
        }
      });

      saveStoredTeacherClassesMap(teacherMap);
      saveStoredClassTitulaireMap(titulaireMap);

      // Synchroniser l'objet enseignant dans getStoredTeachers() et /api/sync
      const stored = getStoredTeachers();
      const existing = stored.find((t) => t.id === teacherId);
      if (existing) {
        existing.assigned_class_ids = assignedClassIds;
        existing.titulaire_class_ids = titulaireClassIds;
        saveStoredTeachers(stored);

        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'save_teacher',
              payload: existing,
            }),
          });
        } catch (err: any) {
          console.warn('Erreur API sync assign classes:', err?.message);
        }
      }

      // 3. Mettre à jour les classes custom
      if (typeof window !== 'undefined') {
        try {
          const s = localStorage.getItem(LOCAL_CLASSES_KEY);
          if (s) {
            const list = JSON.parse(s);
            const updated = list.map((c: any) => {
              if (titulaireClassIds.includes(c.id)) {
                return { ...c, titulaire_id: teacherId };
              }
              if (c.titulaire_id === teacherId && !titulaireClassIds.includes(c.id)) {
                return { ...c, titulaire_id: null };
              }
              return c;
            });
            localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(updated));
          }
        } catch {}
      }

      // 4. Tenter la mise à jour Supabase sur classes
      try {
        if (titulaireClassIds.length > 0) {
          await supabase.from('classes').update({ titulaire_id: teacherId }).in('id', titulaireClassIds);
        }
      } catch {}

      return { teacherId, assignedClassIds, titulaireClassIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['classes_list'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['all_classes'] });
      queryClient.invalidateQueries({ queryKey: ['cours_classes'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
    },
  });
}
