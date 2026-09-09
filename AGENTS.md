# AGENTS.md — Directives & Contexte du Projet E-RDC (Mon Espace Classe / A_MEC)

Ce fichier est automatiquement injecté dans les instructions de l'agent IA à chaque démarrage de conversation pour garantir une continuité parfaite.

---

## 🎯 Présentation & Objectif du Projet

**E-RDC (Mon Espace Classe - A_MEC)** est une plateforme éducative web moderne destinée aux élèves, enseignants et administrateurs scolaires en République Démocratique du Congo (RDC).
L'application permet :
- Aux **élèves** d'accéder à leurs cours, leçons, révisions et quiz de préparation aux examens d'État (TENAFEP & EXETAT).
- Aux **enseignants & administrateurs** de gérer leurs classes, suivre la progression des élèves et publier du contenu pédagogique.

---

## 🛠️ Stack Technique & Architecture

- **Framework Web** : Next.js 15 (App Router).
- **Language** : TypeScript strict.
- **Interface & Rendu** : React 19, Tailwind CSS v4, Lucide React (Icônes).
- **Base de données & Backend** : **Supabase PostgreSQL** avec Row Level Security (RLS) & Auth.
- **Data Fetching & Cache** : TanStack Query v5 (`@tanstack/react-query`).
- **Formes & Rendu** : Composants modulaires (`src/components/`).

---

## 📋 Directives & Règles pour l'Agent IA

1. **Priorité absolue aux exigences utilisateur & ROADMAP** :
   - Se référer au fichier `ROADMAP.md` situé à la racine pour connaître la phase active du développement et les fonctionnalités restantes.
2. **Qualité Visuelle & Ergonomie** :
   - Utiliser systématiquement les icônes vectorielles (`lucide-react`) pour les boutons, titres et indicateurs.
   - Conserver les palettes de couleurs chaleureuses et professionnelles (Teal `#008080`, Terracotta `#c86b43`, Gold `#facc15`, Warm Gray `#f8fafc`).
3. **Gestion des Données & Fallbacks** :
   - Gérer les erreurs et les fallbacks élégants en cas de données manquantes depuis Supabase.
4. **Vérification du Code** :
   - Toujours vérifier l'application (build, lint) après toute modification importante.

---

## 📍 Feuille de Route Résumée (ROADMAP)

- [x] **Phase 1** : Structure Next.js, Auth Supabase & Navigation Élève.
- [x] **Phase 2** : Espace Élève, Cours, Chapitres, Leçons & Quiz TENAFEP/EXETAT.
- [ ] **Phase 3** : Espace Enseignant (`teacher-world`) & Administration (`admin-world`).
- [ ] **Phase 4** : Messagerie temps réel, Suivi des paiements parents (Mobile Money) & Notifications Push.
