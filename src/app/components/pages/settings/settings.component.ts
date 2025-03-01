/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AppGlobalService } from 'src/app/services/app-global.service';
import { GlobalFunctionsService } from 'src/app/services/global-functions.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SettingsComponent implements OnInit {
  filteredSchools: any = [];
  isSearching = false;

  // SUPER ADMIN
  appContent = {
    slug: '',
    label: '',
  };
  newMatiere = {
    name: '',
    niveau: '',
    classe: '',
    section: '',
    option: '',
    slug: '',
  };
  newMatiereSelects = {
    niveau: '',
    classe: undefined,
    section: undefined,
    option: [],
  };

  newCourse = {
    name: '',
    niveau: '',
    classe: '',
    section: '',
    option: '',
    matiere: '',
    slug: '',
  };
  newCourseSelects = {
    niveau: '',
    classe: undefined,
    section: undefined,
    option: [],
    matiere: undefined,
  };
  // SUPER ADMIN

  constructor(
    public appGlobal: AppGlobalService,
    private supabase: SupabaseService,
    private functions: GlobalFunctionsService
  ) {
    if (appGlobal.schools) {
      this.filteredSchools = [...this.appGlobal.schools]; // Start with full list
    }
  }

  ngOnInit() {}

  filterIng(choice: string, motive: string, itemS: any, ev: any | undefined) {
    // return console.log(motive, item);
    console.log(motive, ' | ', itemS);
    if (choice === 'matiere') {
      switch (motive) {
        case 'niveau':
          this.appGlobal.niveaux.forEach((item: any) => {
            if (item.classe_slug == itemS) {
              // console.log(item.name);
              this.newMatiereSelects.niveau = item.name;
              console.log(itemS);
              this.newMatiereSelects.classe = item.Classes.filter(
                (item2: any) => {
                  this.newMatiereSelects.niveau = item.name;
                  return item2.niveau.trim() == itemS.trim();
                }
              );
              return this.newMatiereSelects.classe;
            }
          });

          console.log(this.newMatiereSelects.classe);
          console.log(this.newMatiereSelects);
          break;

        default:
          break;
      }
    } else {
      switch (motive) {
        case 'niveau':
          this.appGlobal.niveaux.forEach((item: any) => {
            if (item.classe_slug == itemS) {
              // console.log(item.name);
              this.newCourseSelects.niveau = item.name;
              console.log(itemS);
              this.newCourseSelects.classe = item.Classes.filter(
                (item2: any) => {
                  this.newCourseSelects.niveau = item.name;
                  return item2.niveau.trim() == itemS.trim();
                }
              );
              return this.newCourseSelects.classe;
            }
          });

          console.log(this.newCourseSelects.classe);
          console.log(this.newCourseSelects);
          break;

        case 'classe':
          // return console.log(this.appGlobal.matiere);
          this.newCourseSelects.matiere = this.appGlobal.matiere.filter(
            (item: any) => {
              return item.classe === itemS;
            }
          );
          console.log(this.newCourseSelects.matiere);
          return this.newCourseSelects.matiere;

          break;

        default:
          break;
      }
    }
  }
  insertCourseMatiere(ev: any) {
    if (this.appContent.slug === 'matiere') {
      const slug = this.functions.slugify(this.newMatiere.name);
      this.newMatiere.slug = slug;
      this.newMatiere.slug =
        this.newMatiere.classe.split('-').slice(0, 2).join('-') + '-' + slug;
      console.log(this.newMatiere);
      // return;
      return this.supabase.insertNewSubject(this.newCourse).then((res) => {
        if (res.data) {
          // this.resetting();

          this.halfResetting();
          setTimeout(() => {
            const test = this.appGlobal?.matiere.filter((item: any) => {
              return item.classe === this.newCourse.classe;
            });
            this.newCourseSelects.matiere = test;
            console.log(this.newCourseSelects.matiere, test);
          }, 900);
          return this.newCourseSelects.matiere;
        }
      });
    } else {
      const slug = this.functions.slugify(this.newCourse.name);
      this.newCourse.slug = this.newCourse.matiere + '_' + slug;
      console.log(this.newCourse);
      return this.supabase.insertNewCourse(this.newCourse).then((res) => {
        // console.log(res);
        if (res.data) {
          // this.resetting();

          this.halfResetting();
          setTimeout(() => {
            const test = this.appGlobal?.matiere.filter((item: any) => {
              return item.classe === this.newCourse.classe;
            });
            this.newCourseSelects.matiere = test;
            console.log(this.newCourseSelects.matiere, test);
          }, 900);
          return this.newCourseSelects.matiere;
        }
      });
    }
  }

  onSearchChange(event: any) {
    const searchTerm = event.target.value?.toLowerCase() || '';

    if (searchTerm) {
      this.isSearching = true;
      this.filteredSchools = this.appGlobal.schools.filter((school: any) =>
        school.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.isSearching = false;
      this.filteredSchools = [...this.appGlobal.schools]; // Reset to full list
    }
  }

  matiereCourse(ev: any) {
    // console.log(ev.detail.value);
    // this.appContent.slug = ev.detail.value;
    if (this.appContent.slug == 'matiere') {
      return (this.appContent.label = 'Matière'), this.resetting();
    } else {
      return (this.appContent.label = 'Cours'), this.resetting();
    }
  }

  resetting() {
    this.newMatiere.classe = '';
    this.newMatiere.name = '';
    this.newMatiere.niveau = '';
    this.newMatiere.option = '';
    this.newMatiere.section = '';
    this.newMatiere.slug = '';

    this.newCourse.classe = '';
    this.newCourse.matiere = '';
    this.newCourse.name = '';
    this.newCourse.niveau = '';
    this.newCourse.option = '';
    this.newCourse.section = '';
    this.newCourse.slug = '';
  }
  halfResetting() {
    this.newMatiere.name = '';

    this.newCourse.name = '';
    return this.newCourse, this.newMatiere;
  }
}
