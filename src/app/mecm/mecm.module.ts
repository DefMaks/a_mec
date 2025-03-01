import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MecmPageRoutingModule } from './mecm-routing.module';

import { MecmPage } from './mecm.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MecmPageRoutingModule],
  declarations: [MecmPage],
})
export class MecmPageModule {}
