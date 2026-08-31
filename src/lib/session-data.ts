import { createClient } from '@/lib/supabase/client';
import { SessionResponse, SessionRole } from '@/types/session.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import {
  PRIMARY_CLASS_ID,
  PROF_SHASA_ID,
  STANDARD_PRIMARY_COURSES,
  getInitialAssignments,
} from '@/hooks/use-course-assignments';

export interface StudentSessionJSON {
  user: {
    id: string;
    role: 'student';
    pseudonyme: string;
    code_acces: string;
    classe_id: string;
    parent_id: string;
    created_at: string;
  };
  classe: {
    id: string;
    nom: string;
    ecole_id: string;
    niveau: string;
    section: string;
    option: string;
    titulaire_id: string;
    titulaire: string;
  };
  ecole: {
    id: string;
    nom: string;
    rccm: string;
    id_nat: string;
  };
  parent: {
    id: string;
    nom_complet: string;
    telephone: string;
  };
  cours: {
    id: string;
    titre: string;
    matiere: string;
    classe_id: string;
    enseignant_id: string;
    enseignant: string;
    chapitres_count: number;
  }[];
  quiz_disponibles: any[];
  abonnement_acces: {
    statut: 'actif' | 'expire';
    type_forfait: 'mensuel' | 'trimestriel' | 'annuel';
    derniere_mise_a_jour: string;
    jours_restants: number;
    expire_le: string;
  };
  cours_classes: any[];
}

export function generateStudentSessionData(
  eleveOverride?: Partial<StudentSessionJSON['user']>
): StudentSessionJSON {
  const assignments = getInitialAssignments();
  const primaryAssignments = assignments.filter(
    (a) => a.classe_id === PRIMARY_CLASS_ID && a.est_actif !== false
  );

  const assignedCourses = STANDARD_PRIMARY_COURSES.filter((c) =>
    primaryAssignments.some((a) => a.cours_id === c.id)
  ).map((c) => ({
    id: c.id,
    titre: c.titre,
    matiere: c.matiere,
    classe_id: PRIMARY_CLASS_ID,
    enseignant_id: PROF_SHASA_ID,
    enseignant: 'Prof. Shasa Kanyinda',
    chapitres_count: 0,
  }));

  return {
    user: {
      id: eleveOverride?.id || 'b3151f28-2824-401c-8456-12fa0dd7aa48',
      role: 'student',
      pseudonyme: eleveOverride?.pseudonyme || 'Joe',
      code_acces: eleveOverride?.code_acces || '0123456789',
      classe_id: eleveOverride?.classe_id || PRIMARY_CLASS_ID,
      parent_id: eleveOverride?.parent_id || 'ff3f802f-ac54-455d-a660-fc265d220113',
      created_at: '2026-03-03T10:50:39.377073+00:00',
    },
    classe: {
      id: PRIMARY_CLASS_ID,
      nom: '1ère Année Primaire',
      ecole_id: DEFAULT_SCHOOL_ID,
      niveau: 'Primaire',
      section: 'Fondamentale',
      option: 'Générale',
      titulaire_id: PROF_SHASA_ID,
      titulaire: 'Prof. Shasa Kanyinda',
    },
    ecole: {
      id: DEFAULT_SCHOOL_ID,
      nom: 'Académie du Salut!',
      rccm: 'CD/KNG/RCCM/20-A-00652',
      id_nat: 'ID-NAT 01-910-N58634L',
    },
    parent: {
      id: 'ff3f802f-ac54-455d-a660-fc265d220113',
      nom_complet: 'Parent Tuteur',
      telephone: '+243 97 415 6086',
    },
    cours: assignedCourses,
    quiz_disponibles: [],
    abonnement_acces: {
      statut: 'actif',
      type_forfait: 'annuel',
      derniere_mise_a_jour: '2026-08-25T00:00:00.000Z',
      jours_restants: 365,
      expire_le: '2027-08-25T00:00:00.000Z',
    },
    cours_classes: primaryAssignments,
  };
}

export async function fetchSessionDichotomy(
  role: SessionRole = 'admin',
  profileId: string | null = null,
  eleveId: string | null = null
): Promise<SessionResponse> {
  const supabase = createClient();
  const schoolId = DEFAULT_SCHOOL_ID;

  // Initial envelope shape
  const envelope: SessionResponse = {
    session: {
      role,
      user: {
        profile_id: profileId,
        eleve_id: eleveId,
      },
    },
    data: {
      profile: {},
      classes: [],
      eleves: [],
      cours: [],
      chapitres: [],
      quiz: [],
      quiz_attempts: [],
      classe_professeur: [],
    },
  };

  try {
    // 1. SUPER ADMIN (CRUD - Toutes les données)
    if (role === 'super_admin') {
      const [
        { data: profiles },
        { data: classes },
        { data: eleves },
        { data: cours },
        { data: chapitres },
        { data: quizzes },
        { data: attempts },
      ] = await Promise.all([
        supabase.from('profiles').select('*').limit(50),
        supabase.from('classes').select('*, ecole:ecoles(id, nom), niveaux(id, nom, code)'),
        supabase.from('eleves').select('*, parent:profiles(id, nom_complet, telephone), classes(*)'),
        supabase.from('cours').select('*, matieres(*), classes(*)'),
        supabase.from('chapitres').select('*').order('position', { ascending: true }),
        supabase.from('quiz').select('*'),
        supabase.from('quiz_attempts').select('*, eleves(pseudonyme)'),
      ]);

      envelope.data = {
        profile: profiles?.[0] || {
          id: profileId || 'superadmin-uuid',
          role: 'super_admin',
          nom_complet: 'Super Administrateur ADS',
          ecole_id: null,
        },
        classes: classes || [],
        eleves: eleves || [],
        classe_professeur: (profiles || [])
          .filter((p) => p.role === 'teacher')
          .map((p) => ({
            classe_id: classes?.[0]?.id || PRIMARY_CLASS_ID,
            professeur_id: p.id,
            role_professeur: 'enseignant_principal',
            professeur_nom: p.nom_complet,
          })),
        cours: cours || [],
        chapitres: chapitres || [],
        quiz: quizzes || [],
        quiz_attempts: attempts || [],
      };
      return envelope;
    }

    // 2. ADMIN (École) - Voit uniquement son école
    if (role === 'admin') {
      const [
        { data: profile },
        { data: classes },
        { data: eleves },
        { data: cours },
        { data: chapitres },
        { data: quizzes },
        { data: attempts },
      ] = await Promise.all([
        profileId
          ? supabase.from('profiles').select('*').eq('id', profileId).single()
          : supabase.from('profiles').select('*').eq('role', 'admin').limit(1).maybeSingle(),
        supabase.from('classes').select('*, niveaux(*)').eq('ecole_id', schoolId),
        supabase.from('eleves').select('*, parent:profiles(id, nom_complet, telephone), classes!inner(*)').eq('classes.ecole_id', schoolId),
        supabase.from('cours').select('*, matieres(*), classes!inner(*)').eq('classes.ecole_id', schoolId),
        supabase.from('chapitres').select('*'),
        supabase.from('quiz').select('*'),
        supabase.from('quiz_attempts').select('*').limit(100),
      ]);

      envelope.data = {
        profile: profile || {
          id: profileId || 'admin-uuid',
          role: 'admin',
          ecole_id: schoolId,
          nom_complet: 'Direction Académie du Salut',
        },
        classes: classes || [],
        eleves: eleves || [],
        classe_professeur: [
          {
            classe_id: classes?.[0]?.id || PRIMARY_CLASS_ID,
            professeur_id: PROF_SHASA_ID,
            role_professeur: 'enseignant_titulaire',
          },
        ],
        cours: cours || [],
        chapitres: chapitres || [],
        quiz: quizzes || [],
        quiz_attempts: attempts || [],
      };
      return envelope;
    }

    // 3. TEACHER - Voit ses classes + l'activité de leurs élèves
    if (role === 'teacher') {
      const teacherId = profileId || PROF_SHASA_ID;

      const [
        { data: profile },
        { data: cours },
        { data: chapitres },
        { data: quizzes },
        { data: classes },
        { data: eleves },
        { data: attempts },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', teacherId).maybeSingle(),
        supabase.from('cours').select('*, matieres(*), classes(*)').eq('enseignant_id', teacherId),
        supabase.from('chapitres').select('*'),
        supabase.from('quiz').select('*'),
        supabase.from('classes').select('*, niveaux(*)').eq('ecole_id', schoolId),
        supabase.from('eleves').select('*, classes(*)'),
        supabase.from('quiz_attempts').select('*, eleves(pseudonyme)'),
      ]);

      const teacherCours = cours || [];
      const teacherChapitreIds = (chapitres || []).filter((ch) =>
        teacherCours.some((c) => c.id === ch.cours_id)
      ).map((ch) => ch.id);

      const teacherQuizzes = (quizzes || []).filter((q) => teacherChapitreIds.includes(q.chapitre_id || ''));

      envelope.data = {
        profile: profile || {
          id: teacherId,
          role: 'teacher',
          ecole_id: schoolId,
          nom_complet: 'Prof. Shasa Kanyinda',
        },
        classes: classes || [
          {
            id: PRIMARY_CLASS_ID,
            nom: '1ère Primaire',
            ecole_id: schoolId,
            titulaire_id: PROF_SHASA_ID,
          },
        ],
        eleves: eleves || [],
        classe_professeur: [
          {
            classe_id: PRIMARY_CLASS_ID,
            professeur_id: teacherId,
            role_professeur: 'enseignant_titulaire',
          },
        ],
        cours: teacherCours,
        chapitres: chapitres || [],
        quiz: teacherQuizzes.length > 0 ? teacherQuizzes : (quizzes || []),
        quiz_attempts: attempts || [],
      };
      return envelope;
    }

    // 4. PARENT
    if (role === 'parent') {
      const parentId = profileId || 'ff3f802f-ac54-455d-a660-fc265d220113';

      const [
        { data: profile },
        { data: eleves },
        { data: classes },
        { data: attempts },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', parentId).maybeSingle(),
        supabase.from('eleves').select('*, classes(*, niveaux(*))').eq('parent_id', parentId),
        supabase.from('classes').select('*, niveaux(*)').eq('ecole_id', schoolId),
        supabase.from('quiz_attempts').select('*').limit(20),
      ]);

      envelope.data = {
        profile: profile || {
          id: parentId,
          role: 'parent',
          ecole_id: schoolId,
          nom_complet: 'Parent Tuteur',
        },
        classes: classes || [],
        eleves: eleves && eleves.length > 0 ? eleves : [
          {
            id: 'b3151f28-2824-401c-8456-12fa0dd7aa48',
            parent_id: parentId,
            classe_id: PRIMARY_CLASS_ID,
            pseudonyme: 'Joe',
            matricule: 'ADS-2025-0042',
            code_acces: '0123456789',
            classe: '1ère Primaire',
          },
        ],
        quiz_attempts: attempts || [],
        cours: [],
        chapitres: [],
        quiz: [],
        classe_professeur: [],
      };
      return envelope;
    }

    // 5. ELEVE / STUDENT
    if (role === 'eleve' || role === 'student') {
      const studentEleveId = eleveId || 'b3151f28-2824-401c-8456-12fa0dd7aa48';
      const studentSession = generateStudentSessionData({ id: studentEleveId });

      envelope.data = {
        profile: studentSession,
        classes: [
          {
            id: PRIMARY_CLASS_ID,
            nom: '1ère Primaire',
            ecole_id: schoolId,
            titulaire_id: PROF_SHASA_ID,
          },
        ],
        eleves: [
          {
            id: studentSession.user.id,
            pseudonyme: studentSession.user.pseudonyme,
            code_acces: studentSession.user.code_acces,
            classe_id: studentSession.user.classe_id,
            parent_id: studentSession.user.parent_id,
          },
        ],
        cours: studentSession.cours as any,
        chapitres: [],
        quiz: [],
        quiz_attempts: [],
        classe_professeur: [
          {
            classe_id: PRIMARY_CLASS_ID,
            professeur_id: PROF_SHASA_ID,
            role_professeur: 'enseignant_titulaire',
          },
        ],
      };
      return envelope;
    }
  } catch (err) {
    console.error('Erreur fetchSessionDichotomy:', err);
  }

  return envelope;
}
