import { CourseItem, ChapterItem } from '@/hooks/use-courses';
import { CoursClasse } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export interface SimulatedQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explication: string;
}

export interface SimulatedCourseDefinition extends CourseItem {
  classe_id: string;
  classe: string;
  enseignant_id: string;
  enseignant_nom: string;
  chapitres: ChapterItem[];
  quizQuestions: SimulatedQuizQuestion[];
}

export const MATIERE_MATHEMATIQUE_ID = '964aa341-a9d3-4613-b269-9dc46663d1a8';
export const MATIERE_MATHEMATIQUE_NOM = 'Mathématiques';

/**
 * Définition exhaustive du programme national RDC de la sous-branche "Mesure"
 * pour le cycle primaire complet : 1ère Primaire à 6ème Primaire (TENAFEP).
 */
export const MESURE_PRIMARY_COURSES: SimulatedCourseDefinition[] = [
  // ==========================================
  // 1ère PRIMAIRE (1P)
  // ==========================================
  {
    id: '0430841f-f4cc-4e3d-977f-91b6adf37139',
    titre: 'Mathématiques - Mesure (1ère Primaire)',
    description:
      'Initiation aux grandeurs : comparaison directe des longueurs, mesures naturelles corporelles (empan, pas), appréciation de la masse (lourd/léger), de la capacité (plein/vide) et découverte de la monnaie congolaise (CDF).',
    matiere_id: MATIERE_MATHEMATIQUE_ID,
    matiere_nom: MATIERE_MATHEMATIQUE_NOM,
    matiere: MATIERE_MATHEMATIQUE_NOM,
    classe_id: '730145b3-b30f-4aff-b0ab-c7550849d5fe',
    classe: '1ère Primaire',
    enseignant_id: 'b6416211-0e05-4432-85e9-c5b3b243e543',
    enseignant_nom: 'Prof. Shasa Kanyinda',
    ecole_id: DEFAULT_SCHOOL_ID,
    created_at: '2026-03-01T08:00:00.000Z',
    chapitres_count: 4,
    chapitres: [
      {
        id: 'c1111111-1111-1111-1111-111111111111',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37139',
        titre: 'Chapitre 1 : Comparer les longueurs (Plus long, plus court, plus grand)',
        ordre: 1,
        position: 1,
        duree_minutes: 25,
        contenu: `<h2>1. Comparaison des Longueurs</h2>
<p>Dans la vie courante, nous comparons les objets qui nous entourent :</p>
<ul>
  <li>Un <b>crayon vert</b> peut être <b>plus long</b> qu'une craie.</li>
  <li>Le <b>mât du drapeau</b> de l'école est <b>plus haut</b> que la porte de la classe.</li>
  <li>Deux lattes identiques sont de <b>même longueur</b>.</li>
</ul>
<h3>Règle d'or :</h3>
<p>Pour comparer correctement deux objets, il faut aligner leurs extrémités sur une même ligne de départ !</p>
<h3>Exercice d'application :</h3>
<p>Prends ton stylo et ta gomme. Pose-les côte à côte sur la table. Lequel est le plus long ?</p>`,
      },
      {
        id: 'c2222222-2222-2222-2222-222222222222',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37139',
        titre: 'Chapitre 2 : Mesurer avec des étalons naturels (Le pas, l\'empan)',
        ordre: 2,
        position: 2,
        duree_minutes: 25,
        contenu: `<h2>2. Mesurer sans règle graduée</h2>
<p>Avant d'apprendre le mètre, nos ancêtres et nous-mêmes utilisions des parties du corps :</p>
<ul>
  <li><b>L'empan</b> : distance entre le bout du pouce et le petit doigt de la main grande ouverte.</li>
  <li><b>Le pas</b> : utilisé dans la cour de l'école pour mesurer la distance entre deux arbres.</li>
  <li><b>La coudée</b> : de la pointe du coude jusqu'au bout du majeur.</li>
</ul>
<p><i>Attention :</i> Comme chaque élève a une main différente, les mesures changent un peu d'un enfant à un autre !</p>`,
      },
      {
        id: 'c3333333-3333-3333-3333-333333333333',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37139',
        titre: 'Chapitre 3 : Notions de masse et de capacité (Lourd, léger, plein, vide)',
        ordre: 3,
        position: 3,
        duree_minutes: 30,
        contenu: `<h2>3. Masse et Capacité</h2>
<h3>A. La Masse :</h3>
<p>Un sac de ciment ou de manioc est <b>lourd</b>, une plume d'oiseau ou un morceau de papier est <b>léger</b>.</p>
<h3>B. La Capacité :</h3>
<p>Un gobelet rempli d'eau potable jusqu'au bord est <b>plein</b>. Quand on boit toute l'eau, il devient <b>vide</b>.</p>
<p>Un grand seau contient <b>plus d'eau</b> qu'une petite bouteille plastique.</p>`,
      },
      {
        id: 'c4444444-1111-1111-1111-111111111111',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37139',
        titre: 'Chapitre 4 : Le temps immédiat et la monnaie congolaise (CDF)',
        ordre: 4,
        position: 4,
        duree_minutes: 30,
        contenu: `<h2>4. Le Temps et la Monnaie en RDC</h2>
<h3>Le Repérage dans la Journée :</h3>
<ul>
  <li><b>Le matin</b> : Le soleil se lève, on prend son petit-déjeuner et on va à l'école.</li>
  <li><b>À midi</b> : Le soleil est au zénith, c'est l'heure de la récréation et du repas.</li>
  <li><b>Le soir et la nuit</b> : Le soleil se couche, on fait ses devoirs et on dort.</li>
</ul>
<h3>La Monnaie Nationale :</h3>
<p>En République Démocratique du Congo, notre monnaie est le <b>Franc Congolais (CDF)</b>. Nous utilisons les billets de 50 FC, 100 FC, 200 FC et 500 FC pour acheter des beignets à la récréation.</p>`,
      },
    ],
    quizQuestions: [
      {
        question: 'Pour savoir quel bâton est le plus long, que doit-on faire ?',
        options: [
          'Les poser n\'importe comment',
          'Aligner leurs extrémités sur la même ligne de départ',
          'Les casser en deux',
          'Fermer les yeux',
        ],
        correctIndex: 1,
        explication: 'L\'alignement sur une même base de départ est indispensable pour comparer fidèlement deux longueurs.',
      },
      {
        question: 'Quelle partie du corps appelle-t-on "l\'empan" ?',
        options: [
          'Le pied entier',
          'La main grande ouverte (du pouce au petit doigt)',
          'La tête',
          'Le genou',
        ],
        correctIndex: 1,
        explication: 'L\'empan est la mesure naturelle de la main ouverte entre le bout du pouce et l\'auriculaire.',
      },
    ],
  },

  // ==========================================
  // 2ème PRIMAIRE (2P)
  // ==========================================
  {
    id: '0430841f-f4cc-4e3d-977f-91b6adf37120',
    titre: 'Mathématiques - Mesure (2ème Primaire)',
    description:
      'Introduction formelle du système métrique : le mètre (m) et le décimètre (dm), le litre (l) et le demi-litre, le kilogramme (kg) et le demi-kilo, le calendrier hebdomadaire/mensuel et calculs simples en Francs Congolais.',
    matiere_id: MATIERE_MATHEMATIQUE_ID,
    matiere_nom: MATIERE_MATHEMATIQUE_NOM,
    matiere: MATIERE_MATHEMATIQUE_NOM,
    classe_id: '840256c4-c41a-4b0c-a1ba-d8661950e601',
    classe: '2ème Primaire',
    enseignant_id: 'e534604c-1863-450c-96d9-f42c32179b2c',
    enseignant_nom: 'Prof. Jean-Marc Ilunga',
    ecole_id: DEFAULT_SCHOOL_ID,
    created_at: '2026-03-01T08:00:00.000Z',
    chapitres_count: 4,
    chapitres: [
      {
        id: 'c2000001-2222-2222-2222-222222222222',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37120',
        titre: 'Chapitre 1 : Le mètre (m) et le décimètre (dm)',
        ordre: 1,
        position: 1,
        duree_minutes: 30,
        contenu: `<h2>1. L'Unité Principale des Longueurs : Le Mètre (m)</h2>
<p>L'unité légale pour mesurer la longueur est le <b>mètre</b>. Son symbole est <b>m</b>.</p>
<p>Le maître utilise une latte jaune de 1 mètre au tableau noir.</p>
<h3>Le Décimètre (dm) :</h3>
<p>Si l'on partage 1 mètre en 10 morceaux égaux, chaque morceau s'appelle un <b>décimètre (dm)</b>.</p>
<div class="p-3 bg-blue-50 border border-blue-200 rounded-lg my-2 font-bold text-blue-900 text-center">
  1 mètre (m) = 10 décimètres (dm)
</div>`,
      },
      {
        id: 'c2000002-2222-2222-2222-222222222222',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37120',
        titre: 'Chapitre 2 : Le litre (l) et le demi-litre',
        ordre: 2,
        position: 2,
        duree_minutes: 30,
        contenu: `<h2>2. Les Mesures de Capacité</h2>
<p>Pour mesurer le volume des liquides (l'eau de boisson, l'huile de palme, le lait), l'unité principale est le <b>litre</b> (symbole : <b>l</b> ou <b>L</b>).</p>
<h3>Le Demi-litre :</h3>
<p>Avec 1 litre de jus, on peut remplir exactement <b>2 bouteilles de demi-litre</b>.</p>
<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg my-2 font-bold text-emerald-900 text-center">
  1 litre = 2 demi-litres (1/2 l + 1/2 l = 1 l)
</div>`,
      },
      {
        id: 'c2000003-2222-2222-2222-222222222222',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37120',
        titre: 'Chapitre 3 : Le kilogramme (kg) et le demi-kilogramme',
        ordre: 3,
        position: 3,
        duree_minutes: 30,
        contenu: `<h2>3. Les Mesures de Masse</h2>
<p>L'unité de référence pour peser les objets solides est le <b>kilogramme</b> (symbole : <b>kg</b>).</p>
<p>Au marché de Matete ou Gambela, maman achète un kilo de sucre ou de poisson salé.</p>
<h3>Équivalence :</h3>
<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg my-2 font-bold text-amber-900 text-center">
  1 kg = 2 demi-kilogrammes
</div>`,
      },
      {
        id: 'c2000004-2222-2222-2222-222222222222',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37120',
        titre: 'Chapitre 4 : La semaine, le mois et la monnaie (500 FC à 1 000 FC)',
        ordre: 4,
        position: 4,
        duree_minutes: 30,
        contenu: `<h2>4. Le Temps et la Monnaie</h2>
<h3>La Semaine :</h3>
<p>Une semaine compte <b>7 jours</b> : Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi et Dimanche.</p>
<h3>Problème d'achat simple :</h3>
<p>Mireille a un billet de 1 000 Francs Congolais. Elle achète un cahier qui coûte 600 FC. Combien de monnaie le vendeur doit-il lui rendre ?</p>
<p><b>Solution :</b> 1 000 FC - 600 FC = <b>400 FC</b> de monnaie rendue.</p>`,
      },
    ],
    quizQuestions: [
      {
        question: 'Combien de décimètres (dm) trouve-t-on dans 1 mètre (m) ?',
        options: ['2 décimètres', '5 décimètres', '10 décimètres', '100 décimètres'],
        correctIndex: 2,
        explication: '1 mètre = 10 décimètres (déci signifie dixième partie).',
      },
      {
        question: 'Combien de bouteilles d\'un demi-litre peut-on remplir avec 1 litre d\'eau ?',
        options: ['1 bouteille', '2 bouteilles', '4 bouteilles', '10 bouteilles'],
        correctIndex: 1,
        explication: '1 litre = 2 demi-litres (1/2 + 1/2 = 1).',
      },
    ],
  },

  // ==========================================
  // 3ème PRIMAIRE (3P)
  // ==========================================
  {
    id: '0430841f-f4cc-4e3d-977f-91b6adf37130',
    titre: 'Mathématiques - Mesure (3ème Primaire)',
    description:
      'Approfondissement du système métrique : sous-multiples du mètre (dm, cm, mm), du litre (dl, cl, ml) et du kilogramme (le gramme g). Lecture de l\'heure sur horloge et problèmes de commerce pratique.',
    matiere_id: MATIERE_MATHEMATIQUE_ID,
    matiere_nom: MATIERE_MATHEMATIQUE_NOM,
    matiere: MATIERE_MATHEMATIQUE_NOM,
    classe_id: '951367d5-d52b-4c1d-b2cb-e9772061f712',
    classe: '3ème Primaire',
    enseignant_id: 'f645715d-2974-561d-a7e0-f53d4328ac54',
    enseignant_nom: 'Prof. Marie-Claire Tshisekedi',
    ecole_id: DEFAULT_SCHOOL_ID,
    created_at: '2026-03-01T08:00:00.000Z',
    chapitres_count: 5,
    chapitres: [
      {
        id: 'c3000001-3333-3333-3333-333333333333',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37130',
        titre: 'Chapitre 1 : Sous-multiples du mètre : dm, cm, mm et tracé précis',
        ordre: 1,
        position: 1,
        duree_minutes: 35,
        contenu: `<h2>1. Les Sous-Multiples du Mètre</h2>
<table class="w-full text-left border-collapse border border-slate-300 text-sm my-2">
  <thead>
    <tr class="bg-slate-100 font-bold">
      <th class="border p-2">Mètre (m)</th>
      <th class="border p-2">Décimètre (dm)</th>
      <th class="border p-2">Centimètre (cm)</th>
      <th class="border p-2">Millimètre (mm)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border p-2 text-center font-bold text-blue-600">1</td>
      <td class="border p-2 text-center">10</td>
      <td class="border p-2 text-center">100</td>
      <td class="border p-2 text-center">1 000</td>
    </tr>
  </tbody>
</table>
<p>Sur votre petite règle d'écolier de 30 cm, chaque petit intervalle numéroté vaut 1 centimètre (cm) et chaque tout petit trait vaut 1 millimètre (mm).</p>`,
      },
      {
        id: 'c3000002-3333-3333-3333-333333333333',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37130',
        titre: 'Chapitre 2 : Sous-multiples du litre : dl, cl, ml',
        ordre: 2,
        position: 2,
        duree_minutes: 35,
        contenu: `<h2>2. Les Sous-Multiples du Litre</h2>
<p>Pour doser les médicaments (sirop) ou servir un verre de boisson gazeuse, on utilise les sous-multiples du litre :</p>
<ul>
  <li><b>1 litre = 10 décilitres (dl)</b></li>
  <li><b>1 litre = 100 centilitres (cl)</b> (Une bouteille de soda standard fait souvent 30 cl ou 33 cl).</li>
  <li><b>1 litre = 1 000 millilitres (ml)</b></li>
</ul>`,
      },
      {
        id: 'c3000003-3333-3333-3333-333333333333',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37130',
        titre: 'Chapitre 3 : Le kilogramme et le gramme (1 kg = 1 000 g)',
        ordre: 3,
        position: 3,
        duree_minutes: 35,
        contenu: `<h2>3. Le Kilogramme et le Gramme</h2>
<div class="p-3 bg-purple-50 border border-purple-200 rounded-lg my-2 font-bold text-purple-900 text-center">
  1 kg = 1 000 grammes (g)
</div>
<ul>
  <li>Un paquet de 500 g = 1/2 kg.</li>
  <li>Un paquet de 250 g = 1/4 de kg.</li>
</ul>`,
      },
      {
        id: 'c3000004-3333-3333-3333-333333333333',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37130',
        titre: 'Chapitre 4 : La lecture de l\'heure : heures, demi-heure, quart d\'heure',
        ordre: 4,
        position: 4,
        duree_minutes: 35,
        contenu: `<h2>4. Lecture de l'Horloge</h2>
<p>Une journée compte <b>24 heures</b>. Une heure compte <b>60 minutes</b>.</p>
<ul>
  <li>La <b>petite aiguille</b> indique les heures.</li>
  <li>La <b>grande aiguille</b> indique les minutes.</li>
  <li>Quand la grande aiguille est sur le 6 : c'est la <b>demie</b> (30 minutes).</li>
  <li>Quand elle est sur le 3 : c'est <b>et quart</b> (15 minutes).</li>
</ul>`,
      },
      {
        id: 'c3000005-3333-3333-3333-333333333333',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37130',
        titre: 'Chapitre 5 : Problèmes marchands : Dépense, bénéfice et monnaie rendue',
        ordre: 5,
        position: 5,
        duree_minutes: 35,
        contenu: `<h2>5. Problèmes d'Achats et de Vente</h2>
<p>Kapinga achète 3 stylos à 500 FC l'unité et un cahier à 1 200 FC. Elle donne un billet de 5 000 FC au commerçant.</p>
<p><b>1. Dépense pour les stylos :</b> 3 × 500 FC = 1 500 FC.</p>
<p><b>2. Dépense totale :</b> 1 500 FC + 1 200 FC = 2 700 FC.</p>
<p><b>3. Monnaie rendue :</b> 5 000 FC - 2 700 FC = <b>2 300 FC</b>.</p>`,
      },
    ],
    quizQuestions: [
      {
        question: 'Combien de centimètres compte 1 mètre ?',
        options: ['10 cm', '100 cm', '1 000 cm', '50 cm'],
        correctIndex: 1,
        explication: '1 m = 100 cm (centi signifie centième partie).',
      },
      {
        question: 'Si 1 kg de café coûte 4 000 FC, combien coûte 500 g (demi-kilo) ?',
        options: ['1 000 FC', '2 000 FC', '3 000 FC', '8 000 FC'],
        correctIndex: 1,
        explication: '500 g est la moitié de 1 kg. Donc 4 000 FC ÷ 2 = 2 000 FC.',
      },
    ],
  },

  // ==========================================
  // 4ème PRIMAIRE (4P)
  // ==========================================
  {
    id: '0430841f-f4cc-4e3d-977f-91b6adf37140',
    titre: 'Mathématiques - Mesure (4ème Primaire)',
    description:
      'Tableau complet du système métrique : multiples et sous-multiples des longueurs (km à mm), capacités (hl à ml), masses (tonne, quintal, kg, g). Durées et calcul géométrique du périmètre (carré et rectangle).',
    matiere_id: MATIERE_MATHEMATIQUE_ID,
    matiere_nom: MATIERE_MATHEMATIQUE_NOM,
    matiere: MATIERE_MATHEMATIQUE_NOM,
    classe_id: 'a62478e6-e63c-4d2e-c3dc-fa883172a823',
    classe: '4ème Primaire',
    enseignant_id: 'c2d3e4f5-teacher-mwamba-uuid',
    enseignant_nom: 'Prof. Christian Mwamba',
    ecole_id: DEFAULT_SCHOOL_ID,
    created_at: '2026-03-01T08:00:00.000Z',
    chapitres_count: 5,
    chapitres: [
      {
        id: 'c4000001-4444-4444-4444-444444444444',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37140',
        titre: 'Chapitre 1 : Tableau complet des mesures de longueur (km, hm, dam, m, dm, cm, mm)',
        ordre: 1,
        position: 1,
        duree_minutes: 40,
        contenu: `<h2>1. Le Tableau des Longueurs</h2>
<p>Pour mesurer les grandes distances (ex: Kinshasa à Kikwit ou Matadi), on utilise le <b>kilomètre (km)</b>.</p>
<div class="overflow-x-auto my-3">
  <table class="w-full text-center border-collapse border border-slate-300 text-xs">
    <tr class="bg-indigo-900 text-white font-bold">
      <td colspan="3" class="p-2 border">Multiples</td>
      <td class="p-2 border bg-amber-600">Unité</td>
      <td colspan="3" class="p-2 border">Sous-multiples</td>
    </tr>
    <tr class="bg-slate-100 font-bold text-slate-800">
      <td class="p-2 border">km</td>
      <td class="p-2 border">hm</td>
      <td class="p-2 border">dam</td>
      <td class="p-2 border font-extrabold text-amber-700">m</td>
      <td class="p-2 border">dm</td>
      <td class="p-2 border">cm</td>
      <td class="p-2 border">mm</td>
    </tr>
  </table>
</div>
<p><b>1 km = 10 hm = 100 dam = 1 000 m.</b></p>`,
      },
      {
        id: 'c4000002-4444-4444-4444-444444444444',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37140',
        titre: 'Chapitre 2 : Tableau complet des mesures de capacité (hl, dal, l, dl, cl, ml)',
        ordre: 2,
        position: 2,
        duree_minutes: 40,
        contenu: `<h2>2. Les Unités Complètes de Capacité</h2>
<p>L'hectolitre (hl) et le décalitre (dal) servent pour mesurer de grandes citernes d'eau :</p>
<ul>
  <li><b>1 hectolitre (hl) = 100 litres</b></li>
  <li><b>1 décalitre (dal) = 10 litres</b></li>
</ul>`,
      },
      {
        id: 'c4000003-4444-4444-4444-444444444444',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37140',
        titre: 'Chapitre 3 : Mesures de masse : La tonne (t), le quintal (q), le kg et le gramme',
        ordre: 3,
        position: 3,
        duree_minutes: 40,
        contenu: `<h2>3. Les Grandes Unités de Masse</h2>
<p>Dans les camions de fret transportant le maïs ou le cuivre au Katanga :</p>
<ul>
  <li><b>1 tonne (t) = 1 000 kg</b></li>
  <li><b>1 quintal (q) = 100 kg</b> (ex: un grand sac de braise ou de haricots).</li>
  <li>1 t = 10 q = 1 000 kg.</li>
</ul>`,
      },
      {
        id: 'c4000004-4444-4444-4444-444444444444',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37140',
        titre: 'Chapitre 4 : Mesures de durée : Heures, minutes, secondes et conversions',
        ordre: 4,
        position: 4,
        duree_minutes: 40,
        contenu: `<h2>4. Le Temps et les Durées</h2>
<div class="p-3 bg-sky-50 border border-sky-200 rounded-lg my-2 font-bold text-sky-900">
  1 jour = 24 heures (h)<br />
  1 heure = 60 minutes (min) = 3 600 secondes (s)<br />
  1 minute = 60 secondes (s)
</div>
<p><b>Exemple de conversion :</b> Combien de minutes durent 2 heures et demie ?<br />
(2 × 60 min) + 30 min = 120 + 30 = <b>150 minutes</b>.</p>`,
      },
      {
        id: 'c4000005-4444-4444-4444-444444444444',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37140',
        titre: 'Chapitre 5 : Notion et calcul du périmètre (Carré et Rectangle)',
        ordre: 5,
        position: 5,
        duree_minutes: 40,
        contenu: `<h2>5. Calcul du Périmètre</h2>
<p>Le <b>périmètre</b> est la longueur du contour d'une surface plane.</p>
<h3>A. Périmètre du Carré :</h3>
<div class="p-2 bg-slate-50 border rounded font-mono">P = Côté × 4</div>
<h3>B. Périmètre du Rectangle :</h3>
<div class="p-2 bg-slate-50 border rounded font-mono">P = (Longueur + Largeur) × 2</div>`,
      },
    ],
    quizQuestions: [
      {
        question: 'Un camion charge 3 tonnes de manioc. Combien cela représente-t-il en kilogrammes ?',
        options: ['300 kg', '3 000 kg', '30 000 kg', '30 kg'],
        correctIndex: 1,
        explication: '1 tonne = 1 000 kg. Donc 3 t = 3 × 1 000 = 3 000 kg.',
      },
      {
        question: 'Quel est le périmètre d\'un jardin rectangulaire de 15 m de long et 10 m de large ?',
        options: ['25 m', '50 m', '150 m', '100 m'],
        correctIndex: 1,
        explication: 'Formule : P = (L + l) × 2 = (15 + 10) × 2 = 25 × 2 = 50 m.',
      },
    ],
  },

  // ==========================================
  // 5ème PRIMAIRE (5P)
  // ==========================================
  {
    id: '0430841f-f4cc-4e3d-977f-91b6adf37150',
    titre: 'Mathématiques - Mesure (5ème Primaire)',
    description:
      'Mesures de superficie et unités agraires (ha, a, ca). Calcul d\'aire des figures planes (carré, rectangle, triangle, parallélogramme, losange, cercle). Problèmes de mouvement uniforme (vitesse, distance, temps) et échelles cartographiques.',
    matiere_id: MATIERE_MATHEMATIQUE_ID,
    matiere_nom: MATIERE_MATHEMATIQUE_NOM,
    matiere: MATIERE_MATHEMATIQUE_NOM,
    classe_id: 'b73589f7-f74d-4e3f-d4ed-0b994283b934',
    classe: '5ème Primaire',
    enseignant_id: 'b6416211-0e05-4432-85e9-c5b3b243e543',
    enseignant_nom: 'Professeur Titulaire 5P',
    ecole_id: DEFAULT_SCHOOL_ID,
    created_at: '2026-03-01T08:00:00.000Z',
    chapitres_count: 5,
    chapitres: [
      {
        id: 'c5000001-5555-5555-5555-555555555555',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37150',
        titre: 'Chapitre 1 : Mesures de surface et unités agraires (ha, a, ca)',
        ordre: 1,
        position: 1,
        duree_minutes: 45,
        contenu: `<h2>1. Superficies et Unités Agraires</h2>
<p>Pour mesurer les champs agricoles en RDC (manioc, maïs, palmier à huile), on utilise les unités agraires :</p>
<ul>
  <li><b>L'hectare (ha)</b> = 1 hm² = 10 000 m²</li>
  <li><b>L'are (a)</b> = 1 dam² = 100 m²</li>
  <li><b>Le centiare (ca)</b> = 1 m²</li>
</ul>
<div class="p-3 bg-emerald-50 border border-emerald-200 rounded font-bold text-center text-emerald-900">
  1 hectare (ha) = 100 ares (a) = 10 000 centiares (ca ou m²)
</div>`,
      },
      {
        id: 'c5000002-5555-5555-5555-555555555555',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37150',
        titre: 'Chapitre 2 : Aire des polygones usuels (Triangle, Losange, Parallélogramme)',
        ordre: 2,
        position: 2,
        duree_minutes: 45,
        contenu: `<h2>2. Formules d'Aire des Figures Géométriques</h2>
<ul>
  <li><b>Rectangle :</b> Aire = Longueur × Largeur (L × l)</li>
  <li><b>Carré :</b> Aire = Côté × Côté (c × c)</li>
  <li><b>Triangle :</b> Aire = (Base × Hauteur) ÷ 2</li>
  <li><b>Losange :</b> Aire = (Grande Diagonale × Petite Diagonale) ÷ 2</li>
  <li><b>Parallélogramme :</b> Aire = Base × Hauteur</li>
</ul>`,
      },
      {
        id: 'c5000003-5555-5555-5555-555555555555',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37150',
        titre: 'Chapitre 3 : Circonférence du cercle et nombre Pi (π ≈ 3,14 ou 22/7)',
        ordre: 3,
        position: 3,
        duree_minutes: 45,
        contenu: `<h2>3. La Mesure du Cercle</h2>
<p>Le périmètre d'un cercle s'appelle la <b>circonférence</b>.</p>
<div class="p-3 bg-amber-50 border border-amber-200 rounded font-bold text-amber-900">
  Périmètre = Diamètre × π = 2 × Rayon × π<br />
  (Avec π ≈ 3,14 ou 22/7)
</div>
<p><b>Exemple :</b> Pour une roue de 70 cm de diamètre :<br />
Circonférence = 70 × (22/7) = 10 × 22 = <b>220 cm</b> (soit 2,2 m par tour de roue).</p>`,
      },
      {
        id: 'c5000004-5555-5555-5555-555555555555',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37150',
        titre: 'Chapitre 4 : Vitesse uniforme, distance et durée (v = d / t)',
        ordre: 4,
        position: 4,
        duree_minutes: 45,
        contenu: `<h2>4. Vitesse, Distance et Temps</h2>
<div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-center font-bold my-2">
  <div class="p-2 bg-blue-50 border rounded">Vitesse = Distance ÷ Temps</div>
  <div class="p-2 bg-green-50 border rounded">Distance = Vitesse × Temps</div>
  <div class="p-2 bg-purple-50 border rounded">Temps = Distance ÷ Vitesse</div>
</div>
<p><b>Problème :</b> Un bus quitte Kinshasa pour Mbanza-Ngungu (150 km) et roule à 50 km/h en moyenne. Quelle est la durée du trajet ?<br />
Temps = 150 ÷ 50 = <b>3 heures</b>.</p>`,
      },
      {
        id: 'c5000005-5555-5555-5555-555555555555',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37150',
        titre: 'Chapitre 5 : Les échelles cartographiques et lecture de plans',
        ordre: 5,
        position: 5,
        duree_minutes: 45,
        contenu: `<h2>5. Les Échelles sur les Cartes Géographiques</h2>
<p>L'<b>échelle</b> est le rapport entre la distance sur la carte et la distance réelle sur le terrain :</p>
<p><b>Échelle 1 / 100 000 :</b> Cela signifie que 1 cm sur la carte représente 100 000 cm dans la réalité, soit 1 kilomètre sur le terrain !</p>`,
      },
    ],
    quizQuestions: [
      {
        question: 'Un champ de manioc mesure 2 hectares. Combien de mètres carrés (m²) cela fait-il ?',
        options: ['200 m²', '2 000 m²', '20 000 m²', '200 000 m²'],
        correctIndex: 2,
        explication: '1 hectare = 10 000 m². Donc 2 ha = 2 × 10 000 = 20 000 m².',
      },
      {
        question: 'Quelle est l\'aire d\'un triangle ayant une base de 12 m et une hauteur de 5 m ?',
        options: ['60 m²', '30 m²', '17 m²', '34 m²'],
        correctIndex: 1,
        explication: 'Formule : Aire = (Base × Hauteur) ÷ 2 = (12 × 5) ÷ 2 = 60 ÷ 2 = 30 m².',
      },
    ],
  },

  // ==========================================
  // 6ème PRIMAIRE (6P - Préparation TENAFEP)
  // ==========================================
  {
    id: '0430841f-f4cc-4e3d-977f-91b6adf37160',
    titre: 'Mathématiques - Mesure (6ème Primaire - Préparation TENAFEP)',
    description:
      'Programme officiel terminal du cycle primaire RDC (TENAFEP) : volumes et capacités (m³, dm³, cm³), équivalence fondamentale (1 dm³ = 1 l = 1 kg d\'eau pure), poids brut/tare/poids net, masse volumique, problèmes de commerce et débit de citernes.',
    matiere_id: MATIERE_MATHEMATIQUE_ID,
    matiere_nom: MATIERE_MATHEMATIQUE_NOM,
    matiere: MATIERE_MATHEMATIQUE_NOM,
    classe_id: 'c84690a8-085e-4f40-e5fe-1ca05394ca45',
    classe: '6ème Primaire',
    enseignant_id: 'b6416211-0e05-4432-85e9-c5b3b243e543',
    enseignant_nom: 'Prof. Shasa Kanyinda (Titulaire TENAFEP)',
    ecole_id: DEFAULT_SCHOOL_ID,
    created_at: '2026-03-01T08:00:00.000Z',
    chapitres_count: 6,
    chapitres: [
      {
        id: 'c6000001-6666-6666-6666-666666666666',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37160',
        titre: 'Chapitre 1 : Mesures de volume et tableau de conversion tridimensionnel',
        ordre: 1,
        position: 1,
        duree_minutes: 50,
        contenu: `<h2>1. Le Volume des Corps Solides</h2>
<p>L'unité principale de volume est le <b>mètre cube (m³)</b>. C'est l'espace occupé par un cube de 1 mètre de côté.</p>
<div class="p-3 bg-rose-50 border border-rose-200 rounded font-bold text-rose-900">
  Attention au tableau de conversion : chaque unité de volume possède 3 COLONNES !<br />
  1 m³ = 1 000 dm³ = 1 000 000 cm³
</div>`,
      },
      {
        id: 'c6000002-6666-6666-6666-666666666666',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37160',
        titre: 'Chapitre 2 : La relation fondamentale du système métrique : 1 dm³ = 1 litre = 1 kg',
        ordre: 2,
        position: 2,
        duree_minutes: 50,
        contenu: `<h2>2. L'Équivalence Maîtresse du Système Métrique</h2>
<div class="p-4 bg-blue-900 text-white rounded-xl shadow-xs text-center font-extrabold text-lg my-3 tracking-wide">
  1 dm³ (Volume) = 1 litre (Capacité) = 1 kg (Masse d'eau pure)
</div>
<p>Cette relation permet de résoudre les problèmes de réservoirs d'eau du TENAFEP :</p>
<p>Si une citerne contient 5 m³ d'eau potable :</p>
<ul>
  <li>Volume = 5 m³ = 5 000 dm³</li>
  <li>Capacité = <b>5 000 litres</b></li>
  <li>Masse = 5 000 kg = <b>5 tonnes d'eau</b></li>
</ul>`,
      },
      {
        id: 'c6000003-6666-6666-6666-666666666666',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37160',
        titre: 'Chapitre 3 : Volume des solides usuels (Cube, Parallélépipède rectangle, Cylindre)',
        ordre: 3,
        position: 3,
        duree_minutes: 50,
        contenu: `<h2>3. Calcul du Volume des Solides</h2>
<ul>
  <li><b>Cube :</b> V = Côté × Côté × Côté (c³)</li>
  <li><b>Pavé droit (Parallélépipède) :</b> V = Longueur × Largeur × Hauteur (L × l × h)</li>
  <li><b>Cylindre droit :</b> V = Surface de base × Hauteur = (π × r²) × h</li>
</ul>`,
      },
      {
        id: 'c6000004-6666-6666-6666-666666666666',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37160',
        titre: 'Chapitre 4 : Poids brut, tare, poids net et masse volumique (ρ = M / V)',
        ordre: 4,
        position: 4,
        duree_minutes: 50,
        contenu: `<h2>4. Poids Brut, Poids Net et Tare</h2>
<div class="p-3 bg-slate-100 border rounded font-mono text-slate-800 space-y-1 my-2">
  <div>• Poids Brut = Poids Net + Tare</div>
  <div>• Poids Net = Poids Brut - Tare</div>
  <div>• Tare = Poids Brut - Poids Net</div>
</div>
<p><b>Masse volumique :</b> ρ = Masse / Volume (ex: pour l'or, le sable, l'huile).</p>`,
      },
      {
        id: 'c6000005-6666-6666-6666-666666666666',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37160',
        titre: 'Chapitre 5 : Problèmes de commerce TENAFEP : Prix d\'achat, revient, bénéfice, pourcentages',
        ordre: 5,
        position: 5,
        duree_minutes: 50,
        contenu: `<h2>5. Problèmes Commerciaux et Financiers TENAFEP</h2>
<ul>
  <li><b>Prix de Revient = Prix d'Achat + Frais de transport</b></li>
  <li><b>Prix de Vente = Prix de Revient + Bénéfice</b> (ou Prix de Revient - Perte)</li>
  <li><b>Bénéfice = Prix de Vente - Prix de Revient</b></li>
  <li><b>Pourcentage de bénéfice = (Bénéfice ÷ Prix d'Achat) × 100</b></li>
</ul>`,
      },
      {
        id: 'c6000006-6666-6666-6666-666666666666',
        cours_id: '0430841f-f4cc-4e3d-977f-91b6adf37160',
        titre: 'Chapitre 6 : Synthèse TENAFEP : Problèmes de débit et remplissage de cuves',
        ordre: 6,
        position: 6,
        duree_minutes: 55,
        contenu: `<h2>6. Problèmes de Débit et de Robinets (Item Classique TENAFEP)</h2>
<p><b>Énoncé type :</b> Un réservoir parallélépipédique mesure 2 m de long, 1,5 m de large et 1 m de profondeur. Il est alimenté par un robinet qui débite 50 litres par minute.</p>
<p><b>1. Volume du réservoir :</b> V = 2 × 1,5 × 1 = 3 m³ = 3 000 dm³ = <b>3 000 litres</b>.</p>
<p><b>2. Temps de remplissage :</b> 3 000 ÷ 50 = <b>60 minutes</b> (soit 1 heure exacte !).</p>`,
      },
    ],
    quizQuestions: [
      {
        question: 'Quelle est la masse exacte de 2 500 litres d\'eau pure ?',
        options: ['250 kg', '2 500 kg (2,5 tonnes)', '25 000 kg', '25 kg'],
        correctIndex: 1,
        explication: 'D\'après la relation fondamentale : 1 litre d\'eau pure pèse exactement 1 kg. Donc 2 500 l = 2 500 kg = 2,5 tonnes.',
      },
      {
        question: 'Une caisse remplie de poissons pèse 45 kg (Poids Brut). La caisse vide pèse 3 kg (Tare). Quel est le Poids Net ?',
        options: ['48 kg', '42 kg', '15 kg', '135 kg'],
        correctIndex: 1,
        explication: 'Poids Net = Poids Brut - Tare = 45 kg - 3 kg = 42 kg.',
      },
      {
        question: 'Un commerçant achète un sac de riz à 50 000 FC. Il paie 5 000 FC de transport et le revend 65 000 FC. Quel est son bénéfice ?',
        options: ['15 000 FC', '10 000 FC', '20 000 FC', '5 000 FC'],
        correctIndex: 1,
        explication: 'Prix de Revient = 50 000 + 5 000 = 55 000 FC. Bénéfice = Prix de Vente - Prix de Revient = 65 000 - 55 000 = 10 000 FC.',
      },
      {
        question: 'Combien de décimètres cubes (dm³) trouve-t-on dans 1 mètre cube (m³) ?',
        options: ['10 dm³', '100 dm³', '1 000 dm³', '10 000 dm³'],
        correctIndex: 2,
        explication: 'Pour les volumes, on multiplie par 1 000 à chaque échelon (3 dimensions : L × l × h). 1 m³ = 1 000 dm³.',
      },
    ],
  },
];

/**
 * Fonction d'exécution de la simulation :
 * Enregistre ou actualise les cours et leurs assignations dans le cache applicatif local
 * pour qu'ils soient immédiatement opérationnels dans toute l'interface.
 */
export function executeMesureCourseSimulation() {
  if (typeof window === 'undefined') return;

  const COURSES_KEY = 'e_rdc_custom_courses_v1';
  const CHAPTERS_KEY = 'e_rdc_custom_chapters_v1';
  const ASSIGNMENTS_KEY = 'e_rdc_cours_classes_assignments';
  const QUIZZES_KEY = 'ads_custom_quizzes_v1';

  try {
    // 1. Cours
    let storedCourses: any[] = [];
    const rawCourses = localStorage.getItem(COURSES_KEY);
    if (rawCourses) storedCourses = JSON.parse(rawCourses);

    MESURE_PRIMARY_COURSES.forEach((mc) => {
      const courseRecord: CourseItem = {
        id: mc.id,
        titre: mc.titre,
        description: mc.description,
        matiere_id: mc.matiere_id,
        matiere_nom: mc.matiere_nom,
        matiere: mc.matiere,
        classe_id: mc.classe_id,
        classe: mc.classe,
        enseignant_id: mc.enseignant_id,
        enseignant_nom: mc.enseignant_nom,
        ecole_id: mc.ecole_id,
        chapitres_count: mc.chapitres.length,
        created_at: mc.created_at,
      };

      const existingIndex = storedCourses.findIndex((c) => c.id === mc.id);
      if (existingIndex >= 0) {
        storedCourses[existingIndex] = courseRecord;
      } else {
        storedCourses.push(courseRecord);
      }
    });
    localStorage.setItem(COURSES_KEY, JSON.stringify(storedCourses));

    // 2. Chapitres
    let storedChapters: any[] = [];
    const rawChapters = localStorage.getItem(CHAPTERS_KEY);
    if (rawChapters) storedChapters = JSON.parse(rawChapters);

    MESURE_PRIMARY_COURSES.forEach((mc) => {
      mc.chapitres.forEach((ch) => {
        const existingIdx = storedChapters.findIndex((c) => c.id === ch.id);
        if (existingIdx >= 0) {
          storedChapters[existingIdx] = ch;
        } else {
          storedChapters.push(ch);
        }
      });
    });
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(storedChapters));

    // 3. Assignations Cours <-> Classes
    let storedAssignments: CoursClasse[] = [];
    const rawAssignments = localStorage.getItem(ASSIGNMENTS_KEY);
    if (rawAssignments) storedAssignments = JSON.parse(rawAssignments);

    MESURE_PRIMARY_COURSES.forEach((mc) => {
      const assignId = `assign-${mc.id}-${mc.classe_id}`;
      const newAssign: CoursClasse = {
        id: assignId,
        cours_id: mc.id,
        classe_id: mc.classe_id,
        enseignant_id: mc.enseignant_id,
        est_actif: true,
        annee_scolaire: '2025-2026',
        created_at: new Date().toISOString(),
      };

      const existingIdx = storedAssignments.findIndex(
        (a) => a.cours_id === mc.id && a.classe_id === mc.classe_id
      );
      if (existingIdx >= 0) {
        storedAssignments[existingIdx] = newAssign;
      } else {
        storedAssignments.push(newAssign);
      }
    });
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(storedAssignments));

    // 4. Quizz d'évaluation
    let storedQuizzes: any[] = [];
    const rawQuizzes = localStorage.getItem(QUIZZES_KEY);
    if (rawQuizzes) storedQuizzes = JSON.parse(rawQuizzes);

    MESURE_PRIMARY_COURSES.forEach((mc) => {
      const quizId = `quiz-mesure-${mc.classe_id}`;
      const quizObj = {
        id: quizId,
        titre: `Évaluation Standardisée : ${mc.titre}`,
        description: `Série de questions formatives alignées au programme officiel RDC pour tester les compétences en Mesure.`,
        matiere_id: mc.matiere_id,
        cours_id: mc.id,
        classe_id: mc.classe_id,
        classe: mc.classe,
        nombre_questions: mc.quizQuestions.length,
        questions: mc.quizQuestions,
        duree_minutes: 20,
        statut: 'publie',
        created_at: new Date().toISOString(),
      };

      const existingQIdx = storedQuizzes.findIndex((q) => q.id === quizId);
      if (existingQIdx >= 0) {
        storedQuizzes[existingQIdx] = quizObj;
      } else {
        storedQuizzes.push(quizObj);
      }
    });
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(storedQuizzes));

    return {
      success: true,
      coursesCreated: MESURE_PRIMARY_COURSES.length,
      chaptersCreated: storedChapters.length,
      assignmentsCreated: storedAssignments.length,
    };
  } catch (err: any) {
    console.error('Erreur lors de executeMesureCourseSimulation:', err?.message);
    return { success: false, error: err?.message };
  }
}
