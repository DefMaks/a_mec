import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service'; // Import du service Supabase
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const userData = localStorage.getItem('supabaseSession');

    // const session = await this.supabase.getSession();
    // console.log('Guard says: ', session);
    /*
    if (session) {
      // Si une session est trouvée, l'utilisateur peut accéder à la page
      console.log('Session found');
      this.router.navigate(['/app/dash']);
      return true;
    } else {
      // Si aucune session, redirection vers la page Login
      console.log('Session not found');
      this.router.navigate(['/login']);
      return false;
    }
    */
    /*
    if (session) {
      console.log('Session found');
      return true; // Allow navigation
    } else {
      console.log('Session not found');
      this.router.navigate(['/login']); // Redirect to login
      return false; // Block navigation
    }*/
    if (!userData) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
