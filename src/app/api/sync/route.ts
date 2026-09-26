import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};
const DATA_DIR = path.join(process.cwd(), 'data');
const SYNC_FILE = path.join(DATA_DIR, 'shared_school_sync.json');

interface SyncStore {
  teachers: any[];
  quizzes: any[];
  courses: any[];
  chapitres: any[];
  quiz_attachments: Record<string, { quiz_id: string; quiz_titre?: string; chapitre_id: string; cours_id?: string; updated_at: string }>;
  updated_at: string;
}

function getInitialStore(): SyncStore {
  return {
    teachers: [
      {
        id: 'b6416211-0e05-4432-85e9-c5b3b243e543',
        nom_complet: 'Prof. Shasa Kanyinda',
        email: 'shasa.kanyinda@academiedusalut.cd',
        telephone: '+243 81 234 5678',
        role: 'teacher',
        ecole_id: '64c583de-e9e2-456b-8942-164656544661',
        active: true,
        actif: true,
        specialite: 'STEM / Math-Physique & TICE',
        assigned_class_ids: ['730145b3-b30f-4aff-b0ab-c7550849d5fe'],
        titulaire_class_ids: ['730145b3-b30f-4aff-b0ab-c7550849d5fe'],
        created_at: '2026-03-01T00:00:00.000Z',
      },
    ],
    quizzes: [],
    courses: [],
    chapitres: [],
    quiz_attachments: {
      'f27f1eec-b8e7-4365-ace7-b9309a4371f0': {
        quiz_id: 'cb436cdb-c816-4183-91c5-b5cc4c9fce80',
        quiz_titre: 'Quiz QCM 10 questions (Primaire - Mix)',
        chapitre_id: 'f27f1eec-b8e7-4365-ace7-b9309a4371f0',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37139',
        updated_at: new Date().toISOString(),
      },
    },
    updated_at: new Date().toISOString(),
  };
}

function readStore(): SyncStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SYNC_FILE)) {
      const initial = getInitialStore();
      fs.writeFileSync(SYNC_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(SYNC_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur lecture sync store:', err);
    return getInitialStore();
  }
}

function writeStore(store: SyncStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    store.updated_at = new Date().toISOString();
    fs.writeFileSync(SYNC_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur écriture sync store:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const store = readStore();

    if (type === 'teachers') {
      return NextResponse.json({ success: true, data: store.teachers }, { headers: NO_CACHE_HEADERS });
    }
    if (type === 'quizzes') {
      return NextResponse.json({ success: true, data: store.quizzes }, { headers: NO_CACHE_HEADERS });
    }
    if (type === 'courses') {
      return NextResponse.json({ success: true, data: store.courses }, { headers: NO_CACHE_HEADERS });
    }
    if (type === 'chapitres') {
      return NextResponse.json({ success: true, data: store.chapitres }, { headers: NO_CACHE_HEADERS });
    }
    if (type === 'attachments' || type === 'quiz_attachments') {
      return NextResponse.json({ success: true, data: store.quiz_attachments }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, data: store }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const store = readStore();

    switch (action) {
      case 'save_teacher': {
        const teacher = payload;
        if (!teacher || !teacher.id) {
          return NextResponse.json({ success: false, error: 'Données enseignant invalides' }, { status: 400 });
        }
        const existingIdx = store.teachers.findIndex((t) => t.id === teacher.id || (teacher.email && t.email === teacher.email));
        if (existingIdx >= 0) {
          store.teachers[existingIdx] = { ...store.teachers[existingIdx], ...teacher };
        } else {
          store.teachers.unshift(teacher);
        }
        writeStore(store);
        return NextResponse.json({ success: true, data: teacher, count: store.teachers.length });
      }

      case 'delete_teacher': {
        const { id } = payload;
        store.teachers = store.teachers.filter((t) => t.id !== id);
        writeStore(store);
        return NextResponse.json({ success: true, count: store.teachers.length });
      }

      case 'save_quiz': {
        const quiz = payload;
        if (!quiz || !quiz.id) {
          return NextResponse.json({ success: false, error: 'Données quiz invalides' }, { status: 400 });
        }
        const existingIdx = store.quizzes.findIndex((q) => q.id === quiz.id);
        if (existingIdx >= 0) {
          store.quizzes[existingIdx] = { ...store.quizzes[existingIdx], ...quiz };
        } else {
          store.quizzes.unshift(quiz);
        }

        // Si le quiz est rattaché à un chapitre/leçon, mettre à jour la table de liaison
        if (quiz.chapitre_id) {
          store.quiz_attachments[quiz.chapitre_id] = {
            quiz_id: quiz.id,
            quiz_titre: quiz.titre,
            chapitre_id: quiz.chapitre_id,
            cours_id: quiz.cours_id,
            updated_at: new Date().toISOString(),
          };
        }
        writeStore(store);
        return NextResponse.json({ success: true, data: quiz, count: store.quizzes.length });
      }

      case 'delete_quiz': {
        const { id } = payload;
        store.quizzes = store.quizzes.filter((q) => q.id !== id);
        // Supprimer aussi toute liaison
        Object.keys(store.quiz_attachments).forEach((chId) => {
          if (store.quiz_attachments[chId].quiz_id === id) {
            delete store.quiz_attachments[chId];
          }
        });
        writeStore(store);
        return NextResponse.json({ success: true });
      }

      case 'attach_quiz': {
        const { quiz_id, quiz_titre, chapitre_id, cours_id } = payload;
        if (!quiz_id || !chapitre_id) {
          return NextResponse.json({ success: false, error: 'quiz_id et chapitre_id requis' }, { status: 400 });
        }
        store.quiz_attachments[chapitre_id] = {
          quiz_id,
          quiz_titre: quiz_titre || 'Évaluation',
          chapitre_id,
          cours_id,
          updated_at: new Date().toISOString(),
        };

        // Mettre à jour également l'objet quiz correspondant s'il existe
        const targetQuiz = store.quizzes.find((q) => q.id === quiz_id);
        if (targetQuiz) {
          targetQuiz.chapitre_id = chapitre_id;
          if (cours_id) targetQuiz.cours_id = cours_id;
        }

        writeStore(store);
        return NextResponse.json({ success: true, attachment: store.quiz_attachments[chapitre_id] });
      }

      case 'detach_quiz': {
        const { chapitre_id, quiz_id } = payload;
        if (chapitre_id && store.quiz_attachments[chapitre_id]) {
          delete store.quiz_attachments[chapitre_id];
        }
        if (quiz_id) {
          Object.keys(store.quiz_attachments).forEach((chId) => {
            if (store.quiz_attachments[chId].quiz_id === quiz_id) {
              delete store.quiz_attachments[chId];
            }
          });
          const targetQuiz = store.quizzes.find((q) => q.id === quiz_id);
          if (targetQuiz) {
            targetQuiz.chapitre_id = null;
          }
        }
        writeStore(store);
        return NextResponse.json({ success: true });
      }

      case 'save_course': {
        const course = payload;
        if (!course || !course.id) {
          return NextResponse.json({ success: false, error: 'Données cours invalides' }, { status: 400 });
        }
        const existingIdx = store.courses.findIndex((c) => c.id === course.id);
        if (existingIdx >= 0) {
          store.courses[existingIdx] = { ...store.courses[existingIdx], ...course };
        } else {
          store.courses.unshift(course);
        }
        writeStore(store);
        return NextResponse.json({ success: true, data: course });
      }

      case 'save_chapter': {
        const chapter = payload;
        if (!chapter || !chapter.id) {
          return NextResponse.json({ success: false, error: 'Données chapitre invalides' }, { status: 400 });
        }
        const existingIdx = store.chapitres.findIndex((c) => c.id === chapter.id);
        if (existingIdx >= 0) {
          store.chapitres[existingIdx] = { ...store.chapitres[existingIdx], ...chapter };
        } else {
          store.chapitres.unshift(chapter);
        }
        writeStore(store);
        return NextResponse.json({ success: true, data: chapter });
      }

      case 'reset_data': {
        const resetStore = getInitialStore();
        writeStore(resetStore);
        return NextResponse.json({ success: true, data: resetStore });
      }

      default:
        return NextResponse.json({ success: false, error: `Action inconnue: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
