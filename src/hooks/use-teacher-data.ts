import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export interface TeacherMeInfo {
  authUserId: string | null;
  profileId: string | null;
  nomComplet: string | null;
  email?: string | null;
  role: string | null;
  ecole: {
    id: string;
    nom: string;
  } | null;
  teacherMeta: {
    teacherId: string;
    specialite?: string | null;
  } | null;
}

export interface TeacherChapter {
  id: string;
  cours_id: string;
  titre: string;
  contenu?: string | null;
  contenu_html?: string | null;
  ordre: number;
  position?: number;
  duree_minutes?: number | null;
  audio_url?: string | null;
  pdf_url?: string | null;
  video_url?: string | null;
  ecole_id?: string | null;
  createur_id?: string | null;
  created_at?: string;
  // joined course info
  cours?: {
    id: string;
    titre: string;
    slug?: string;
    matiere_id?: string;
    matiere_nom?: string;
    classe?: string;
    classe_id?: string;
    niveau_id?: string;
    option_id?: string;
  };
}

export interface TeacherCourse {
  id: string;
  titre: string;
  slug?: string | null;
  description?: string | null;
  matiere_id?: string | null;
  matiere_nom?: string | null;
  classe?: string | null;
  classe_id?: string | null;
  niveau_id?: string | null;
  option_id?: string | null;
  createur_id?: string | null;
  enseignant_id?: string | null;
  ecole_id?: string | null;
  is_published?: boolean;
  created_at?: string;
  chapitres_count?: number;
  chapitres?: TeacherChapter[];
}

export interface TeacherAssignmentData {
  classes: {
    id: string;
    nom: string;
    niveau_nom?: string;
    option_nom?: string;
    vacation?: string;
  }[];
  matieres: {
    id: string;
    nom: string;
    code: string;
  }[];
  cours: TeacherCourse[];
}

/**
 * 2.1 Récupérer le professeur connecté ("me")
 * Simulation active pour l'utilisateur auth: b6416211-0e05-4432-85e9-c5b3b243e543 (Professeur Shasa)
 */
export async function getTeacherMe(): Promise<TeacherMeInfo | null> {
  const supabase = getSupabaseBrowserClient();
  const SHASA_USER_ID = 'b6416211-0e05-4432-85e9-c5b3b243e543';

  try {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    const targetUserId = user?.id || SHASA_USER_ID;

    let profile: any = null;

    // 1. Chercher par user_id
    const { data: pDataUser } = await supabase
      .from('profiles')
      .select('id, user_id, nom_complet, email, role, ecole_id')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (pDataUser) {
      profile = pDataUser;
    }

    // 2. Chercher par id direct
    if (!profile) {
      const { data: pDataId } = await supabase
        .from('profiles')
        .select('id, user_id, nom_complet, email, role, ecole_id')
        .eq('id', targetUserId)
        .maybeSingle();

      if (pDataId) {
        profile = pDataId;
      }
    }

    // 3. Chercher par nom "Shasa"
    if (!profile) {
      const { data: pDataShasa } = await supabase
        .from('profiles')
        .select('id, user_id, nom_complet, email, role, ecole_id')
        .ilike('nom_complet', '%Shasa%')
        .maybeSingle();

      if (pDataShasa) {
        profile = pDataShasa;
      }
    }

    // 4. Fallback vers le premier profil enseignant
    if (!profile) {
      const { data: teacherProfiles } = await supabase
        .from('profiles')
        .select('id, user_id, nom_complet, email, role, ecole_id')
        .eq('role', 'teacher')
        .limit(1);

      if (teacherProfiles && teacherProfiles.length > 0) {
        profile = teacherProfiles[0];
      }
    }

    if (!profile) {
      return {
        authUserId: targetUserId,
        profileId: targetUserId,
        nomComplet: 'Professeur Shasa',
        email: 'shasa@academiedusalut.cd',
        role: 'teacher',
        ecole: { id: DEFAULT_SCHOOL_ID, nom: 'Académie du Salut (ADS)' },
        teacherMeta: {
          teacherId: targetUserId,
          specialite: 'STEM / Math-Physique & TICE',
        },
      };
    }

    // Récupérer l'école
    let ecoleData: any = null;
    const ecoleId = profile.ecole_id || DEFAULT_SCHOOL_ID;
    if (ecoleId) {
      const { data: ecole } = await supabase
        .from('ecoles')
        .select('id, nom')
        .eq('id', ecoleId)
        .maybeSingle();

      ecoleData = ecole;
    }

    // Récupérer les métadonnées teacher (optionnel)
    let teacherMetaData: any = null;
    try {
      const { data: teacherMeta } = await supabase
        .from('teacher')
        .select('id, profile_id, specialite')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (teacherMeta) {
        teacherMetaData = {
          teacherId: teacherMeta.id,
          specialite: teacherMeta.specialite,
        };
      }
    } catch {
      // Table teacher optionnelle
    }

    return {
      authUserId: user?.id || profile.user_id || targetUserId,
      profileId: profile.id,
      nomComplet: profile.nom_complet || 'Professeur Shasa',
      email: profile.email || 'shasa@academiedusalut.cd',
      role: profile.role || 'teacher',
      ecole: ecoleData ? { id: ecoleData.id, nom: ecoleData.nom } : { id: DEFAULT_SCHOOL_ID, nom: 'Académie du Salut (ADS)' },
      teacherMeta: teacherMetaData || {
        teacherId: profile.id,
        specialite: 'STEM / Math-Physique & TICE',
      },
    };
  } catch (err: any) {
    console.warn('Erreur chargement getTeacherMe:', err?.message);
    return {
      authUserId: SHASA_USER_ID,
      profileId: SHASA_USER_ID,
      nomComplet: 'Professeur Shasa',
      email: 'shasa@academiedusalut.cd',
      role: 'teacher',
      ecole: { id: DEFAULT_SCHOOL_ID, nom: 'Académie du Salut (ADS)' },
      teacherMeta: {
        teacherId: SHASA_USER_ID,
        specialite: 'STEM / Math-Physique & TICE',
      },
    };
  }
}

/**
 * 2.2 Charger tous les chapitres du professeur (via ses cours ou assignations)
 */
export async function loadTeacherChapters(profileId: string | null) {
  const supabase = getSupabaseBrowserClient();

  try {
    // 1) Récupérer les cours du professeur
    const { data: coursData, error: coursErr } = await supabase
      .from('cours')
      .select('*')
      .order('created_at', { ascending: false });

    if (coursErr) throw coursErr;

    const coursList = coursData ?? [];
    const coursIds = coursList.map((c) => c.id);

    // Récupérer la liste des matières pour joindre les libellés
    let matieresList: any[] = [];
    try {
      const { data: matData } = await supabase.from('matieres').select('id, nom, code');
      if (matData) matieresList = matData;
    } catch {}

    // Récupérer la liste des classes
    let classesList: any[] = [];
    try {
      const { data: clsData } = await supabase.from('classes').select('id, niveau_id, option_id, vacation');
      if (clsData) classesList = clsData;
    } catch {}

    if (coursIds.length === 0) {
      return { cours: [], chapitres: [] };
    }

    // 2) Récupérer les chapitres par cours_id
    const { data: chapitresData, error: chErr } = await supabase
      .from('chapitres')
      .select('*')
      .in('cours_id', coursIds);

    if (chErr) throw chErr;

    const rawChapitres = (chapitresData ?? []).sort((a: any, b: any) => {
      const posA = a.position ?? a.ordre ?? 1;
      const posB = b.position ?? b.ordre ?? 1;
      return posA - posB;
    });

    // Mappage enrichi des cours
    const mappedCourses: TeacherCourse[] = coursList.map((c) => {
      const matchedMatiere = matieresList.find((m) => m.id === c.matiere_id);
      const courseChapitres = rawChapitres.filter((ch) => ch.cours_id === c.id);

      return {
        id: c.id,
        titre: c.titre,
        slug: c.slug,
        description: c.description,
        matiere_id: c.matiere_id,
        matiere_nom: matchedMatiere?.nom || c.matiere_nom || 'Discipline Générale',
        classe: c.classe || 'Toutes les classes',
        classe_id: c.classe_id,
        niveau_id: c.niveau_id,
        option_id: c.option_id,
        createur_id: c.createur_id,
        enseignant_id: c.enseignant_id,
        ecole_id: c.ecole_id,
        is_published: c.is_published ?? true,
        created_at: c.created_at,
        chapitres_count: courseChapitres.length,
      };
    });

    // Mappage enrichi des chapitres
    const mappedChapitres: TeacherChapter[] = rawChapitres.map((ch) => {
      const parentCourse = mappedCourses.find((c) => c.id === ch.cours_id);
      return {
        id: ch.id,
        cours_id: ch.cours_id,
        titre: ch.titre || 'Leçon sans titre',
        contenu: ch.contenu || ch.contenu_html || '',
        contenu_html: ch.contenu_html || ch.contenu || '',
        ordre: ch.ordre ?? ch.position ?? 1,
        position: ch.position ?? ch.ordre ?? 1,
        duree_minutes: ch.duree_minutes ?? 30,
        audio_url: ch.audio_url,
        pdf_url: ch.pdf_url,
        video_url: ch.video_url,
        ecole_id: ch.ecole_id,
        createur_id: ch.createur_id,
        created_at: ch.created_at,
        cours: parentCourse
          ? {
              id: parentCourse.id,
              titre: parentCourse.titre,
              slug: parentCourse.slug || undefined,
              matiere_id: parentCourse.matiere_id || undefined,
              matiere_nom: parentCourse.matiere_nom || undefined,
              classe: parentCourse.classe || undefined,
              classe_id: parentCourse.classe_id || undefined,
            }
          : undefined,
      };
    });

    return {
      cours: mappedCourses,
      chapitres: mappedChapitres,
    };
  } catch (err: any) {
    console.error('Erreur chargement loadTeacherChapters:', err?.message);
    return { cours: [], chapitres: [] };
  }
}

/**
 * Hook React Query pour charger le profil du professeur actif
 */
export function useTeacherMe() {
  return useQuery({
    queryKey: ['teacher_me'],
    queryFn: async () => getTeacherMe(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook React Query pour charger les chapitres du professeur
 */
export function useTeacherChapters(profileId: string | null | undefined) {
  return useQuery({
    queryKey: ['teacher_chapters', profileId],
    queryFn: async () => loadTeacherChapters(profileId || null),
    enabled: true,
  });
}

/**
 * Hook pour charger les matières, cours et classes pour la création de leçons et quiz
 */
export function useTeacherAssignments(profileId: string | null | undefined) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['teacher_assignments', profileId, DEFAULT_SCHOOL_ID],
    queryFn: async (): Promise<TeacherAssignmentData> => {
      // 1) Matieres
      let matieres: any[] = [];
      const { data: mData } = await supabase
        .from('matieres')
        .select('id, nom, code')
        .order('nom', { ascending: true });
      if (mData) matieres = mData;

      // 2) Classes avec jointures
      let classes: any[] = [];
      const { data: cData } = await supabase
        .from('classes')
        .select(`
          id,
          vacation,
          niveau_id,
          option_id,
          niveaux (nom, code),
          options (nom, code)
        `)
        .order('created_at', { ascending: false });

      if (cData && cData.length > 0) {
        classes = cData.map((cls: any) => {
          const niv = cls.niveaux?.nom || cls.niveaux?.code || '';
          const opt = cls.options?.nom || cls.options?.code || '';
          const label = [niv, opt].filter(Boolean).join(' - ') || `Classe #${cls.id.slice(0, 6)}`;
          return {
            id: cls.id,
            nom: label,
            niveau_nom: niv,
            option_nom: opt,
            vacation: cls.vacation,
          };
        });
      } else {
        // Classes standard RDC
        classes = [
          { id: 'cls-6p', nom: '6ème Primaire', niveau_nom: '6ème Primaire' },
          { id: 'cls-8eb', nom: '8ème EB (Éducation de Base)', niveau_nom: '8ème EB' },
          { id: 'cls-4mp', nom: '4ème Humanités Math-Physique', niveau_nom: '4ème Humanités', option_nom: 'Math-Physique' },
          { id: 'cls-4bc', nom: '4ème Humanités Bio-Chimie', niveau_nom: '4ème Humanités', option_nom: 'Bio-Chimie' },
          { id: 'cls-4lit', nom: '4ème Humanités Littéraire', niveau_nom: '4ème Humanités', option_nom: 'Littéraire' },
        ];
      }

      // 3) Cours existants
      const { cours } = await loadTeacherChapters(profileId || null);

      return {
        matieres: matieres.length > 0 ? matieres : [
          { id: 'mat-math', nom: 'Mathématiques', code: 'MATH' },
          { id: 'mat-phys', nom: 'Physique', code: 'PHYS' },
          { id: 'mat-chim', nom: 'Chimie', code: 'CHIM' },
          { id: 'mat-fr', nom: 'Français & Littérature', code: 'FRAN' },
          { id: 'mat-svt', nom: 'Biologie / SVT', code: 'SVT' },
          { id: 'mat-info', nom: 'Informatique & STEM', code: 'INFO' },
          { id: 'mat-hist', nom: 'Histoire & Géographie', code: 'HIST' },
          { id: 'mat-ang', nom: 'Anglais', code: 'ANGL' },
        ],
        classes,
        cours,
      };
    },
  });
}

/**
 * Mutation pour créer un nouveau chapitre (leçon)
 */
export function useCreateChapter() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (payload: {
      cours_id: string;
      titre: string;
      contenu?: string;
      contenu_html?: string;
      ordre?: number;
      duree_minutes?: number;
      audio_url?: string;
      pdf_url?: string;
      createur_id?: string;
      ecole_id?: string;
    }) => {
      const content = payload.contenu_html || payload.contenu || '';
      const order = payload.ordre || 1;

      const chapterPayload: any = {
        cours_id: payload.cours_id,
        titre: payload.titre,
        contenu: content,
        position: order,
        duree_minutes: payload.duree_minutes || 30,
      };

      if (payload.audio_url) chapterPayload.audio_url = payload.audio_url;
      if (payload.pdf_url) chapterPayload.pdf_url = payload.pdf_url;

      const { data, error } = await supabase
        .from('chapitres')
        .insert([chapterPayload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_chapters'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation pour modifier un chapitre
 */
export function useUpdateChapter() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      titre?: string;
      contenu_html?: string;
      ordre?: number;
      duree_minutes?: number;
      audio_url?: string;
      pdf_url?: string;
    }) => {
      const updates: any = {};
      if (payload.titre !== undefined) updates.titre = payload.titre;
      if (payload.contenu_html !== undefined) {
        updates.contenu_html = payload.contenu_html;
        updates.contenu = payload.contenu_html;
      }
      if (payload.ordre !== undefined) {
        updates.ordre = payload.ordre;
        updates.position = payload.ordre;
      }
      if (payload.duree_minutes !== undefined) updates.duree_minutes = payload.duree_minutes;
      if (payload.audio_url !== undefined) updates.audio_url = payload.audio_url;
      if (payload.pdf_url !== undefined) updates.pdf_url = payload.pdf_url;

      const { data, error } = await supabase
        .from('chapitres')
        .update(updates)
        .eq('id', payload.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_chapters'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation pour supprimer un chapitre
 */
export function useDeleteChapter() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (chapterId: string) => {
      const { error } = await supabase.from('chapitres').delete().eq('id', chapterId);
      if (error) throw new Error(error.message);
      return chapterId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_chapters'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
