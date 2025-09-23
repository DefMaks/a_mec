/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component } from '@angular/core';
import { AppGlobalService } from './services/app-global.service';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  session = this.supabase.session;
  constructor(
    public appGlobal: AppGlobalService,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    this.supabase.authChanges(async (_, session) => {
      this.session = session;
      if (session?.user) {
        // Wait for profile and all data to be loaded
        await this.supabase.profile(session.user);
      }
    });
  }
}
