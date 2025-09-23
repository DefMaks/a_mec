/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

import { AppGlobalService, Link, World } from '../services/app-global.service';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mecm',
  templateUrl: './mecm.page.html',
  styleUrls: ['./mecm.page.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [animate('500ms ease-in-out')]),
    ]),
  ],
})
export class MecmPage implements OnInit {
  paneVisible: boolean = true;

  all_links: Link[] = [
    {
      indications: 'Super Admin, Admin, Inspecteur, Professeur, Parent',
      title: 'Settings',
      url: '/app/settings',
      iconname: 'settings',
      iconsrc: undefined,
    },
    {
      indications: 'Professeur',
      title: 'Mes Leçons',
      url: '/app/all-cours',
      iconname: undefined,
      iconsrc: 'assets/icons/book.svg',
    },
    {
      indications: 'Professeur',
      title: 'Mes Quiz',
      url: '/app/quiz',
      iconname: undefined,
      iconsrc: 'assets/icons/online-education-multiple-quiz.svg',
    },
    {
      indications: 'Professeur',
      title: 'Mes Messages',
      url: '/app/chat-log',
      iconname: 'chatbubbles-outline',
      iconsrc: undefined,
    },
    {
      indications: 'Parent',
      title: 'Paiements',
      url: '/app/parent-payment',
      iconname: 'card-outline',
      iconsrc: undefined,
    },
  ];

  world: World[] = [
    {
      name: 'Super Admin',
      role: 'super_admin',
      links: [this.all_links[0]],
    },
    {
      name: 'Admin',
      role: 'admin',
      links: [this.all_links[0]],
    },
    {
      name: 'Professeur',
      role: 'teacher',
      links: [
        this.all_links[1],
        this.all_links[2],
        this.all_links[3],
        this.all_links[0],
      ],
    },
    {
      name: 'Parent',
      role: 'parent',
      links: [
        this.all_links[4], // Paiements
        this.all_links[0], // Settings
      ],
    },
  ];
  theLinks!: World[];
  maskLoader = true;

  isSigningOut = false;
  isSigningOutMask = false;

  constructor(
    public appGlobal: AppGlobalService,
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // this.maskLoader = true;
  }

  async ngOnInit() {
    // Data should be available now, set links directly
    if (this.appGlobal.user?.role) {
      this.theLinks = this.world.filter(
        (item: World) => item.role === this.appGlobal.user.role
      );
      this.maskLoader = false;
    } else {
      // Fallback if data is not ready
      this.checkUserAndSetLinks();
    }
  }

  checkUserAndSetLinks() {
    // Simplified fallback - just wait a bit and try again
    setTimeout(() => {
      if (this.appGlobal.user?.role) {
        this.theLinks = this.world.filter(
          (item: World) => item.role === this.appGlobal.user.role
        );
        this.maskLoader = false;
      } else {
        console.log('User data still not available');
        this.maskLoader = false; // Show interface anyway
      }
    }, 2000);
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.isSigningOut = true;
    // }, 9000);
  }

  togglePane() {
    this.paneVisible = !this.paneVisible;
  }

  // signout() {
  //   this.isSigningOut = true;
  //   console.log('Sign Out');
  //   setTimeout(() => {
  //     return this.supabase.signOut().then(() => {
  //       this.isSigningOut = false;
  //       if (this.isSigningOut == false) {
  //         this.router.navigateByUrl('/');
  //       }
  //     });
  //   }, 4000);
  // }
  async signout() {
    this.isSigningOut = true;
    this.isSigningOutMask = true;
    console.log('Sign Out');

    // Attendre 4 secondes avant de procéder à la déconnexion
    await new Promise((resolve) => setTimeout(resolve, 4000));

    try {
      await this.supabase.signOut();
      this.isSigningOut = false;

      // Forcer la détection des changements pour que le toast soit mis à jour
      this.cdr.detectChanges();

      setTimeout(() => {
        this.isSigningOutMask = false;
        // Rediriger vers la page d'accueil
        this.router.navigateByUrl('/');
      }, 900);
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      this.isSigningOut = false;

      // Forcer la détection des changements en cas d'erreur
      this.cdr.detectChanges();
    }
  }
}
