# 🚀 ROADMAP - Projet A_MEC (Mon Espace Classe)

## 📍 Phase 1 : Consolidation du Cœur (Core & Auth)
- [x] Structure de projet Angular 18 / Ionic 8 / Capacitor 6.
- [x] Service d'authentification Supabase (`AuthGuard`, `AuthService`).
- [ ] Stabilisation de la persistance locale et de la gestion du cache hors-ligne (`cache.service.ts`).

## 📍 Phase 2 : Espace Élève & Contenus
- [x] Navigation par matières et modules de cours (`mecm/home`).
- [ ] Suivi de progression et génération de statistiques visuelles (`ApexCharts`).
- [ ] Mode révision et passage des Quiz TENAFEP / EXETAT en mode déconnecté.

## 📍 Phase 3 : Espaces Enseignant & Admin
- [x] Maquette des interfaces `teacher-world` et `admin-world`.
- [ ] Gestion des classes, devoirs et suivi des élèves par l'enseignant.
- [ ] Tableau de bord administratif pour la supervision globale de l'établissement.

## 📍 Phase 4 : Communication & Monétisation
- [x] Service de messagerie en temps réel (`realtime-chat.service.ts`).
- [ ] Intégration complète des paiements parents via Mobile Money (`twiga-paie.service.ts`).
- [ ] Notifications push pour les alertes de cours et rappels de devoirs (`Firebase`).
