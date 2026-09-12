# Comptes Utilisateurs & Propriétaires du Système E-RDC (Mon Espace Classe)

Ce document répertorie les différents comptes utilisateurs, rôles, identifiants réels Supabase et privilèges d'accès au portail éducatif **E-RDC (Académie du Salut - Kinshasa, RDC)**.

---

## 1. Super Administrateur / Direction Générale
- **Nom complet** : Super Administrateur ADS
- **Rôle** : `super_admin` / `admin`
- **Email** : `admin@defmaks.com`
- **Mot de passe** : `azerty`
- **Identifiant Supabase (UID)** : `67d40833-6046-4f68-a929-4beb974876c2`
- **Statut d'authentification** : Actif & Vérifié (`email_verified: true`)
- **Établissement rattaché** : Académie du Salut (`64c583de-e9e2-456b-8942-164656544661`)
- **Périmètre & Permissions** :
  - Accès complet au tableau de bord de direction (`/`)
  - Gestion des inscriptions élèves (`/admin/students`)
  - Gestion du corps professoral (`/admin/teachers`)
  - Gestion des classes et niveaux (`/admin/classes`)
  - Suivi des paiements Mobile Money Twiga Pay (`/admin/payments`)
  - Configuration globale de l'établissement

---

## 2. Corps Professoral (Enseignant)
- **Nom complet** : Prof. Shasa Kanyinda
- **Rôle** : `teacher`
- **Email** : `mec@defmaks.com`
- **Mot de passe** : `azerty`
- **Identifiant Supabase (UID)** : `b6416211-0e05-4432-85e9-c5b3b243e543`
- **Statut d'authentification** : Actif & Vérifié (`email_verified: true`)
- **Établissement rattaché** : Académie du Salut
- **Affectations pédagogiques** :
  - **Classe titulaire** : 1ère Primaire (`2999e235-9f5b-4b1a-85d7-0131495c2ecb`)
  - **Matières dispensées** : Éveil Scientifique, Français / Lecture, Mathématiques & STEM
- **Périmètre & Permissions** :
  - Espace de gestion des cours (`/teacher/courses`)
  - Rédaction et publication de leçons avec éditeur riche TipTap
  - Médiathèque pédagogique AVIF / WebP
  - Création de Quiz QCM (format 10 questions TENAFEP / EXETAT)
  - Suivi des tentatives et notes des élèves de ses classes

---

## 3. Espace Parents / Tuteurs Légaux
- **Nom complet** : Famille Mukendi (Parent Tuteur Référent)
- **Rôle** : `parent`
- **Email** : `parent@defmaks.com`
- **Identifiant Supabase (UID)** : `c27a29c5-91b7-4d2b-96aa-a6c90a0a8f6f` (profil ID : `ff3f802f-ac54-455d-a660-fc265d220113`)
- **Numéro de téléphone** : `+243 81 000 0000` (Compatible Vodacom M-Pesa, Airtel Money, Orange Money)
- **Élèves à charge (Enfants)** :
  1. **Joe Mukendi** — 1ère Primaire (Matricule: `ADS-2025-0042`)
  2. **Sarah Mukendi** — 3ème Primaire (Matricule: `ADS-2025-0098`)
- **Périmètre & Permissions** :
  - Espace de suivi familial (`/parent/children`)
  - Souscription et renouvellement des codes d'accès numériques via passerelle Mobile Money (`/parent/payments`)
  - Consultation des rapports de progression et scores aux quiz de leurs enfants

---

## 4. Comptes Élèves (Accès par Codes Numériques)
Les élèves disposent d'un identifiant numérique direct sécurisé (Code d'accès) leur permettant de consulter leurs leçons et passer leurs épreuves :

| Élève | Classe | Matricule | Code d'Accès Actif | Statut Forfait |
| :--- | :--- | :--- | :--- | :--- |
| **Joe Mukendi** | 1ère Primaire | `ADS-2025-0042` | `ADS-7842` *(alias: `0123456789`)* | Forfait Annuel (Actif) |
| **Sarah Mukendi** | 3ème Primaire | `ADS-2025-0098` | `ADS-3319` | Forfait Trimestriel (Actif) |

---

## 5. Données de l'Établissement Référent (ADS)
- **Nom officiel** : Académie du Salut (ADS)
- **Identifiant UUID** : `64c583de-e9e2-456b-8942-164656544661`
- **Numéro RCCM** : `CD/KNG/RCCM/20-A-00652`
- **Numéro ID-NAT** : `ID-NAT 01-910-N58634L`
- **Ville / Pays** : Kinshasa, République Démocratique du Congo
- **Contact administratif** : `contact@academiedusalut.cd`
