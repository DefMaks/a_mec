/**
 * Déclarations des Types Supabase / Database pour E-RDC (A_MEC)
 * Respecte scrupuleusement la structure actuelle de la base de données sans modification de schéma.
 */

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'parent' | 'student';

export interface Profile {
  id: string;
  user_id?: string | null;
  nom_complet: string;
  email?: string | null;
  sexe?: 'M' | 'F' | string | null;
  telephone?: string | null;
  role: UserRole;
  ecole_id?: string | null;
  active?: boolean | null;
  created_at: string;
  ecoles?: Ecole | null;
}

export interface Ecole {
  id: string;
  nom: string;
  rccm?: string | null;
  id_nat?: string | null;
  admin_id?: string | null;
  created_at: string;
}

export interface Classe {
  id: string;
  ecole_id: string;
  niveau_id: string;
  option_id?: string | null;
  vacation?: string | null;
  titulaire_id?: string | null;
  created_at: string;
  niveaux?: Niveau;
  options?: Option;
  profiles?: Profile;
}

export interface Niveau {
  id: string;
  nom: string;
  code: string;
  description?: string | null;
}

export interface Option {
  id: string;
  nom: string;
  section_id?: string | null;
  code: string;
}

export interface Eleve {
  id: string;
  parent_id?: string | null;
  classe_id?: string | null;
  pseudonyme: string;
  nom_complet?: string | null;
  matricule?: string | null;
  code_acces: string;
  created_at: string;
  classes?: Classe;
  parent?: Profile;
}

export interface Matiere {
  id: string;
  nom: string;
  code: string;
  description?: string | null;
}

export interface Cours {
  id: string;
  matiere_id: string;
  classe_id?: string | null;
  enseignant_id: string;
  titre: string;
  description?: string | null;
  position?: number;
  is_published: boolean;
  created_at: string;
  matieres?: Matiere;
  classes?: Classe;
  enseignant?: Profile;
  chapitres?: Chapitre[];
}

export interface Chapitre {
  id: string;
  cours_id: string;
  titre: string;
  contenu?: string | null;
  duree_minutes?: number | null;
  position: number;
  audio_url?: string | null;
  pdf_url?: string | null;
  created_at: string;
}

export interface QuestionAnswerOption {
  type?: string;
  content: string;
}

export interface QuestionItem {
  question: string;
  correct_answer: QuestionAnswerOption;
  incorrect_answers: QuestionAnswerOption[];
}

export interface Quiz {
  id: string;
  chapitre_id?: string | null;
  cours_id?: string | null;
  titre: string;
  questions: QuestionItem[];
  duree_minutes?: number | null;
  note_passation?: number | null;
  code?: string | null;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  eleve_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  reponses?: Record<string, any> | null;
  reussi: boolean;
  created_at: string;
}

export interface Paiement {
  id: string;
  order_id: string;
  parent_id: string;
  eleve_id?: string | null;
  montant: number;
  devise: string;
  mode_paiement: string;
  statut: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference_twiga?: string | null;
  created_at: string;
  parent?: Profile;
  eleve?: Eleve;
}

export interface ChatLog {
  id: string;
  title?: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chatlog_id: string;
  sender_id: string;
  sender_role: UserRole;
  message: string;
  created_at: string;
  sender?: Profile;
}
