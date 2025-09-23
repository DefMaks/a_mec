import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MecmPage } from './mecm.page';
import { TeacherWorldComponent } from '../components/pages/teacher-world/teacher-world.component';
import { SettingsComponent } from '../components/pages/settings/settings.component';
import { ChatLogComponent } from '../components/pages/chat-log/chat-log.component';
import { AdminWorldComponent } from '../components/pages/admin-world/admin-world.component';

const routes: Routes = [
  {
    path: '',
    component: MecmPage,
    children: [
      {
        path: 'dash',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      // TEACHER WORLD
      {
        path: 'all-cours',
        component: TeacherWorldComponent,
        data: {
          world: 'courses',
        },
      },
      {
        path: 'new-cours',
        component: TeacherWorldComponent,
        data: {
          world: 'courses',
          state: 'new',
        },
      },
      {
        path: 'quiz',
        component: TeacherWorldComponent,
        data: {
          world: 'quiz',
        },
      },
      // END TEACHER WORLD

      {
        path: 'chat-log',
        component: ChatLogComponent,
      },
      {
        path: 'new-quiz',
        component: TeacherWorldComponent,
        data: {
          world: 'quiz',
          state: 'new',
        },
      },
      // ADMIN WORLD
      {
        path: 'all-teachers',
        component: AdminWorldComponent,
        data: {
          page: 'all-teachers',
        },
      },
      {
        path: 'teachers/:id',
        component: AdminWorldComponent,
        data: {
          page: 'teachers',
        },
      },
      {
        path: 'all-students',
        component: AdminWorldComponent,
        data: {
          page: 'all-students',
        },
      },
      {
        path: 'students/:id',
        component: AdminWorldComponent,
        data: {
          page: 'students',
        },
      },
      {
        path: 'all-parents',
        component: AdminWorldComponent,
      },
      {
        path: 'parents/:id',
        component: AdminWorldComponent,
      },
      {
        path: 'parent-payment',
        loadComponent: () =>
          import('../components/pages/parent-payment/parent-payment.component').then(
            (m) => m.ParentPaymentComponent
          ),
      },
      // END ADMIN WORLD

      {
        path: '**',
        loadChildren: () =>
          import('../not-found/not-found.module').then(
            (m) => m.NotFoundPageModule
          ),
      },
      {
        path: '',
        redirectTo: 'dash',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MecmPageRoutingModule {}
