/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonicModule,
  IonicSafeString,
  ToastController,
} from '@ionic/angular';

import { AppGlobalService } from 'src/app/services/app-global.service';
import Quill from 'quill';
// @ts-ignore
import QuillBetterTable from 'quill-better-table'; // Import quill-better-table

import { GlobalFunctionsService } from 'src/app/services/global-functions.service';
import { SupabaseService } from 'src/app/services/supabase.service';

interface Quiz {
  question: string;
  correct_answer: Answer;
  incorrect_answers: Answer[];
}
interface Answer {
  type: string;
  content: string;
}

@Component({
  selector: 'app-teacher-world',
  templateUrl: './teacher-world.component.html',
  styleUrls: ['./teacher-world.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class TeacherWorldComponent implements OnInit, AfterViewInit {
  world: string | undefined;
  worldState: string | undefined;

  content: string | undefined;
  courseSelected!: any;
  courseSelectedTitle = '';

  subjectsForSelection!: any;
  coursesForSelection!: any;
  lessonsForSelection!: any;

  myClasses!: any;
  myLessons!: any;

  private quill!: Quill;
  private quizQuill!: Quill;

  course = {
    title: null,
    objectif: null,
    // title: 'Nommer, lire, écrire et représenter des nombres jusqu’à 99',
    cours: null,
    // cours: 'calculs',
    matiere: null,
    classe: null,
    // classe: '1ère Primaire',
    content: '',
    slug: '',
  };

  quillQuizEditors: any[] = [];

  quiz: Quiz[] = [
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
    {
      question: '',
      correct_answer: {
        type: '',
        content: '',
      },
      incorrect_answers: [
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
        {
          type: '',
          content: '',
        },
      ],
    },
  ];

  // Object to store the content of each editor by index
  editorContents: { [key: number]: string } = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appGlobal: AppGlobalService,
    private functions: GlobalFunctionsService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    // Accessing the data property from the route
    this.route.data.subscribe((data) => {
      this.world = data['world'];
      this.worldState = data['state'];
      if (this.worldState) {
        if (!this.appGlobal.user) {
          setTimeout(() => {
            // console.log('for Teacher page');
            // console.log(this.appGlobal.user);
            if (this.appGlobal.user?.teachers_classes) {
              if (this.appGlobal.user.teachers_classes.length === 1) {
                this.myClasses = this.appGlobal.user.teachers_classes;
                console.log('myClasses: ', this.myClasses);

                this.course.classe =
                  this.appGlobal.user.teachers_classes[0].classe;

                console.log('course model: ', this.course);
                this.loadSubjects(this.course.classe + '');

                // if (this.myClasses.length == 0) {
                //   this.course.classe = this.myClasses[0].Classes.slug;
                // }
              } else if (this.appGlobal.user.teachers_classes.length > 1) {
                this.myClasses = this.appGlobal.user.teachers_classes;
                console.log('myClasses: ', this.myClasses);
              }
            }
            return this.myClasses;
          }, 3500);
        } else {
          console.log('for Teacher page');
          console.log(this.appGlobal.user);
          if (this.appGlobal.user.teachers_classes) {
            if (this.appGlobal.user.teachers_classes.length === 1) {
              this.myClasses = this.appGlobal.user.teachers_classes;
              console.log('myClasses: ', this.myClasses);

              this.course.classe =
                this.appGlobal.user.teachers_classes[0].classe;
              console.log('course model: ', this.course);
              this.loadSubjects(this.course.classe + '');
            } else if (this.appGlobal.user.teachers_classes.length > 1) {
              this.myClasses = this.appGlobal.user.teachers_classes;
              console.log('myClasses: ', this.myClasses);
            }
            return this.myClasses;
          }
        }
      }
      // return this.world, console.log(this.world);
      return;
    });
  }

  ngAfterViewInit() {
    if (this.worldState) {
      // // Register the quill-better-table module with Quill
      // Quill.register(
      //   {
      //     'modules/better-table': QuillBetterTable,
      //   },
      //   true
      // );
      const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
        [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
        //[{ direction: 'rtl' }], // text direction
        ['blockquote'],
        // ['blockquote', 'code-block'],
        ['image'],
        // ['link', 'image', 'video', 'formula'],
        ['table'],

        [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],

        ['clean'], // remove formatting button
      ];
      if (this.world === 'courses') {
        this.quill = new Quill('#editor-container', {
          theme: 'snow',
          placeholder: 'Commencer à écrire',
          modules: {
            toolbar: toolbarOptions,
            // toolbar: '#editor-container-toolbar',
            // toolbar: [toolbarOptions],
            // keyboard: {
            //   bindings: QuillBetterTable.keyboardBindings,
            // },
            table: false, // disable table module

            'better-table': {
              operationMenu: {
                items: {
                  unmergeCells: {
                    text: 'Unmerge cells',
                  },
                  insertColumnRight: {
                    text: 'Insert column right',
                  },
                  insertColumnLeft: {
                    text: 'Insert column left',
                  },
                  insertRowAbove: {
                    text: 'Insert row above',
                  },
                  insertRowBelow: {
                    text: 'Insert row below',
                  },
                  deleteRow: {
                    text: 'Delete row',
                  },
                  deleteColumn: {
                    text: 'Delete column',
                  },
                  deleteTable: {
                    text: 'Delete table',
                  },
                },
              },
            },
            // toolbar: [
            //   [{ header: '1' }, { header: '2' }],
            //   ['bold', 'italic', 'underline'],
            //   [{ list: 'ordered' }, { list: 'bullet' }],
            //   ['link', 'image'],
            // ],
            // toolbar: {
            //   container: '#editor-container-toolbar', // Selector for toolbar container
            //   // handlers: {
            //   //   bold: customBoldHandler,
            //   // },
            //   toolbarOptions,
            // },
          },
        });
        // Listen for content changes in the Quill editor
        this.quill.on('text-change', () => {
          this.onEditorChange();
        });
      }

      if (this.world === 'quiz') {
        // this.quizQuill = new Quill('.quiz-editor', {});
        const editorElements = document.querySelectorAll('.quill-editor');

        editorElements.forEach((element: any, index) => {
          // Create a new Quill editor for each element
          const quill = new Quill(element, {
            theme: 'snow',

            placeholder: 'Écrire votre question',
            modules: {
              toolbar: toolbarOptions,
            },
          });
          // Store each Quill editor instance in the quillQuizEditors array
          this.quillQuizEditors.push(quill);

          quill.on('text-change', () => {
            const content = quill.root.innerHTML; // Get the HTML content
            this.editorContents[index] = this.getPlainText(content); // Save content to editorContents object
            this.quiz[index].question = content;

            // Log the updated content for this editor (optional for testing)
            // console.log(`Editor ${index + 1} content changed:`, content);
          });
        });
      }
    }
  }

  add() {
    console.log('Adding to ', this.world);
    // return console.log('Adding to ', this.world);
    switch (this.world?.trim()) {
      case 'courses':
        this.router.navigateByUrl('/app/new-cours');
        // this.worldState = 'new';
        break;

      case 'quiz':
        this.router.navigateByUrl('/app/new-quiz');
        // this.worldState = 'new';
        break;

      default:
        console.log('Error');
        break;
    }
  }
  back() {
    //return console.log('Adding to ', this.world);
    switch (this.world?.trim()) {
      case 'courses':
        this.router.navigateByUrl('/app/all-cours');
        // this.worldState = 'new';
        break;

      case 'quiz':
        this.router.navigateByUrl('/app/quiz');
        // this.worldState = 'new';
        break;

      default:
        console.log('Error');
        break;
    }
  }

  selectCourse(item: any, event: any) {
    // console.log(event);
    this.courseSelected = item;
    this.courseSelectedTitle = item.titre;
  }
  closePreviews(event: any) {
    this.courseSelectedTitle = '';
    this.courseSelected = false;
  }

  // NEW COURSE //
  handleChange(what: string, event: any) {
    console.log('CHANGING SELECTION CLASSES', event);
    switch (what) {
      case 'subject':
        this.loadSubjects(event.detail.value);

        break;
      case 'lessons':
        this.loadLessons(event.detail.value);

        break;

      default:
        this.loadCourses(event.detail.value);
        break;
    }
  }
  loadSubjects(classe_slug: string) {
    console.log('LOADING CLASSES FOR: ', classe_slug);
    const matieres = this.appGlobal.classes.find((item: any) => {
      return item.name_slug == classe_slug;
    });
    this.subjectsForSelection = matieres.Matiere;
    console.log(matieres, this.subjectsForSelection);
    this.lessonsForSelection = undefined;
    return this.subjectsForSelection;
  }

  loadCourses(subject_slug: string) {
    console.log('LOADING COURSES FOR: ', subject_slug);
    console.log('TEACHER DATA: ', this.appGlobal.user.lessons);
    const courses = this.subjectsForSelection.find((item: any) => {
      // console.log(item);
      if (item.courses) {
        console.log('Courses found', item.courses);

        // return item.courses == classe_slug;
      } else {
        console.warn('No courses found');
      }
      return item.slug == subject_slug;
      // if (this.appGlobal.user.lessons) {
      //   const mycourses = this.appGlobal.user.lessons.find((lesson: any) => {
      //     if (item.slug == lesson.courses.matiere) {
      //       console.log(item.slug, lesson.courses.matiere);
      //       // return item.slug == lesson.courses.matiere;
      //       return item;
      //     }
      //   });
      //   return mycourses;
      // } else {
      //   this.presentAlert("Vous n'avez pas encore soumis de leçon !");
      // }
    });
    console.log(courses);
    // return;
    this.coursesForSelection = courses.courses;
    // console.log(courses, this.coursesForSelection);
    this.lessonsForSelection = undefined;
    return this.coursesForSelection;
  }

  loadLessons(course_slug: string) {
    console.log('LOADING LESSONS FOR: ', course_slug);
    console.log('selection for:  ', this.coursesForSelection);
    /*
    const lessons = this.coursesForSelection.find((item: any) => {
      console.log(item, course_slug);
      // if (item.courses) {
      //   console.log('Courses found', item.courses);

      //   // return item.courses == classe_slug;
      // } else {
      //   console.warn('No courses found');
      // }
      // return (item.slug == course_slug && item.);
    });
    */
    const lessons = this.appGlobal.user.lessons.filter((item: any) => {
      console.log(item, course_slug);
      // if (item.courses) {
      //   console.log('Courses found', item.courses);

      //   // return item.courses == classe_slug;
      // } else {
      //   console.warn('No courses found');
      // }
      return item.course == course_slug;
    });
    console.log('Loaded lessons: ', lessons.lessons);
    console.log('Loaded lessons lessons: ', lessons);
    if (!lessons || lessons.length == 0) {
      this.presentAlert("Aucune leçon n'a été fournie ");
      this.lessonsForSelection = null;
      return;
    }
    this.lessonsForSelection = lessons;
    // console.log(courses, this.coursesForSelection);
    // return this.coursesForSelection;
  }

  // Method to handle content changes
  onEditorChange() {
    this.course.content = this.quill.root.innerHTML;
    // console.log('Content updated:', this.course.content);
    // Perform any additional actions, such as saving the updated content or updating UI
  }
  // Method to get the editor's content
  getEditorContent() {
    this.course.slug =
      this.course.cours + '_' + this.functions.slugify(this.course.title + '');

    if (this.course.title) {
      // this.course.slug == slug;
      // const editorContent = this.quill.root.innerHTML;
      console.log(this.course);
      // Optionally, do something with the content (e.g., save it or display it)
      this.supabase.insertNewLesson(this.course).then((res) => {
        console.log(res);
        if (res.data) {
          this.router.navigateByUrl('/app/all-cours');
        }
        // if (this.reinitializeCourse()) {
        //   return this.router.navigateByUrl('/app/all-cours');
        // }
        return this.appGlobal.user.lessons;
      });
    }
  }

  // Method to check if the form is valid
  isFormValid() {
    // Return true if all fields are filled, otherwise return false
    return (
      this.course.title &&
      this.course.cours &&
      this.course.matiere &&
      this.course.classe &&
      this.course.content.trim().length > 0 &&
      this.course.content !== '<p><br></p>'
    );
  }

  // NEW COURSE //

  reinitializeCourse() {
    this.course.title = null;
    this.course.cours = null;
    this.course.matiere = null;
    this.course.classe = null;
    this.course.content = '';
    this.course.slug = '';

    return this.course;
  }

  // NEW QUIZ
  getPlainText(text: string): string {
    const strippedText = text.replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
    return strippedText; // Limit to first 6 characters
  }
  onQuizEditorChange(quizNumber: number) {
    this.quiz[quizNumber].question = this.quill.root.innerHTML;
    // console.log('Content updated:', this.course.content);
    // Perform any additional actions, such as saving the updated content or updating UI
  }
  // Method to submit and retrieve content from all Quill editors
  validateQuestion(quiz: any): number {
    let validateQuestions = 1; // Par défaut, considérer que tout est correct

    // Parcourir le tableau des quiz
    for (const item of this.quiz) {
      // Vérifier si la question est vide

      if (
        !item.question.trim() ||
        item.question == '' ||
        item.question == '<p></p>' ||
        item.question == '<p><br></p>'
      ) {
        validateQuestions = 0;
        console.error('Une question est vide.');
        break;
      }

      // Vérifier si la réponse correcte est vide
      if (
        !item.correct_answer.content.trim() ||
        item.correct_answer.content == ''
      ) {
        // if (
        //   !item.correct_answer.content.trim() ||
        //   !item.correct_answer.type.trim()
        // ) {
        validateQuestions = 0;
        console.error('Une réponse correcte est vide.');
        break;
      }

      // Vérifier si une des réponses incorrectes est vide
      for (const answer of item.incorrect_answers) {
        if (!answer.content.trim() || answer.content == '') {
          // if (!answer.content.trim() || !answer.type.trim()) {
          validateQuestions = 0;
          console.error('Une réponse incorrecte est vide.');
          break;
        }
      }

      // Sortir de la boucle si une erreur est détectée
      if (validateQuestions === 0) {
        break;
      }
    }

    // Lancer une exception ou un message si une erreur est détectée
    if (validateQuestions === 0) {
      // throw new Error(
      //   'Veuillez remplir toutes les questions et réponses avant de soumettre le quiz.'
      // );
      this.operationAlert(
        'Veuillez remplir toutes les questions et réponses avant de soumettre le quiz.',
        false
      );
    } else {
      console.log(
        'Toutes les questions et réponses sont correctement remplies.'
      );
      // return validateQuestions;
    }

    // Retournez la valeur pour d'autres traitements si nécessaire
    return validateQuestions;
  }
  submitQuiz() {
    let validateQuestions = undefined;
    // Get the content of each editor and log it
    const allContents = this.quillQuizEditors.map((quill, index) => {
      return {
        index: index + 1, // For reference, the index (1-based)
        content: quill.root.innerHTML,
      };
    });

    console.log(this.course);

    // this.quiz = allContents
    /*
    this.quiz = [
      {
        question: '<p>Combien d’unités composent une dizaine ?</p>',
        correct_answer: {
          type: '',
          content: '10',
        },
        incorrect_answers: [
          {
            type: '',
            content: '1',
          },
          {
            type: '',
            content: '5',
          },
          {
            type: '',
            content: '8',
          },
        ],
      },
      {
        question:
          '<p>Que représente un groupe de 5 points dans l’image ?</p><p><img src="data:image/png;base64,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"></p>',
        correct_answer: {
          type: '',
          content: '5 unités',
        },
        incorrect_answers: [
          {
            type: '',
            content: '1 dizaine',
          },
          {
            type: '',
            content: '8 unités',
          },
          {
            type: '',
            content: '10 unités',
          },
        ],
      },
      {
        question: '<p>Dans le nombre 38, combien y a-t-il de dizaines ?</p>',
        correct_answer: {
          type: '',
          content: '3',
        },
        incorrect_answers: [
          {
            type: '',
            content: '1',
          },
          {
            type: '',
            content: '2',
          },
          {
            type: '',
            content: '4',
          },
        ],
      },
      {
        question:
          '<p>Dans le nombre 38, combien y a-t-il d’unités ?</p><p><br></p>',
        correct_answer: {
          type: '',
          content: '8',
        },
        incorrect_answers: [
          {
            type: '',
            content: '10',
          },
          {
            type: '',
            content: '5',
          },
          {
            type: '',
            content: '3',
          },
        ],
      },
      {
        question: '<p>En quoi le nombre 38 se décompose-t-il ?</p>',
        correct_answer: {
          type: '',
          content: '10 + 10 + 10 + 8',
        },
        incorrect_answers: [
          {
            type: '',
            content: '10 + 5 + 8',
          },
          {
            type: '',
            content: '8 + 8 + 8 + 8',
          },
          {
            type: '',
            content: '5 + 5 + 10',
          },
        ],
      },
      {
        question:
          '<p>Si vous avez 1 dizaine et 5 unités, quel est le nombre ?</p>',
        correct_answer: {
          type: '',
          content: '15',
        },
        incorrect_answers: [
          {
            type: '',
            content: '10',
          },
          {
            type: '',
            content: '5',
          },
          {
            type: '',
            content: '20',
          },
        ],
      },
      {
        question:
          '<p>Laquelle des options suivantes représente une dizaine ?</p>',
        correct_answer: {
          type: '',
          content: 'Un groupe de 10 points',
        },
        incorrect_answers: [
          {
            type: '',
            content: 'Un seul point',
          },
          {
            type: '',
            content: 'Un groupe de 8 points',
          },
          {
            type: '',
            content: 'Un groupe de 5 points',
          },
        ],
      },
      {
        question:
          '<p>Si vous avez 2 dizaines et 6 unités, quel est le nombre ?</p><p><br></p>',
        correct_answer: {
          type: '',
          content: '26',
        },
        incorrect_answers: [
          {
            type: '',
            content: '16',
          },
          {
            type: '',
            content: '36',
          },
          {
            type: '',
            content: '12',
          },
        ],
      },
      {
        question: '<p>Quel nombre est composé de 4 dizaines et 2 unités ?</p>',
        correct_answer: {
          type: '',
          content: '42',
        },
        incorrect_answers: [
          {
            type: '',
            content: '12',
          },
          {
            type: '',
            content: '24',
          },
          {
            type: '',
            content: '32',
          },
        ],
      },
      {
        question:
          '<p>Quel nombre est représenté par 3 dizaines et 2 unités ?</p><p><br></p>',
        correct_answer: {
          type: '',
          content: '32',
        },
        incorrect_answers: [
          {
            type: '',
            content: '29',
          },
          {
            type: '',
            content: '30',
          },
          {
            type: '',
            content: '38',
          },
        ],
      },
    ];*/
    let codeQuiz = '';
    if (this.course.cours)
      codeQuiz = this.generateQuizCode(this.course.title + '');

    const quizFields = {
      quiz: this.quiz,
      title: codeQuiz + '',
      // title: this.course.title + '',
      lesson: this.course.title,
      // lesson: this.course.cours,
      teacher: this.appGlobal.user.id,
      code: codeQuiz,
    };
    // Log or process all the collected contents
    // console.log('Content from all quiz editors:', allContents);
    // console.log(this.quiz);
    console.log(
      'Final Quiz data: ',
      quizFields,
      ' Lesson: ',
      this.course.cours
    );
    // return;

    // Example: Submit the content to a form or service
    // this.yourService.submitQuizContent(allContents);
    console.log('Inserting Quiz');
    validateQuestions = this.validateQuestion(quizFields.quiz);

    if (validateQuestions == 0) {
      console.log('Revoir les questions vides');
      return false;
    } else if (validateQuestions == 1) {
      console.log('Formulaire complet');
      //this.presentAlert('Formulaire complet');

      setTimeout(() => {
        this.validationToast('Inscription en cours', 'lightgrey');
      }, 1500);

      console.log(validateQuestions);
      // return;
      // return;
      return this.supabase.insertNewQuiz(quizFields).then((res: any) => {
        console.log(res);

        if (res) {
          if (res.data) {
            console.log(res.data);
            this.ressettingQuiz();
            this.operationAlert('Quiz a été soumis avec succès', true);
          } else {
            console.log(res);
            this.operationAlert('Echec soumission Quiz', false);
          }
        }
      });
    }
    return console.log('Ending Submission');
  }
  _submitQuiz() {
    // Step 1: Validate all quizzes
    const isValid = this.quiz.every((quizItem, index) => {
      const hasQuestion = quizItem.question.trim() !== '';
      const hasCorrectAnswer = quizItem.correct_answer.content.trim() !== '';
      const allIncorrectAnswersProvided = quizItem.incorrect_answers.every(
        (answer) => answer.content.trim() !== ''
      );

      // Log validation status for each quiz item
      console.log(
        `Quiz ${
          index + 1
        }: hasQuestion=${hasQuestion}, hasCorrectAnswer=${hasCorrectAnswer}, allIncorrectAnswersProvided=${allIncorrectAnswersProvided}`
      );

      return hasQuestion && hasCorrectAnswer && allIncorrectAnswersProvided;
    });

    // Step 2: Check the validity and proceed
    if (!isValid) {
      // If not valid, alert the user or show an error message
      console.log(
        'Some quizzes are not valid. Please fill in all the required fields.'
      );
      return; // Stop submission if not valid
    }

    // Step 3: If valid, proceed to gather contents
    const allContents = this.quillQuizEditors.map((quill, index) => {
      return {
        index: index + 1, // For reference, the index (1-based)
        content: quill.root.innerHTML,
      };
    });

    // Log or process all the collected contents
    console.log('Content from all quiz editors:', allContents);
    console.log(this.quiz);

    // Example: Submit the content to a form or service
    // this.yourService.submitQuizContent(allContents);
  }
  ressettingQuiz() {
    this.course = {
      title: null,
      objectif: null,
      cours: null,
      matiere: null,
      classe: null,
      content: '',
      slug: '',
    };
    this.quiz.every((quizItem) => {
      quizItem.question = '';
      quizItem.correct_answer.content = '';
      quizItem.incorrect_answers.every(
        (answer) => answer.content.trim() !== ''
      );
    });
  }

  generateQuizCode(baseCode: string) {
    // Crée un nouvel objet Date pour obtenir la date et l'heure actuelles
    const now = new Date();

    // Récupère chaque partie de la date
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés à partir de 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Formate la date au format YYYYMMDDHHiiSS
    const formattedDate = `${year}${month}${day}${hours}${minutes}${seconds}`;

    // Génère le code de quiz final avec underscore comme séparateur dans la partie slug
    return `${baseCode}_${formattedDate}`;
  }

  // NEW QUIZ

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alerte !',
      mode: 'ios',
      // subHeader: 'Subtitle',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async validationToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg + '',
      duration: 1500,
      color: color,
      position: 'middle',
      mode: 'md',
    });
    toast.present();
  }

  async operationAlert(msg: string, isSuccess: boolean) {
    if (isSuccess) {
      const toast = await this.toastController.create({
        message: msg,
        color: 'success',
        position: 'middle',
        duration: 2000,
      });
      toast.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Note !',
        // header: new IonicSafeString(
        //   `<ion-icon slot="start" name="add"></ion-icon>`
        // ),
        mode: 'ios',
        // subHeader: 'Subtitle',
        message: msg,
        // color:'',
        buttons: ['OK'],
      });

      await alert.present();
    }
  }

  navigate(url: string) {
    return this.router.navigateByUrl(url);
  }
}
