# Audit & Cartographie des Plugins Legacy (`a_mec`) vers Next.js 15 / React 19

Ce document recense l'intégralité des dépendances et plugins utilisés dans l'application legacy Angular 14 / Ionic 6 (`a_mec`), et définit leurs équivalents modernes conservant 100% des fonctionnalités.

---

## 📦 Tableau de Correspondance des Plugins & Bibliothèques

| Plugin Legacy Angular / Ionic | Rôle dans `a_mec` | Équivalent Modernisé Next.js 15 / React 19 | Statut & Notes d'Intégration |
| :--- | :--- | :--- | :--- |
| **`@swimlane/ngx-datatable`** (v20) | Tables de données interactives (Enseignants, Élèves, Parents) avec filtres, tri et pagination | **`@tanstack/react-table` (v8) + Shadcn UI Table** | Performance nettement supérieure, gestion fluide des colonnes, responsive et personnalisable via Tailwind CSS. |
| **`quill`** & **`quill-better-table`** | Éditeur Rich Text pour la création des leçons et des questions de quiz | **Tiptap (`@tiptap/react`)** ou **React-Quill / Quill v2** | Tiptap offre un support natif de React 19, gestion propre des tableaux HTML et du formatage sans bugs d'hydratation SSR. |
| **`apexcharts`** & **`ng-apexcharts`** | Graphiques statistiques du tableau de bord (statistiques de fréquentation, taux de réussite) | **`react-apexcharts`** ou **`recharts`** | `react-apexcharts` permet de réutiliser directement les configurations JSON d'ApexCharts du fichier `chart.component.ts`. |
| **`ionicons`** (v7) | Jeu d'icônes vectorielles Ionic | **`lucide-react`** + **`react-native-heroicons`** | Alignement complet avec la charte graphique globale E-RDC. |
| **`@ionic/angular`** | Composants UI mobiles (Cards, Modals, Toasts, Alerts, Badges) | **Shadcn UI + Radix Primitives** | Composants légers, sans surcharge CSS Ionic, parfaitement intégrés à Tailwind CSS. |
| **`@supabase/supabase-js`** | SDK Supabase Auth & Firestore/Database | **`@supabase/supabase-js` + `@supabase/ssr`** | Support complet des Server Components Next.js 15, Server Actions et rafraîchissement automatique des tokens via Middleware. |
| **`@capacitor/core`** & plugins | Shell Hybride Mobile | **Next.js PWA / Capacitor Web Wrapper** | Pour le portail d'administration web, Next.js offre une Web App instantanée. |

---

## 🛠️ Configuration des Dépendances Npm pour le Projet Cible

Toutes les dépendances ont été agrégées dans le fichier `migration/package.json` :

```json
{
  "dependencies": {
    "next": "15.1.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.48.1",
    "@tanstack/react-query": "^5.66.0",
    "@tanstack/react-table": "^8.20.6",
    "@tiptap/react": "^2.11.5",
    "@tiptap/starter-kit": "^2.11.5",
    "react-apexcharts": "^1.7.0",
    "apexcharts": "^3.52.0",
    "lucide-react": "^0.475.0",
    "recharts": "^2.15.1"
  }
}
```
