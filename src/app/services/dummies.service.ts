import { Injectable } from '@angular/core';
import { Cours } from './app-global.service';

@Injectable({
  providedIn: 'root'
})
export class DummiesService {

  TableCours: Cours[] = [
    {
      nom: 'Mathématiques',
      totalPoints: 0,
      branches: [
        {
          nom: 'Calcul écrit',
          totalPoints: 0,
          maxima : 5,
          matieres: undefined
        },
        {
          nom: 'Problème',
          totalPoints: 0,
          maxima : 5,
          matieres: undefined
        },
        {
          nom: 'Mesure',
          totalPoints: 0,
          maxima : 5,
          matieres: undefined
        },
      ],
      icon: "assets/icons/math.svg",
      classCourse: "courses-btn",
      color: "blue"
    },
    {
      nom: 'Français',
      totalPoints: 0,
      branches: [
        {
          nom: 'Orthographe',
          totalPoints: 0,
          maxima : 5,
          matieres: undefined
        },
        {
          nom: 'Grammaire',
          totalPoints: 0,
          maxima : 5,
          matieres: undefined
        },
        {
          nom: 'Conjugaison',
          totalPoints: 0,
          maxima : 5,
          matieres: undefined
        },
      ],
      icon: "assets/icons/book.svg",
      classCourse: " courses-btn",
      color: "decoyred"
    },
    {
      nom: 'Histoire',
      totalPoints: 0,
      branches: undefined,
      icon: "assets/icons/history-book.svg",
      classCourse: " courses-btn",
      color: "brown"
    },
    {
      nom: 'Géographie',
      totalPoints: 0,
      branches: undefined,
      icon: "assets/icons/globe.svg",
      classCourse: " courses-btn",
      color: "palegreen"
    },
    {
      nom: 'Anglais',
      totalPoints: 0,
      branches: undefined,
      icon: "assets/icons/book.svg",
      classCourse: " courses-btn",
      color: "english"
    },
    {
      nom: 'Sciences',
      totalPoints: 0,
      branches: undefined,
      icon: "assets/icons/biology.svg",
      classCourse: " courses-btn",
      color: "science"
    },
  ]
  

  constructor() { }
}
