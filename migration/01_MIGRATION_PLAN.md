# Plan de Migration d'Administration : Angular / Ionic (`a_mec`) vers Next.js + TanStack Query

## 🎯 Executive Summary & Objectives

Ce document décrit le plan stratégique et technique pour la refonte et la migration de la plateforme d'administration **E-RDC / A_MEC** (`a_mec`) vers une architecture moderne basée sur **Next.js 15 (App Router)** et **TanStack Query v5 (`@tanstack/react-query`)**.

### Objectifs Principaux
1. **Remplacement d'Angular 14 / Ionic 6** : Migrer vers Next.js 15 (React 19) pour offrir des performances optimales, un rendu hybride (SSR / Client) et une expérience utilisateur desktop/mobile haut de gamme.
2. **Harmonisation de la Base de Données Supabase** : Aligner toutes les requêtes SQL/RPC de l'administration sur le schéma PostgreSQL consolidé et unifié utilisé par l'application mobile (`newmec` / `E-RDC`).
3. **Data Fetching Robuste avec TanStack Query v5** : Remplacer les abonnements manuels RxJS / Services Angular par un caching intelligent, des requêtes optimistes, du retry automatique et de la revalidation en arrière-plan.
4. **Interface Utilitaire & Design Système** : Adopter **Tailwind CSS v4** et **Shadcn UI** (avec `react-native-heroicons` / `lucide-react`) pour une interface d'administration épurée, rapide, sans surcharge inutile.

---

## 🔍 Diagnostic du Projet Source (`a_mec`)

L'analyse du code source d'Angular/Ionic `a_mec` révèle l'organisation suivante :

| Module Angular (`a_mec`) | Composants & Responsabilités | Routes Angular Source | Route Next.js Cible (`src/app/`) |
| :--- | :--- | :--- | :--- |
| **LoginModule** | Connexion administrateurs & enseignants via Supabase Auth | `/login` | `/login` |
| **MecmPage** | Layout principal (Sidebar, En-tête, Navigation) | `/app` | `/(dashboard)/layout.tsx` |
| **HomePage** | Tableau de bord principal, cartes statistiques, graphiques de suivi | `/app/dash` | `/(dashboard)/page.tsx` |
| **AdminWorld** | Gestion des enseignants, élèves, parents et écoles (`Ecole`) | `/app/all-teachers`, `/app/teachers/:id`, `/app/all-students`, `/app/all-parents` | `/(dashboard)/admin/teachers/page.tsx`, `/students`, `/parents`, `/schools` |
| **TeacherWorld** | Création et gestion des Cours, Leçons/Chapitres et Quizzes (Quill Editor) | `/app/all-cours`, `/app/new-cours`, `/app/quiz`, `/app/new-quiz` | `/(dashboard)/teacher/courses/page.tsx`, `/courses/new`, `/quizzes`, `/quizzes/new` |
| **ParentPayment** | Historique des paiements mobile money (Twiga Paie) et suivi financier | `/app/parent-payment` | `/(dashboard)/admin/payments/page.tsx` |
| **ChatLog** | Journal des conversations et messagerie temps réel enseignants/élèves/parents | `/app/chat-log` | `/(dashboard)/chat/page.tsx` |
| **Settings** | Configuration du profil et paramètres système | `/app/settings` | `/(dashboard)/settings/page.tsx` |

---

## 🏗️ Architecture Cible : Next.js 15 + TanStack Query

### Stack Technique Choisie
- **Framework** : Next.js 15 (App Router) + TypeScript Strict
- **Data Fetching & Cache** : TanStack Query v5 (`@tanstack/react-query`)
- **Backend & Auth** : Supabase PostgreSQL (`@supabase/ssr` & `@supabase/supabase-js`)
- **Styles & UI** : Tailwind CSS v4 + Shadcn UI + Lucide React / Heroicons
- **Formulaires & Validation** : React Hook Form + Zod
- **Éditeur Rich Text** : Tiptap (Remplacement moderne de Quill JS)
- **Graphiques** : Recharts

---

## 🚀 Plan d'Exécution de la Migration (5 Étapes)

### Étape 1 : Initialisation de l'Espace Migration & Types
- [x] Analyse et mappage du schéma de base de données legacy (`Users`, `Students`, `Matiere`, `courses`) vers le schéma consolidé (`profiles`, `eleves`, `matieres`, `cours`, `chapitres`, `quiz`, `paiements`).
- [x] Génération des déclarations de types TypeScript strictes (`database.types.ts`).
- [x] Configuration du client Supabase SSR (`client.ts`, `server.ts`) et du Provider React Query.

### Étape 2 : Remplacement du Module d'Authentification & Layout
- Création de la page `/login` avec Server Actions Supabase.
- Mise en place du layout racine d'administration `(dashboard)/layout.tsx` avec Sidebar responsive, basculement de rôle (Admin / Enseignant) et gestion de session SSR.

### Étape 3 : Migration du Module "Admin World"
- **Gestion des Écoles (`/admin/schools`)** : Liste des écoles, attribution des administrateurs.
- **Gestion des Enseignants (`/admin/teachers`)** : Table filtrable par nom, sexe, statut actif/inactif, discipline.
- **Gestion des Élèves & Classes (`/admin/students`)** : Génération des codes d'accès uniques pour les élèves et liaison avec leurs parents.
- **Suivi des Paiements (`/admin/payments`)** : Validation et suivi des transactions Mobile Money (Twiga Paie).

### Étape 4 : Migration du Module "Teacher World"
- **Gestion des Cours & Chapitres (`/teacher/courses`)** : Création hiérarchique (Matière -> Classe -> Cours -> Chapitre/Leçon).
- **Constructeur de Quizzes (`/teacher/quizzes/new`)** : Éditeur interactif avec support de questions à choix multiples, réponses correctes/incorrectes et prévisualisation instantanée.

### Étape 5 : Messagerie Temps Réel & Finalisation
- **Chat & Logs (`/chat`)** : Synchronisation temps réel via les canaux Supabase Realtime (`chatlog` & `chat_messages`).
- **Tableau de Bord Analytics (`/dashboard`)** : Cartes récapitulatives et graphiques Recharts (Taux de réussite aux quiz, inscriptions d'élèves, paiements reçus).
- Recette complète et tests d'intégration avec l'application mobile `E-RDC`.
