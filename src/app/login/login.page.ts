import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AppGlobalService } from '../services/app-global.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials = this.fb.nonNullable.group({
    email: ['defmakslabs@gmail.com', Validators.required],
    password: ['DefMaksIUS', Validators.required],
  });

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public appGlobal: AppGlobalService,
    private supabase: SupabaseService
  ) {}

  ngOnInit() {
    this.autolog();
    if (this.supabase._session) {
      this.router.navigateByUrl('/app/dash');
    }
  }

  get email() {
    return this.credentials.controls.email;
  }

  get password() {
    return this.credentials.controls.password;
  }

  async login(ev: any) {
    console.log(this.credentials);
    /*
    // router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true});
    return this.autolog().then((res) => {
      if (res) {
        console.log(res);
        return this.router.navigateByUrl('/app/dash');
      }
      return;
    });
    //return this.router.navigate(['app'], { skipLocationChange: false });
    */

    const { email, password } = this.credentials.value;
    if (!email || !password) {
      console.error('Email and password are required!');
      return;
    }

    const { data, error } = await this.supabase.signIn(email, password);

    if (error) {
      console.error('Login error:', error.message);
      return;
    }

    if (data.session) {
      console.log('Login successful:', data);
      localStorage.setItem('supabaseSession', JSON.stringify(data));
      this.router.navigateByUrl('/app/dash'); // Redirect after successful login
    }
  }

  async autolog() {
    const storedUser = localStorage.getItem('supabaseSession');

    if (storedUser) {
      this.appGlobal.user = JSON.parse(storedUser);
      setTimeout(() => {
        this.supabase.initQueries();
      }, 2000);
      this.router.navigate(['/app/dash']);
    } else {
      console.log('Session not found');
    }
    /*
    const email = 'defmakslabs@gmail.com'; // Email défini directement
    const password = 'DefMaksIUS'; // Mot de passe défini directement

    try {
      const { data, error } = await this.supabase.signIn(email, password);
      if (error) {
        console.error('Login error:', error.message);
      } else {
        console.log('Login successful:', data);
        return this.router.navigateByUrl('/app/dash');
        // Redirection ou autre action après la connexion
        // return this.router.navigate(['/app/dash'], {
        //   skipLocationChange: false,
        // });
        return true;
      }
    } catch (err) {
      return console.error('Unexpected error:', err);
    }
    */
  }
}
