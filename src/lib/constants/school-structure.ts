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
    titulaire_id: 'e534604c-1863-450c-96d9-f42c32179b2c', // Prof. Jean-Marc Ilunga
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '951367d5-d52b-4c1d-b2cb-e9772061f712',
    nom: '3ème Primaire',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '53b37e2f-110b-4551-ac31-e018305f74d5',
    titulaire_id: 'f645715d-2974-561d-a7e0-f53d4328ac54', // Prof. Marie-Claire Tshisekedi
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'a62478e6-e63c-4d2e-c3dc-fa883172a823',
    nom: '4ème Primaire',
    ecole_id: DEFAULT_SCHOOL_ID,
    niveau_id: '53b37e2f-110b-4551-ac31-e018305f74d5',
    titulaire_id: 'c2d3e4f5-teacher-mwamba-uuid', // Prof. Christian Mwamba
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
  {
    id: 'e534604c-1863-450c-96d9-f42c32179b2c',
    nom_complet: 'Prof. Jean-Marc Ilunga',
    email: 'prof.ilunga@academiedusalut.cd',
    telephone: '+243 82 987 6543',
    role: 'teacher',
    ecole_id: DEFAULT_SCHOOL_ID,
    actif: true,
    active: true,
    created_at: '2026-03-01T00:00:00.000Z',
    assigned_class_ids: ['840256c4-c41a-4b0c-a1ba-d8661950e601'],
    titulaire_class_ids: ['840256c4-c41a-4b0c-a1ba-d8661950e601'],
    assigned_classes: [
      {
        id: '840256c4-c41a-4b0c-a1ba-d8661950e601',
        nom: '2ème Primaire',
        is_titulaire: true,
      },
    ],
  },
  {
    id: 'f645715d-2974-561d-a7e0-f53d4328ac54',
    nom_complet: 'Prof. Marie-Claire Tshisekedi',
    email: 'marieclaire.tshisekedi@academiedusalut.cd',
    telephone: '+243 81 555 4321',
    role: 'teacher',
    ecole_id: DEFAULT_SCHOOL_ID,
    actif: true,
    active: true,
    created_at: '2026-03-01T00:00:00.000Z',
    assigned_class_ids: ['951367d5-d52b-4c1d-b2cb-e9772061f712'],
    titulaire_class_ids: ['951367d5-d52b-4c1d-b2cb-e9772061f712'],
    assigned_classes: [
      {
        id: '951367d5-d52b-4c1d-b2cb-e9772061f712',
        nom: '3ème Primaire',
        is_titulaire: true,
      },
    ],
  },
  {
    id: 'c2d3e4f5-teacher-mwamba-uuid',
    nom_complet: 'Prof. Christian Mwamba',
    email: 'christian.mwamba@academiedusalut.cd',
    telephone: '+243 82 444 3322',
    role: 'teacher',
    ecole_id: DEFAULT_SCHOOL_ID,
    actif: true,
    active: true,
    created_at: '2026-03-01T00:00:00.000Z',
    assigned_class_ids: ['a62478e6-e63c-4d2e-c3dc-fa883172a823'],
    titulaire_class_ids: ['a62478e6-e63c-4d2e-c3dc-fa883172a823'],
    assigned_classes: [
      {
        id: 'a62478e6-e63c-4d2e-c3dc-fa883172a823',
        nom: '4ème Primaire',
        is_titulaire: true,
      },
    ],
  },
  {
    id: 'd4e5f6a7-admin-direction-uuid',
    nom_complet: 'Mme. Béatrice Kalonji',
    email: 'direction@academiedusalut.cd',
    telephone: '+243 81 999 8877',
    role: 'admin',
    ecole_id: DEFAULT_SCHOOL_ID,
    actif: true,
    active: true,
    created_at: '2026-03-01T00:00:00.000Z',
    assigned_class_ids: [],
    titulaire_class_ids: [],
    assigned_classes: [],
  },
  {
    id: 'a1b2c3d4-super-admin-defmaks-uuid',
    nom_complet: 'Super Administrateur ADS',
    email: 'admin@defmaks.com',
    telephone: '+243 89 000 1122',
    role: 'super_admin',
    ecole_id: DEFAULT_SCHOOL_ID,
    actif: true,
    active: true,
    created_at: '2026-03-01T00:00:00.000Z',
    assigned_class_ids: [],
    titulaire_class_ids: [],
    assigned_classes: [],
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
  // Configuration initiale par défaut
  return {
    'b6416211-0e05-4432-85e9-c5b3b243e543': {
      classIds: ['730145b3-b30f-4aff-b0ab-c7550849d5fe'],
      titulaireClassIds: ['730145b3-b30f-4aff-b0ab-c7550849d5fe'],
    },
    'e534604c-1863-450c-96d9-f42c32179b2c': {
      classIds: ['840256c4-c41a-4b0c-a1ba-d8661950e601'],
      titulaireClassIds: ['840256c4-c41a-4b0c-a1ba-d8661950e601'],
    },
    'f645715d-2974-561d-a7e0-f53d4328ac54': {
      classIds: ['951367d5-d52b-4c1d-b2cb-e9772061f712'],
      titulaireClassIds: ['951367d5-d52b-4c1d-b2cb-e9772061f712'],
    },
    'c2d3e4f5-teacher-mwamba-uuid': {
      classIds: ['a62478e6-e63c-4d2e-c3dc-fa883172a823'],
      titulaireClassIds: ['a62478e6-e63c-4d2e-c3dc-fa883172a823'],
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
    '840256c4-c41a-4b0c-a1ba-d8661950e601': 'e534604c-1863-450c-96d9-f42c32179b2c', // 2ème Primaire -> Prof. Jean-Marc Ilunga
    '951367d5-d52b-4c1d-b2cb-e9772061f712': 'f645715d-2974-561d-a7e0-f53d4328ac54', // 3ème Primaire -> Prof. Marie-Claire Tshisekedi
    'a62478e6-e63c-4d2e-c3dc-fa883172a823': 'c2d3e4f5-teacher-mwamba-uuid',         // 4ème Primaire -> Prof. Christian Mwamba
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
