# AGENTS.md — Directives & Contexte du Projet E-RDC (Mon Espace Classe / A_MEC)

Ce fichier est automatiquement injecté dans les instructions de l'agent IA à chaque démarrage de conversation pour garantir une continuité parfaite.

---

## 🎯 Présentation & Objectif du Projet

**E-RDC (Mon Espace Classe - A_MEC)** est une application mobile éducative (React Native / Expo) destinée aux élèves, enseignants et administrateurs scolaires en République Démocratique du Congo (RDC).
L'application permet :
- Aux **élèves** d'accéder à leurs cours, leçons, révisions et quiz de préparation aux examens d'État (TENAFEP & EXETAT), même en mode déconnecté.
- Aux **enseignants & administrateurs** de gérer leurs classes, suivre la progression des élèves et publier du contenu pédagogique.

---

## 🛠️ Stack Technique & Architecture

- **Framework Mobile** : React Native avec **Expo Router** (`src/app/`).
- **Language** : TypeScript strict.
- **Base de données & Backend** : **Supabase PostgreSQL** avec Row Level Security (RLS) & Auth.
- **Data Fetching & Cache** : TanStack Query v5 (`@tanstack/react-query`).
- **Icônes & UI** : `react-native-heroicons` (solid & outline) pour une interface moderne et homogène sans émojis textuels bruts dans la navigation.
- **Formes & Rendu** : StyleSheets natifs React Native + composants modulaires (`src/components/`).

---

## 📋 Directives & Règles pour l'Agent IA

1. **Priorité absolue aux exigences utilisateur & ROADMAP** :
   - Se référer au fichier `ROADMAP.md` situé à la racine pour connaître la phase active du développement et les fonctionnalités restantes.
2. **Qualité Visuelle & Ergonomie** :
   - Utiliser systématiquement les icônes vectorielles (`react-native-heroicons`) pour les boutons, titres et indicateurs.
   - Conserver les palettes de couleurs chaleureuses et professionnelles (Teal `#008080`, Terracotta `#c86b43`, Gold `#facc15`, Warm Gray `#f8fafc`).
3. **Gestion des Données & Fallbacks** :
   - En cas d'indisponibilité réseau ou de données Supabase optionnelles, assurer un mode hors-ligne fluide avec des fallbacks élégants.
4. **Vérification du Code** :
   - Toujours compiler et vérifier l'application via `compile_applet` après toute modification importante.

---

## 📍 Feuille de Route Résumée (ROADMAP)

- [x] **Phase 1** : Structure Expo / React Native, Auth Supabase & Navigation Élève.
- [x] **Phase 2** : Espace Élève, Cours, Chapitres, Leçons & Quiz TENAFEP/EXETAT.
- [ ] **Phase 3** : Espace Enseignant (`teacher-world`) & Administration (`admin-world`).
- [ ] **Phase 4** : Messagerie temps réel, Suivi des paiements parents (Mobile Money) & Notifications Push.
