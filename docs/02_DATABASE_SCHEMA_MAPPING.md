# Correspondance et Alignment des Schémas de Base de Données

## 📊 Synthèse des Différences entre `a_mec` (Legacy) et `E-RDC` (Consolidé)

Dans l'ancienne application Angular `a_mec`, certaines requêtes utilisaient des noms de tables en PascalCase ou en anglais. Dans le schéma consolidé Supabase d'**E-RDC** (`newmec`), la nomenclature a été unifiée en français snake_case avec sécurité niveau ligne (RLS) et clés étrangères indexées.

---

## 🔄 Table de Correspondance Complète

| Domaine | Ancienne Table (`a_mec`) | Nouvelle Table Consolidée (`newmec`) | Modifications & Points d'Attention |
| :--- | :--- | :--- | :--- |
| **Utilisateurs / Profils** | `Users` | `profiles` | `role` enum (`super_admin`, `admin`, `teacher`, `parent`). Lié à `auth.users(id)`. |
| **Élèves** | `Students` | `eleves` | Lié à `parent_id` (`profiles.id`) et `classe_id`. Utilise `pseudonyme` et `code_acces` unique. |
| **Écoles** | `Ecole` | `ecoles` | Contient `nom`, `rccm`, `id_nat`, `admin_id`. |
| **Classes & Niveaux** | `Classes` | `classes`, `niveaux`, `options` | Structure normalisée : `niveau_id`, `option_id`, `vacation`, `titulaire_id`. |
| **Matières / Disciplines**| `Matiere` | `matieres`, `matiere_branches` | Contient `nom`, `code`, `description`. |
| **Cours** | `courses` | `cours` | Champs : `matiere_id`, `classe_id`, `enseignant_id`, `titre`, `description`, `is_published`. |
| **Leçons / Chapitres** | `lessons` | `chapitres` | Champs : `cours_id`, `titre`, `contenu`, `duree_minutes`, `position`, `audio_url`, `pdf_url`. |
| **Quizzes** | `Quiz` | `quiz` | Le champ `quiz` ou `questions` stocke désormais la structure JSON validée : `{ question, correct_answer, incorrect_answers }`. |
| **Tentatives de Quiz** | *(Absent dans a_mec)* | `quiz_attempts` | Stocke les scores et réponses des élèves pour les statistiques admin (`score`, `total_questions`, `reussi`). |
| **Paiements** | `payment_history` | `paiements` | Champs : `order_id`, `parent_id`, `eleve_id`, `montant`, `devise`, `mode_paiement`, `statut`, `reference_twiga`. |
| **Messagerie & Chat** | `chatlog` | `chatlog` & `chat_messages` | Structure de canaux temps réel pour le suivi des discussions parents/enseignants. |

---

## 🛠️ Script SQL de Migration & Vues de Compatibilité

Afin de permettre une transition sans interruption pendant la phase de migration, vous pouvez exécuter le script SQL suivant dans votre console Supabase. Il crée des vues de compatibilité si nécessaire ou effectue la migration automatique des données legacy :

```sql
-- ====================================================================
-- SCRIPT DE MIGRATION & ADAPTATION DU SCHÉMA
-- Ce script synchronise l'ancien schéma a_mec avec le schéma final E-RDC
-- ====================================================================

-- 1. Migration de la table Users vers profiles
INSERT INTO public.profiles (id, user_id, nom_complet, role, ecole_id, created_at)
SELECT 
    COALESCE(id, gen_random_uuid()), 
    user_id, 
    COALESCE(names, email), 
    CASE 
        WHEN role = 'admin' THEN 'admin'::varchar
        WHEN role = 'teacher' THEN 'teacher'::varchar
        WHEN role = 'parent' THEN 'parent'::varchar
        ELSE 'teacher'::varchar
    END,
    ecole_id,
    COALESCE(created_at, now())
FROM public."Users"
ON CONFLICT (id) DO NOTHING;

-- 2. Migration de Students vers eleves
INSERT INTO public.eleves (id, parent_id, classe_id, pseudonyme, code_acces, created_at)
SELECT 
    COALESCE(id, gen_random_uuid()),
    parent_id,
    classe_id,
    COALESCE(pseudonyme, names, 'Eleve_' || substr(md5(random()::text), 1, 6)),
    COALESCE(code_acces, upper(substr(md5(random()::text), 1, 8))),
    COALESCE(created_at, now())
FROM public."Students"
ON CONFLICT (id) DO NOTHING;

-- 3. Migration des courses vers cours
INSERT INTO public.cours (id, matiere_id, classe_id, enseignant_id, titre, description, is_published, created_at)
SELECT 
    COALESCE(id, gen_random_uuid()),
    matiere_id,
    classe_id,
    teacher_id,
    COALESCE(title, 'Cours sans titre'),
    content,
    true,
    COALESCE(created_at, now())
FROM public."courses"
ON CONFLICT (id) DO NOTHING;

-- 4. Vue de compatibilité pour payment_history -> paiements
CREATE OR REPLACE VIEW public.payment_history AS
SELECT 
    id,
    order_id,
    parent_id,
    eleve_id,
    montant,
    devise,
    mode_paiement,
    statut,
    reference_twiga,
    created_at
FROM public.paiements;
```
