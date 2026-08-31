export type SessionRole = 'teacher' | 'admin' | 'parent' | 'super_admin' | 'eleve' | 'student';

export interface SessionUserInfo {
  profile_id: string | null;
  eleve_id: string | null;
}

export interface SessionHeader {
  role: SessionRole;
  user: SessionUserInfo;
}

export interface SessionProfileData {
  id?: string;
  role?: string;
  ecole_id?: string | null;
  nom_complet?: string;
  email?: string | null;
  telephone?: string | null;
  [key: string]: any;
}

export interface SessionClasseProfesseur {
  classe_id: string;
  professeur_id: string;
  role_professeur?: string;
  classe_nom?: string;
  ecole_id?: string;
}

export interface SessionData {
  profile?: SessionProfileData;
  classes?: any[];
  eleves?: any[];
  cours?: any[];
  chapitres?: any[];
  quiz?: any[];
  quiz_attempts?: any[];
  classe_professeur?: SessionClasseProfesseur[];
}

export interface SessionResponse {
  session: SessionHeader;
  data: SessionData;
}
