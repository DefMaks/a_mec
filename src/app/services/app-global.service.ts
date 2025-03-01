import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export interface Cours {
  nom: string;
  totalPoints: number | undefined;
  icon: string | undefined;
  classCourse: string | undefined;
  color: string | undefined;
  branches: Branches[] | undefined;
}
export interface Branches {
  nom: string;
  totalPoints: number | undefined;
  maxima: number;
  matieres:
    | {
        chapitres: string;
        content: string;
      }
    | undefined;
}

export interface World {
  name: string;
  role: string | number;
  links: Link[];
}

export interface Link {
  indications: string;
  title: string;
  url: string;
  iconsrc: string | undefined;
  iconname: string | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class AppGlobalService {
  user!: any;
  matiere!: any;
  schools!: any;
  classes!: any;
  niveaux!: any;
  sections!: any;
  sectionsOptions!: any;
  currentClasses!: any;
  usersByRoles: any = {
    super_admins: null,
    admins: null,
    inspectors: null,
    teachers: null,
    parents: null,
    students: null,
  };
  viewCourse!: any;
  actualWorld = 3;
  hasSub = false;
  lessons!: any;
  chatlog!: any;
  currentChat!: any;

  // IF ROLE IS TEACHER
  totalQuizLength = 0;

  private chatlogSubject = new BehaviorSubject<any[]>([]);
  chatlog$ = this.chatlogSubject.asObservable();
  newMessage = 0;

  // Mettre à jour chatlog
  updateChatlog(newChatlog: any[]) {
    this.chatlogSubject.next(newChatlog);
  }

  // Récupérer la dernière valeur
  getChatlog() {
    return this.chatlogSubject.value;
  }
}
