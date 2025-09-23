import { Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { AppGlobalService } from 'src/app/services/app-global.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { GlobalFunctionsService } from 'src/app/services/global-functions.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild(IonModal) modal!: IonModal;
  adminProposition = {
    subject: undefined,
    details: undefined,
  };

  quiz = 0;
  constructor(
    public appGlobal: AppGlobalService,
    public gf: GlobalFunctionsService
  ) {
    // Remove immediate call, will be called in ngOnInit
  }

  ngOnInit() {
    // Data should be available now, call countQuiz directly
    this.countQuiz();
  }

  async countQuiz() {
    try {
      let quizCount = 0;

      // Check if user is super_admin or admin (data should be available now)
      if (
        this.appGlobal.user?.role === 'super_admin' ||
        this.appGlobal.user?.role === 'admin'
      ) {
        // Calculate total quiz count (lessons should be available now)
        quizCount = (this.appGlobal.lessons || []).reduce(
          (total: number, lesson: any) => total + (lesson.Quiz?.length || 0),
          0
        );
      }

      console.log('Total des quiz :', quizCount);
      this.quiz = quizCount;
    } catch (error) {
      console.error('Erreur lors du comptage des quiz :', error);
      this.quiz = 0; // Set default value on error
    }
  }

  fermer() {
    this.modal.dismiss(null, 'cancel');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      // this.message = `Hello, ${ev.detail.data}!`;
    }
  }
  send() {
    // this.modal.dismiss(this.name, 'confirm');
    const proposition = this.adminProposition;
    console.log(proposition);
  }

}
