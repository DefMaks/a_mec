import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AppGlobalService } from './app-global.service';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  constructor(
    private supabase: SupabaseService,
    public appGlobal: AppGlobalService
  ) {
    // this.listening();
  }

  listening() {
    // let getMessage = 0;
    // // setInterval(() => {
    // console.log('Listening');
    // if (this.appGlobal.newMessage == 1) {
    //   getMessage = 1;
    //   console.log('Listening: ', getMessage);
    //   this.supabase.getChat().then(() => {
    //     this.appGlobal.newMessage = 0;
    //   });
    // }
    // // }, 2500);
    // return getMessage;
  }
}
