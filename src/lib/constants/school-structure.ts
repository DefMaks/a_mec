import { Classe } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export const LOCAL_TEACHERS_KEY = 'e_rdc_custom_teachers';
export const LOCAL_CLASSES_KEY = 'e_rdc_custom_classes';
export const LOCAL_TEACHER_CLASSES_KEY = 'e_rdc_teacher_classes_map';
export const LOCAL_CLASS_TITULAIRE_MAP = 'e_rdc_class_titulaire_map';
export const LOCAL_COURS_CLASSES_KEY = 'e_rdc_cours_classes_assignments';

export interface AssignedClassInfo {
  id: string;
  nom: string;
  is_titulaire: boolean;
}

export interface TeacherRecord {
  id: string;
  nom_complet: string;
  email: string;
  telephone: string;
  role: 'teacher' | 'admin' | 'super_admin';
  ecole_id: string;
  actif: boolean;
  active: boolean;
  created_at: string;
  assigned_class_ids: string[];
  titulaire_class_ids: string[];
  assigned_classes: AssignedClassInfo[];
}

/**
 * Promotions standard de l'Académie du Salut (ADS)
 * Système éducatif national RDC : Primaire (1ère à 6ème) et Éducation de Base (7ème & 8ème EB)
 */
export const STANDARD_PROMOTIONS: Classe[] = [
  {
    id: '730145b3-b30f-4aff-b0ab-c7550849d5fe',
    nom: '1ère Primaire',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '53b37e2f-110b-4551-ac31-e018305f74d5',
    titulaire_id: 'b6416211-0e05-4432-85e9-c5b3b243e543', // Prof. Shasa Kanyinda
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '840256c4-c41a-4b0c-a1ba-d8661950e601',
    nom: '2ème Primaire',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '53b37e2f-110b-4551-ac31-e018305f74d5',
    titulaire_id: null,
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '951367d5-d52b-4c1d-b2cb-e9772061f712',
    nom: '3ème Primaire',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '53b37e2f-110b-4551-ac31-e018305f74d5',
    titulaire_id: null,
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'a62478e6-e63c-4d2e-c3dc-fa883172a823',
    nom: '4ème Primaire',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '53b37e2f-110b-4551-ac31-e018305f74d5',
    titulaire_id: null,
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'b73589f7-f74d-4e3f-d4ed-0b994283b934',
    nom: '5ème Primaire',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '53b37e2f-110b-4551-ac31-e018305f74d5',
    titulaire_id: null,
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'c84690a8-085e-4f40-e5fe-1ca05394ca45',
    nom: '6ème Primaire',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '53b37e2f-110b-4551-ac31-e018305f74d5',
    titulaire_id: null,
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'd95701b9-196f-4051-f60f-2db164a5db56',
    nom: '7ème Éducation de Base (7ème EB)',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '64c483de-e9e2-456b-8942-164656544662',
    titulaire_id: null,
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'ea6812ca-2a70-4162-0710-3ec275b6ec67',
    nom: '8ème Éducation de Base (8ème EB)',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '64c483de-e9e2-456b-8942-164656544662',
    titulaire_id: null,
    created_at: '2026-03-01T00:00:00.000Z',
  },
];

/**
 * Enseignants de référence de l'Académie du Salut (ADS)
 */
export const BASE_TEACHERS: TeacherRecord[] = [
  {
    id: 'b6416211-0e05-4432-85e9-c5b3b243e543',
    nom_complet: 'Prof. Shasa Kanyinda',
    email: 'shasa.kanyinda@academiedusalut.cd',
    telephone: '+243 81 234 5678',
    role: 'teacher',
    ecole_id: DEFAULT_SCHOOL_ID,
    actif: true,
    active: true,
    created_at: '2026-03-01T00:00:00.000Z',
    assigned_class_ids: ['730145b3-b30f-4aff-b0ab-c7550849d5fe'],
    titulaire_class_ids: ['730145b3-b30f-4aff-b0ab-c7550849d5fe'],
    assigned_classes: [
      {
        id: '730145b3-b30f-4aff-b0ab-c7550849d5fe',
        nom: '1ère Primaire',
        is_titulaire: true,
      },
    ],
  },
];

/**
 * Récupère la cartographie des promotions assignées à chaque enseignant
 */
export function getStoredTeacherClassesMap(): Record<string, { classIds: string[]; titulaireClassIds: string[] }> {
  if (typeof window !== 'undefined') {
    try {
      const s = localStorage.getItem(LOCAL_TEACHER_CLASSES_KEY);
      if (s) {
        return JSON.parse(s);
      }
    } catch {}
  }
  // Configuration initiale par défaut : Seul Prof. Shasa Kanyinda est affecté à la 1ère Primaire
  return {
    'b6416211-0e05-4432-85e9-c5b3b243e543': {
      classIds: ['730145b3-b30f-4aff-b0ab-c7550849d5fe'],
      titulaireClassIds: ['730145b3-b30f-4aff-b0ab-c7550849d5fe'],
    },
  };
}

export function saveStoredTeacherClassesMap(map: Record<string, { classIds: string[]; titulaireClassIds: string[] }>) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_TEACHER_CLASSES_KEY, JSON.stringify(map));
    } catch {}
  }
}

/**
 * Récupère la cartographie des titulaires par classe: classId -> teacherId
 */
export function getStoredClassTitulaireMap(): Record<string, string | null> {
  if (typeof window !== 'undefined') {
    try {
      const s = localStorage.getItem(LOCAL_CLASS_TITULAIRE_MAP);
      if (s) return JSON.parse(s);
    } catch {}
  }
  return {
    '730145b3-b30f-4aff-b0ab-c7550849d5fe': 'b6416211-0e05-4432-85e9-c5b3b243e543', // 1ère Primaire -> Prof. Shasa Kanyinda
  };
}

export function saveStoredClassTitulaireMap(map: Record<string, string | null>) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_CLASS_TITULAIRE_MAP, JSON.stringify(map));
    } catch {}
  }
}

/**
 * Nom d'un enseignant par son ID
 */
export function getTeacherName(teacherId?: string | null): string {
  if (!teacherId) return 'Non désigné';
  const found = BASE_TEACHERS.find((t) => t.id === teacherId);
  if (found) return found.nom_complet;

  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem(LOCAL_TEACHERS_KEY);
      if (custom) {
        const list = JSON.parse(custom);
        const ct = list.find((t: any) => t.id === teacherId);
        if (ct) return ct.nom_complet;
      }
    } catch {}
  }

  return 'Enseignant';
}
