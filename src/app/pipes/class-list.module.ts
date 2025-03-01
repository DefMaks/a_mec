import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassListPipe } from './class-list.pipe';

@NgModule({
  declarations: [ClassListPipe],
  exports: [ClassListPipe],
  imports: [CommonModule],
})
export class ClassListModule {}
