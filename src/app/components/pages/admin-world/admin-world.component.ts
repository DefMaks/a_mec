/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AppGlobalService } from 'src/app/services/app-global.service';

@Component({
  selector: 'app-admin-world',
  templateUrl: './admin-world.component.html',
  styleUrls: ['./admin-world.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AdminWorldComponent implements OnInit {
  pageData: string | undefined;

  // Array to store teachers
  teachers: any[] = [];
  filteredTeachers: any[] = [];

  filters: any;

  constructor(
    private route: ActivatedRoute,
    public appGlobal: AppGlobalService
  ) {}

  ngOnInit(): void {
    // Access `data` using snapshot
    this.pageData = this.route.snapshot.data['page'];

    // Or subscribe to data observable
    this.route.data.subscribe((data) => {
      console.log('Route Data:', data);
      this.pageData = data['page'];
      if (this.pageData === 'all-teachers') {
        this.filters = {
          name: '',
          sexe: '',
          email: '',
          active: '',
        };
      }
    });

    // Initialize teachers from the data object
    this.teachers = this.appGlobal.usersByRoles.teachers;
    this.filteredTeachers = [...this.teachers];
  }

  // Apply filters
  applyFilters() {
    this.filteredTeachers = this.teachers.filter((teacher) => {
      const matchesName =
        !this.filters.name ||
        teacher.names.toLowerCase().includes(this.filters.name.toLowerCase());
      const matchesEmail =
        !this.filters.email ||
        teacher.email.toLowerCase().includes(this.filters.email.toLowerCase());
      const matchesSex =
        !this.filters.sexe ||
        teacher.sexe.toLowerCase().includes(this.filters.sexe.toLowerCase());
      const matchesActive =
        this.filters.active === '' ||
        teacher.active === (this.filters.active === 'true');

      return matchesName && matchesEmail && matchesActive && matchesSex;
    });
  }
}
