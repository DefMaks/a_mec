# Architecture de l'Application Next.js 15 & Hooks TanStack Query v5

## 📁 Structure Générale du Projet Next.js (`src/`)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Page d'authentification Administrateur/Enseignant
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Shell principal (Sidebar, UserNav, Header)
│   │   ├── page.tsx                  # Tableau de bord d'accueil & métriques clés
│   │   ├── admin/
│   │   │   ├── teachers/
│   │   │   │   ├── page.tsx          # Gestion des enseignants (Data table, filtres)
│   │   │   │   └── [id]/page.tsx     # Profil et affectations d'un enseignant
│   │   │   ├── students/
│   │   │   │   ├── page.tsx          # Liste des élèves et codes d'accès
│   │   │   │   └── new/page.tsx      # Inscription d'un nouvel élève
│   │   │   ├── parents/
│   │   │   │   └── page.tsx          # Répertoire des parents et enfants associés
│   │   │   ├── schools/
│   │   │   │   └── page.tsx          # Gestion des écoles (Règles, Administrateurs)
│   │   │   └── payments/
│   │   │       └── page.tsx          # Historique et validation des paiements Twiga
│   │   ├── teacher/
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx          # Catalogue des cours de l'enseignant
│   │   │   │   └── new/page.tsx      # Créateur de cours & chapitres
│   │   │   └── quizzes/
│   │   │       ├── page.tsx          # Liste des quizzes publiés
│   │   │       └── new/page.tsx      # Éditeur de Quiz interactif (Multi-questions)
│   │   ├── chat/
│   │   │   └── page.tsx              # Messagerie interactive en temps réel
│   │   └── settings/
│   │       └── page.tsx              # Configuration du profil & mot de passe
│   ├── api/                          # Endpoints API internes si nécessaire
│   └── globals.css                   # Styles Tailwind CSS v4
├── components/
│   ├── ui/                           # Composants Shadcn UI (Button, Dialog, Table, Input...)
│   ├── layout/
│   │   ├── sidebar.tsx               # Barre de navigation latérale
│   │   ├── header.tsx                # Barre supérieure avec notifications et profil
│   │   └── user-nav.tsx              # Menu déroulant utilisateur & déconnexion
│   ├── dashboard/
│   │   ├── stats-cards.tsx           # Cartes d'indicateurs de performance (KPI)
│   │   └── analytics-chart.tsx       # Graphique de suivi Recharts
│   ├── quiz/
│   │   ├── quiz-editor.tsx           # Formulaire dynamique de création de questions
│   │   └── question-card.tsx         # Composant question avec choix multiples
│   └── chat/
│       ├── chat-window.tsx           # Fenêtre de discussion temps réel
│       └── message-item.tsx          # Bulle de message
├── hooks/
│   ├── use-teachers.ts               # Hook TanStack Query pour la gestion des enseignants
│   ├── use-students.ts               # Hook TanStack Query pour la gestion des élèves
│   ├── use-courses.ts                # Hook TanStack Query pour les cours et chapitres
│   ├── use-quizzes.ts                # Hook TanStack Query pour les quizzes
│   ├── use-payments.ts               # Hook TanStack Query pour les transactions
│   └── use-chat.ts                   # Hook Supabase Realtime pour le chat
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Instanciation client du navigateur
│   │   ├── server.ts                 # Instanciation serveur (SSR / Server Actions)
│   │   └── middleware.ts             # Protection des routes par session Supabase
│   ├── query-provider.tsx            # Enrobeur TanStack QueryClientProvider
│   └── utils.ts                      # Utilitaires de formatage et classes Tailwind
└── types/
    └── database.types.ts             # Schéma TypeScript complet de Supabase
```

---

## ⚡ Exemples Concrets de Custom Hooks avec TanStack Query v5

### 1. Hook de Gestion des Enseignants (`src/hooks/use-teachers.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

export function useTeachers(filters?: { name?: string; active?: boolean }) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['teachers', filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, ecoles(nom)')
        .eq('role', 'teacher')
        .order('nom_complet', { ascending: true });

      if (filters?.name) {
        query = query.ilike('nom_complet', `%${filters.name}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Profile[];
    },
    staleTime: 1000 * 60 * 5, // Cache valide pendant 5 minutes
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (newTeacher: Partial<Profile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ ...newTeacher, role: 'teacher' }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}
```

### 2. Hook de Création & Rendu des Quizzes (`src/hooks/use-quizzes.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Quiz } from '@/types/database.types';

export function useQuizzesByCourse(courseId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz')
        .select('*')
        .eq('cours_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data as Quiz[];
    },
    enabled: !!courseId,
  });
}

export function useSaveQuiz() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (quizPayload: Omit<Quiz, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('quiz')
        .insert([quizPayload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.cours_id] });
    },
  });
}
```
