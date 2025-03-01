import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'classList',
})
export class ClassListPipe implements PipeTransform {
  transform(teachersClasses: any[]): string {
    console.log('ClassListPipe is called'); // Add this line for debugging
    if (!teachersClasses || teachersClasses.length === 0) {
      return 'Aucune classe';
    } else if (teachersClasses.length === 1) {
      return teachersClasses[0].Classes.name;
    } else {
      return teachersClasses.map((tc) => tc.Classes.name).join(', ');
    }
  }
}
