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

  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session));
  }
}
