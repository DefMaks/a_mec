import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { AppGlobalService } from './app-global.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalFunctionsService {
  constructor(private location: Location, public appGlobal: AppGlobalService) {}

  goBack(ev: any) {
    return this.location.back();
  }

  get totalQuizLength(): number {
    return (
      this.appGlobal.user?.lessons?.reduce(
        (sum: any, lesson: any) => sum + (lesson.Quiz?.length || 0),
        0
      ) || 0
    );
  }

  slugify(str: string): string {
    str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
    str = str.toLowerCase(); // convert string to lowercase
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove accents
    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // remove consecutive hyphens
    return str;
  }
}
