import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RouteCheckService {
  private readonly keywords = ['/tenafep', '/tenasosp', '/exetat'];

  constructor(private router: Router) {}

  isInBasePath(): boolean {
    const currentPath = this.router.url.split('/')[2]; // Get the second segment of the URL path
    return (
      currentPath === 'tenafep' ||
      currentPath === 'tenasosp' ||
      currentPath === 'exetat'
    );
  }

  isInQuizPage(): boolean {
    const segments = this.router.url.split('/');
    const currentPath = segments[2]; // Get the second segment of the URL path
    const subPath = segments[3]; // Get the third segment of the URL path
    return (
      (currentPath === 'tenafep' ||
        currentPath === 'tenasosp' ||
        currentPath === 'exetat') &&
      subPath === 'quiz'
    );
  }

  getCurrentBasePath(): string | null {
    const currentPath = this.router.url.split('/')[2]; // Get the second segment of the URL path
    if (
      currentPath === 'tenafep' ||
      currentPath === 'tenasosp' ||
      currentPath === 'exetat'
    ) {
      return currentPath;
    }
    return null;
  }
}
