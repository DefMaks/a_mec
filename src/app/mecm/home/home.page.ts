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
    this.countQuiz();
  }

  async countQuiz() {
    try {
      let quizCount = 0;

      // Attendre que l'utilisateur soit disponible et que le rôle soit défini
      await this.waitForCondition(() => this.appGlobal.user?.role, 150, 15000);

      // Vérifier si l'utilisateur est super_admin ou admin
      if (
        this.appGlobal.user.role === 'super_admin' ||
        this.appGlobal.user.role === 'admin'
      ) {
        // Attendre que les leçons soient disponibles
        await this.waitForCondition(() => this.appGlobal.lessons, 150, 15000);

        // Calculer le total des quiz
        quizCount = this.appGlobal.lessons.reduce(
          (total: number, lesson: any) => total + (lesson.Quiz?.length || 0),
          0
        );
      }

      // console.log('Total des quiz :', quizCount);
      this.quiz = quizCount;
    } catch (error) {
      console.error('Erreur lors du comptage des quiz :', error);
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

  // Fonction utilitaire pour attendre une condition
  waitForCondition(
    conditionFn: () => boolean,
    interval = 150,
    timeout = 10000
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkCondition = () => {
        if (conditionFn()) {
          resolve();
        } else if (Date.now() - startTime >= timeout) {
          reject(
            new Error("Timeout atteint lors de l'attente de la condition")
          );
        } else {
          setTimeout(checkCondition, interval);
        }
      };

      checkCondition();
    });
  }
}
