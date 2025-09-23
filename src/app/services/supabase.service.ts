import { Injectable, OnDestroy } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
  RealtimeChannel,
} from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { AppGlobalService } from './app-global.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GlobalFunctionsService } from './global-functions.service';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService implements OnDestroy {
  private supabase!: SupabaseClient;
  supabase_url = environment.SUPABASE_URL;
  supabase_key = environment.SUPABASE_KEY;

  currentRole = '';

  _session: AuthSession | null = null;

  // TABLES
  USERS_DB = 'Users';
  STUDENTS_DB = 'Students';
  MATIERE_DB = 'Matiere';
  // MATIERE_DB = 'Matiere';
  COURSES_DB = 'courses';
  CLASSES_DB = 'Classes';
  QUIZ_DB = 'Quiz';
  LESSONS_DB = 'lessons';

  subscriptions: any;

  // TABLES

  constructor(
    private toastController: ToastController,
    public appGlobal: AppGlobalService,
    private gf: GlobalFunctionsService,
    private router: Router
  ) {
    this.supabase = createClient(
      this.supabase_url, // Supabase URL
      this.supabase_key // Supabase Public Anon Key
    );
    this.addMatiere();
  }

  get session() {
    if (!this._session) {
      const savedSession = localStorage.getItem('supabaseSession');
      this._session = savedSession ? JSON.parse(savedSession) : null;
    }
    return this._session;
  }

  getSession(): Session | null {
    const sessionStr = localStorage.getItem('supabaseSession');
    if (sessionStr) {
      // console.log(this.appGlobal.user);
    }
    return sessionStr ? JSON.parse(sessionStr) : null;
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const userId = session.user.id;
          const user = session.user;
          await this.profile(user);
          this.listenChanges();
          // Call callback after profile is loaded
          callback(event, session);
        } catch (error) {
          console.error('Error during sign in process:', error);
          callback(event, session);
        }
      } else {
        callback(event, session);
      }
    });
  }

  // AUTHENTICATION AREA

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.session) {
      this._session = data.session; // Save session
    }
    return { data, error };
  }

  signOut() {
    return this.supabase.auth.signOut();
  }
  // AUTHENTICATION AREA

  // GET PROFILE

  async profile(user: User) {
    try {
      const { data, error } = await this.supabase
        .from(this.USERS_DB)
        .select(`*`)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return undefined;
      }
      
      console.log(data);
      this.appGlobal.user = data;
      this.currentRole = data.role;
      
      setTimeout(async () => {
        try {
          await this.initQueries();
        } catch (error) {
          console.error('Error initializing queries:', error);
        }
      }, 500);
      
      return this.appGlobal;
    } catch (error) {
      console.error('Error in profile method:', error);
      return undefined;
    }
  }
  // c5135af3-092c-4626-ace5-c8f60f7d288b
  // GET PROFILE

  // INIT QUERIES
  async initQueries() {
    try {
      await this.getRoles();
      await this.getSubjects();
      await this.getSchools();
      
      // Execute all queries sequentially without delays
      try {
        await this.getClasses();
        
        if (
          this.appGlobal.user.role == 'super_admin' ||
          this.appGlobal.user.role == 'admin' ||
          this.appGlobal.user.role == 'teacher'
        ) {
          await this.getChat();
          await this.getLessons();
        }
      } catch (error) {
        console.error('Error in delayed queries:', error);
      }
      
      console.log(this.appGlobal);
      return this.appGlobal;
    } catch (error) {
      console.error('Error in initQueries:', error);
      return this.appGlobal;
    }
  }
  // INIT QUERIES

  async getSchools() {
    try {
      const { data, error } = await this.supabase.from('Ecole').select('*');
      if (data && !error) {
        this.appGlobal.schools = data;
      } else if (error && error.code === '42P01') {
        console.warn('Ecole table does not exist');
        this.appGlobal.schools = [];
      } else if (error) {
        console.error('Error fetching schools:', error);
        this.appGlobal.schools = [];
      }
    } catch (error) {
      console.error('Network error loading schools:', error);
      this.appGlobal.schools = [];
    }
  }

  // QUERIES
  async getUsersByRoles(roles: string) {
    if (roles != 'student') {
      return await this.supabase
        .from(this.USERS_DB)
        .select('*')
        .eq('role', roles)
        .then((res: any) => {
          //this.appGlobal.usersByRoles.admins = res.data;
          // console.log('Role ', roles, ' : ', res);
        });
    }
  }
  async insertMatiere() {
    const { data, error } = await this.supabase
      .from(this.MATIERE_DB)
      // .insert()
      .select();
  }

  async getLessons() {
    try {
      const { data, error } = await this.supabase
        .from('lessons')
        .select(`*, Quiz(*), courses(*, Matiere(*)), teacher(*), lesson_reads(*)`);
      
      if (error) {
        console.error('Error fetching lessons:', error);
        return 0;
      }
      
      if (data) {
        this.appGlobal.lessons = data;
        
        if (this.appGlobal.user?.role == 'teacher') {
          let totalQuizLength = 0;
          if (Array.isArray(this.appGlobal.user?.lessons)) {
            this.appGlobal.user.lessons.forEach((element: any) => {
              totalQuizLength += element.Quiz?.length || 0;
            });
          }
          this.appGlobal.totalQuizLength = totalQuizLength;
          return totalQuizLength;
        }
      }
      
      return this.appGlobal.totalQuizLength || 0;
    } catch (error) {
      console.error('Network error loading lessons:', error);
      // Ensure lessons is always an array
      if (!this.appGlobal.lessons) {
        this.appGlobal.lessons = [];
      }
      return 0;
    }
  }

  async getRoles() {
    try {
      const { data: users, error } = await this.supabase
        .from(this.USERS_DB)
        .select(`*`);
      
      if (error) {
        console.error('Error fetching users for roles:', error);
        return this.appGlobal;
      }
      
      try {
        let selectQuery = `*`; // Default select query

        switch (this.currentRole) {
          case 'super_admin':
            // Filter out the roles relevant to super_admin
            const superAdminRoles = [
              'super_admin',
              'admin',
              'inspector',
              'teacher',
              'parent',
              'student',
            ];

            // Perform additional queries for each role if needed
            if (superAdminRoles) {
              superAdminRoles.forEach(async (item: any) => {
                // // console.log(item);
                switch (item) {
                  case 'super_admin':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for super_admin
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'super_admin');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.super_admins = data;
                      }
                    } catch (error) {
                      console.error('Error fetching super_admins:', error);
                    }
                    break;

                  case 'admin':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for admin
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'admin');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.admins = data;
                      }
                    } catch (error) {
                      console.error('Error fetching admins:', error);
                    }
                    break;

                  case 'inspector':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for inspector
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'inspector');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.inspectors = data;
                      }
                    } catch (error) {
                      console.error('Error fetching inspectors:', error);
                    }
                    break;

                  case 'teacher':
                    selectQuery = `*, teachers_classes(*, Classes(*))`; // Default select query

                    // Additional query or processing for teacher
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'teacher');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.teachers = data;
                      }
                    } catch (error) {
                      console.error('Error fetching teachers:', error);
                    }
                    break;

                  case 'parent':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for parent
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'parent');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.parents = data;
                      }
                    } catch (error) {
                      console.error('Error fetching parents:', error);
                    }
                    break;

                  case 'student':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for student
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'student');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.students = data;
                      }
                    } catch (error) {
                      console.error('Error fetching students:', error);
                    }
                    break;
                }
              });
            }
            break;

          case 'admin':
            // Similar filtering and querying logic for admin
            const adminRoles = [
              'admin',
              'inspector',
              'teacher',
              'parent',
              'student',
            ];

            if (adminRoles) {
              adminRoles.forEach(async (item: any) => {
                // // console.log(item);
                switch (item) {
                  case 'admin':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for admin
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'admin');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.admins = data;
                      }
                    } catch (error) {
                      console.error('Error fetching admins:', error);
                    }
                    break;

                  case 'inspector':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for inspector
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'inspector');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.inspectors = data;
                      }
                    } catch (error) {
                      console.error('Error fetching inspectors:', error);
                    }
                    break;

                  case 'teacher':
                    selectQuery = `*, teachers_classes(*, Classes(*))`; // Default select query

                    // Additional query or processing for teacher
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'teacher');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.teachers = data;
                      }
                    } catch (error) {
                      console.error('Error fetching teachers:', error);
                    }
                    break;

                  case 'parent':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for parent
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'parent');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.parents = data;
                      }
                    } catch (error) {
                      console.error('Error fetching parents:', error);
                    }
                    break;

                  case 'student':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for student
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'student');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.students = data;
                      }
                    } catch (error) {
                      console.error('Error fetching students:', error);
                    }
                    break;
                }
              });
            }
            break;

          case 'inspector':
            // Similar filtering and querying logic for admin
            const inspectorRoles = ['inspector', 'teacher', 'student'];

            if (inspectorRoles) {
              inspectorRoles.forEach(async (item: any) => {
                // // console.log(item);
                switch (item) {
                  case 'inspector':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for inspector
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'inspector');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.inspectors = data;
                      }
                    } catch (error) {
                      console.error('Error fetching inspectors:', error);
                    }
                    break;

                  case 'teacher':
                    selectQuery = `* `; // Default select query

                    // Additional query or processing for teacher
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'teacher');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.teachers = data;
                      }
                    } catch (error) {
                      console.error('Error fetching teachers:', error);
                    }
                    break;

                  case 'student':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for student
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'student');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.students = data;
                      }
                    } catch (error) {
                      console.error('Error fetching students:', error);
                    }
                    break;
                }
              });
            }
            break;

          case 'teacher':
            // Similar filtering and querying logic for admin
            const teacherRoles = ['teacher', 'student'];

            if (teacherRoles) {
              teacherRoles.forEach(async (item: any) => {
                // // console.log(item);
                switch (item) {
                  case 'teacher':
                    // console.log('Getting courses');
                    selectQuery = `* `; // Default select query
                    const selectQuery2 = `*, teachers_classes(*, Classes(*, Students(*) )), lessons(*, courses(*, Matiere(*) ), Quiz(*))`; // Default select query

                    // Additional query or processing for teacher
                    try {
                      const { data: teachersData, error: teachersError } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'teacher');
                      
                      if (!teachersError && teachersData) {
                        this.appGlobal.usersByRoles.teachers = teachersData;
                      }

                      try {
                        const { data: teacherDetailData, error: teacherDetailError } = await this.supabase
                          .from(this.USERS_DB)
                          .select(selectQuery2)
                          .eq('id', this.appGlobal.user.id);
                        
                        if (!teacherDetailError && teacherDetailData) {
                          this.appGlobal.user = teacherDetailData[0];
                        }
                      } catch (error) {
                        console.error('Error fetching teacher details:', error);
                      }
                    } catch (error) {
                      console.error('Error fetching teachers:', error);
                    }

                    break;

                  case 'student':
                    selectQuery = `*, Classes(*)`; // Default select query

                    // Additional query or processing for student
                    try {
                      const { data, error } = await this.supabase
                        .from(this.STUDENTS_DB)
                        .select(selectQuery);
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.students = data;
                      }
                    } catch (error) {
                      console.error('Error fetching students:', error);
                    }
                    break;
                }
              });
            }
            break;

          case 'parents':
            // Similar filtering and querying logic for admin
            const parentRoles = ['student'];

            if (parentRoles) {
              parentRoles.forEach(async (item: any) => {
                // console.log(item);
                switch (item) {
                  case 'student':
                    selectQuery = `*`; // Default select query

                    // Additional query or processing for student
                    try {
                      const { data, error } = await this.supabase
                        .from(this.USERS_DB)
                        .select(selectQuery)
                        .eq('role', 'student');
                      
                      if (!error && data) {
                        this.appGlobal.usersByRoles.students = data;
                      }
                    } catch (error) {
                      console.error('Error fetching students:', error);
                    }
                    break;
                }
              });
            }
            break;

          default:
            console.log('Unknown role:', this.currentRole);
            break;
        }

        return this.appGlobal;
      } catch (error) {
        console.error('Error processing roles:', error);
        return this.appGlobal;
      }
    } catch (error) {
      console.error('Network error in getRoles:', error);
      return this.appGlobal;
    }
  }

  async getSubjects() {
    return (
      this.supabase
        .from(this.MATIERE_DB)
        .select(`*, courses(*)`)
        // .eq('user_id', user.id)
        // .single()
        .then((result) => {
          // console.log(result.data);
          this.appGlobal.matiere = result.data;
          return this.appGlobal.matiere;
        })
        .then(() => {
          return this.supabase
            .from('levels')
            .select(`*, Classes(*), Matiere(*)`)
            .then((result2) => {
              // console.log('Getting Levels', result2);
              if (result2.data) {
                // console.log(result.data);
                this.appGlobal.niveaux = result2.data;
                return this.appGlobal;
              } else {
                return console.warn('getLevels -> ', result2);
              }
            });
        })
        .then(() => {
          // Load sections and options
          return Promise.all([
            this.supabase.from('Filieres').select('*'),
            this.supabase.from('Options_filieres').select('*')
          ]).then(([sectionsResult, optionsResult]) => {
            if (sectionsResult.data && !sectionsResult.error) {
              this.appGlobal.sections = sectionsResult.data;
            } else if (sectionsResult.error && sectionsResult.error.code === '42P01') {
              console.warn('Filieres table does not exist');
              this.appGlobal.sections = [];
            }
            
            if (optionsResult.data && !optionsResult.error) {
              this.appGlobal.sectionsOptions = optionsResult.data;
            } else if (optionsResult.error && optionsResult.error.code === '42P01') {
              console.warn('Options_filieres table does not exist');
              this.appGlobal.sectionsOptions = [];
            }
            return this.appGlobal;
          }).catch(error => {
            console.warn('Error loading sections/options, setting empty arrays:', error);
            this.appGlobal.sections = [];
            this.appGlobal.sectionsOptions = [];
            return this.appGlobal;
          });
        })
    );
  }

  async getClasses() {
    try {
      const { data, error } = await this.supabase
        .from(this.CLASSES_DB)
        .select(`*, Matiere (*, courses(*, lessons(*, Quiz(*))))`);
      
      if (error) {
        console.error('Error fetching classes:', error);
      } else if (data) {
        this.appGlobal.classes = data;
      }
    } catch (error) {
      console.error('Network error loading classes:', error);
    }
  }

  async getChat() {
    return (
      this.supabase
        .from('chatlog')
        .select(`*, chatMessages(*)`)
        // .eq('user_id', this.appGlobal.user.id)
        .match({ teacher: this.appGlobal.user.id })

        // .single()
        .then((result) => {
          // console.log('chatlog', result);
          this.appGlobal.chatlog = result.data;
          this.checkMessages(result.data);
          // this.appGlobal.chatlog.forEach((chatlog: any) => {
          //   const unreadCount = chatlog.chatMessages.filter(
          //     (msg: any) => msg.read_status === 1
          //   ).length;
          //   chatlog.unread = unreadCount;
          //   console.log(unreadCount); // Affichera 2
          // });
          console.log(this.appGlobal);
          localStorage.setItem(
            'messages',
            JSON.stringify(this.appGlobal.chatlog)
          );
          // this.appGlobal.user.pop(matieres) = result.data;
          return this.appGlobal;
        })
    );
  }

  async insertNewQuiz(quiz: any) {
    // console.log(quiz);
    // return;
    const { data, error } = await this.supabase
      .from(this.QUIZ_DB)
      .insert([
        {
          title: quiz.title,
          lesson: quiz.lesson,
          questions: quiz.quiz,
          teacher: quiz.teacher,
          code: quiz.code,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting quiz:', error);
      return error;
    }

    console.log('Inserted quiz:', data);
    return { data, error };
  }

  getMessages() {}

  async checkMessages(data: any): Promise<void> {
    let localMessages;
    // setInterval(() => {
    if (data) {
      const localMessagesStr = localStorage.getItem('messages');
      if (localMessagesStr) {
        localMessages = JSON.parse(localMessagesStr);
        if (data.length > 0) {
          let messageStats = {
            unread: 0,
            read: 0,
          };
          // console.log('Messages', this.appGlobal?.chatlog);
          data.forEach((chatlog: any) => {
            const unreadCount = chatlog.chatMessages?.filter(
              (msg: any) => msg.read_status === 1
            )?.length || 0;
            // const readCount = chatlog.chatMessages.filter(
            //   (msg: any) => msg.read_status === 0
            // ).length;
            const readCount = chatlog.chatMessages?.length || 0;

            messageStats.unread += unreadCount;
            messageStats.read += readCount;

            // console.log(unreadCount); // Affichera 2
          });
          if (this.appGlobal.chatlog) {
            this.appGlobal.chatlog.read = messageStats.read;
            this.appGlobal.chatlog.unread = messageStats.unread;
          }
          console.log(this.appGlobal.chatlog);

          /*
            if (this.appGlobal.chatlog?.chatMessages) {
              console.log('chatMessages!');
              if (
                messages[0].chatMessages.length !=
                this.appGlobal.chatlog?.chatMessages.length
              ) {
                console.log('Nouveaux Messages !');
                // localStorage.setItem(
                //   'messages',
                //   JSON.stringify(this.appGlobal.chatlog)
                // );
                return this.appGlobal.chatlog;
              }
            }*/
          return;
        }
        return;
      }
    }
    return;
    // }, 2500);
  }

  // async insertNewQuiz__(quiz: any) {
  //   // return console.log(quiz);
  //   const { data, error } = await this.supabase
  //     .from(this.QUIZ_DB)
  //     .insert([
  //       { title: quiz.title },
  //       { questions: quiz.quiz },
  //       { teacher: quiz.teacher },
  //       { code: quiz.code },
  //       { lesson: quiz.lesson },
  //     ])
  //     .select();
  // }

  async insertNewLesson(lesson: any) {
    const { data, error } = await this.supabase
      // .from('lessons')
      .from(this.LESSONS_DB)
      .insert([
        {
          titre: lesson.title,
          course: lesson.cours,
          teacher: this.appGlobal.user.id,
          titre_slug: lesson.slug,
          content: lesson.content,
        },
      ])
      .select();

    if (data) {
      console.log('Result inserting new Lesson ', data);
      const channels = this.supabase
        .channel('custom-insert-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'lessons' },
          (payload) => {
            console.log('Change received!', payload);
            this.initQueries().then((res) => {
              console.log(res);
            });
            // setTimeout(() => {
            //   return this.router.navigateByUrl('/app/all-cours');
            // }, 2000);
          }
        )
        .subscribe();
    }
    if (error) console.log('Error insert New Lesson ', error);
    return { data, error };
  }

  async insertNewCourse(course: any) {
    const { data, error } = await this.supabase
      .from('courses')
      .insert([
        {
          name: course.name,
          matiere: course.matiere,
          slug: course.slug,
        },
      ])
      .select();

    if (data) {
      // console.log('Result inserting new Lesson ', data);
      this.presentToast(course.name + ' inséré avec succès !', 'teal');
      /*const channels = this.supabase
        .channel('custom-insert-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'courses' },
          (payload) => {
            console.log('Change received!', payload);
            this.initQueries().then((res) => {
              console.log(res);
            });
            // setTimeout(() => {
            //   return this.router.navigateByUrl('/app/all-cours');
            // }, 2000);
          }
        )
        .subscribe();
      return data;*/
    }
    if (error) {
      console.log('Error insert New Course ', error);
      this.presentToast('Erreur insertion Cours', 'warning');
      // return error;
    }
    return { data, error };
  }

  async insertNewSubject(matiere: any) {
    const { data, error } = await this.supabase
      .from(this.MATIERE_DB)
      .insert([
        {
          name: matiere.name,
          niveau: matiere.niveau,
          classe: matiere.classe,
          section: matiere.section,
          option: matiere.option,
          slug: matiere.slug,
        },
      ])
      .select();

    if (data) {
      // console.log('Result inserting new Lesson ', data);
      this.presentToast(matiere.name + ' inséré avec succès !', 'teal');
      const channels = this.supabase
        .channel('custom-insert-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: this.MATIERE_DB },
          (payload) => {
            console.log('Change received !', payload);
            this.initQueries().then((res) => {
              console.log(res);
            });
            // setTimeout(() => {
            //   return this.router.navigateByUrl('/app/all-cours');
            // }, 2000);
          }
        )
        .subscribe();
    }
    if (error) {
      console.log('Error insert New Subject ', error);
      this.presentToast('Erreur insertion Matière', 'warning');
    }
    return { data, error };
  }

  // QUERIES

  // CHANGES
  _listenChanges() {
    console.log('Channels are open !');
    // Subscribe to users table changes
    const usersChannel = this.supabase
      .channel('custom-users-channel') // unique channel for users
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.USERS_DB },
        (payload) => {
          console.log('Change received on users!', payload);
          this.initQueries();
        }
      )
      .subscribe();

    // Subscribe to lessons table changes
    const quizChannel = this.supabase
      .channel('custom-lessons-channel') // unique channel for lessons
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.QUIZ_DB },
        (payload) => {
          console.log('Change received on quiz!', payload);
          this.initQueries();
        }
      )
      .subscribe();

    // Subscribe to lessons table changes
    const lessonsChannel = this.supabase
      .channel('custom-lessons-channel') // unique channel for lessons
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        (payload) => {
          console.log('Change received on lessons!', payload);
          this.initQueries();
        }
      )
      .subscribe();

    // Subscribe to courses table changes
    const coursesChannel = this.supabase
      .channel('custom-courses-channel') // unique channel for courses
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        (payload) => {
          console.log('Change received on courses!', payload);
          this.initQueries();
        }
      )
      .subscribe();

    // Subscribe to matieres table changes
    const matieresChannel = this.supabase
      .channel('custom-matieres-channel') // unique channel for matieres
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: this.MATIERE_DB },
        (payload) => {
          console.log('Change received on matieres!', payload);
          this.initQueries();
        }
      )
      .subscribe();

    // Subscribe to matieres table changes
    const messageChannel = this.supabase
      .channel('custom-matieres-channel') // unique channel for matieres
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chatlog' },
        (payload) => {
          console.log('Change received on matieres!', payload);
          this.initQueries();
        }
      )
      .subscribe();
  }
  listenChanges() {
    console.log('Channels are open!');

    // Configuration des abonnements
    const tablesToMonitor = [
      { table: this.USERS_DB, message: 'custom-users-channel' },
      { table: this.QUIZ_DB, message: 'custom-quiz-channel' },
      { table: 'lessons', message: 'custom-lessons-channel' },
      { table: 'courses', message: 'custom-courses-channel' },
      { table: this.MATIERE_DB, message: 'custom-matieres-channel' },
      { table: 'chatlog', message: 'custom-chatlog-channel' },
      { table: 'chatMessages', message: 'custom-chatmessages-channel' },
    ];

    // Crée des abonnements dynamiquement
    this.subscriptions = tablesToMonitor.map(({ table, message }) =>
      this.supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            console.log(`Change received on table ${table}!`, payload);
            // this.initQueries(); // Méthode d'actualisation globale
            const newMessage: any = payload.new;
            if (newMessage?.reciever) {
              console.log('Channel is messages');
              console.log('Nouveau message reçu:', newMessage);
              this.appGlobal.newMessage = 1;
              if (newMessage?.reciever == this.appGlobal.user.id) {
                const msgs = this.appGlobal.chatlog.filter((msg: any) => {
                  return (
                    msg.reciever == this.appGlobal.user.id &&
                    msg.id == newMessage.id
                  );
                });
                console.log('Filter msg : ' + msgs);
                if (!msgs) {
                  console.log('Nouveau message reçu:', newMessage);
                  this.presentToast(
                    `Nouveau message du Prof: " ${newMessage.message}"`,
                    'teal'
                  );
                }
                // else {
                //   this.alertToast(`Update Message !`);
                // }
                /*return*/
                this.initQueries(); // Actualise les données si nécessaire
              }
            }
          }
        )
        .subscribe()
    );

    console.log('All subscriptions are set.');
  }

  ngOnDestroy() {
    // Désabonnement propre lors de la destruction du composant
    if (this.subscriptions) {
      this.subscriptions.forEach((subscription: any) =>
        subscription.unsubscribe()
      );
      console.log('All subscriptions have been unsubscribed.');
    }
  }
  // CHANGES

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: 2000,
    });
    toast.present();
  }

  async addMatiere() {
    const operationInsertion: number = 2; //0: Matiere | 1: Cours
    const classes = [
      {
        id: '0-1-primaire',
        level: 1,
      },
      {
        id: '0-2-primaire',
        level: 1,
      },
      {
        id: '0-3-primaire',
        level: 1,
      },
      {
        id: '0-4-primaire',
        level: 1,
      },
      {
        id: '0-5-primaire',
        level: 1,
      },
    ];

    const matPerClasses = [
      {
        level: 1,
        matieres: [
          {
            name: 'Mathématiques',
            slug: 'mathematique',
          },
          {
            name: 'Français',
            slug: 'francais',
          },
          {
            name: 'Éveils Scientifiques',
            slug: 'eveilscientifiques',
          },
        ],
      },
    ];

    const courses = [
      {
        name: 'Calculs',
        slug: 'calculs',
        level: 1,
        matiereSlug: 'mathematique',
      },
      {
        name: 'Numération',
        slug: 'numeration',
        level: 1,
        matiereSlug: 'mathematique',
      },
      {
        name: 'Opérations',
        slug: 'operation',
        level: 1,
        matiereSlug: 'mathematique',
      },
      {
        name: 'Élocution',
        slug: 'elocution',
        level: 1,
        matiereSlug: 'francais',
      },
      {
        name: 'Grammaire',
        slug: 'grammaire',
        level: 1,
        matiereSlug: 'francais',
      },
      {
        name: 'Vocabulaire',
        slug: 'vocabulaire',
        level: 1,
        matiereSlug: 'francais',
      },
      {
        name: 'Conjugaison',
        slug: 'conjugaison',
        level: 1,
        matiereSlug: 'francais',
      },
      {
        name: 'Orthographe',
        slug: 'orthographe',
        level: 1,
        matiereSlug: 'francais',
      },
      {
        name: 'Grandeurs',
        slug: 'grandeurs',
        level: 1,
        matiereSlug: 'mathematique',
      },
      {
        name: 'Education civique et morale',
        slug: 'ecm',
        level: 1,
        matiereSlug: 'eveilscientifiques',
      },
      {
        name: 'Education pour la santé et environnement',
        slug: 'ese',
        level: 1,
        matiereSlug: 'eveilscientifiques',
      },
      {
        name: 'Etude du milieu',
        slug: 'em',
        level: 1,
        matiereSlug: 'eveilscientifiques',
      },
    ];

    // METHOD MATIERE
    if (operationInsertion === 0) {
      classes.forEach((classe) => {
        matPerClasses.forEach((matierePL) => {
          if (classe.level == matierePL.level) {
            matierePL.matieres.forEach(async (matiere) => {
              const parts = classe.id.split('-');
              const result = `${parts[0]}-${parts[1]}-${matiere.slug}`;
              const out = {
                name: matiere.name,
                slug: result,
                niveau: classe.level,
                classe: classe.id,
              };
              // console.log(
              //   'Classe Level: ',
              //   classe.id,
              //   ' -> ',
              //   matiere.name,
              //   ' -> ',
              //   result
              // );
              console.log('Insertion result is : ', out);
              return;
              const { data, error } = await this.supabase
                .from(this.MATIERE_DB)
                .insert([out])
                .select();
            });
          }
        });
      });
    }

    // METHOD COURSE INSERTION
    if (operationInsertion === 1) {
      classes.forEach((classe) => {
        matPerClasses.forEach((matierePL) => {
          if (classe.level == matierePL.level) {
            matierePL.matieres.forEach(async (matiere) => {
              courses.forEach(async (cours) => {
                if (cours.matiereSlug == matiere.slug) {
                  const parts = classe.id.split('-');
                  const result = `${parts[0]}-${parts[1]}-${matiere.slug}`;
                  const result2 = `${parts[0]}-${parts[1]}-${matiere.slug}_${cours.slug}`;
                  const out = {
                    name: cours.name,
                    slug: result2,
                    matiere: result,
                    // classe: classe.id,
                  };
                  // console.log(
                  //   'Classe Level: ',
                  //   classe.id,
                  //   ' -> ',
                  //   matiere.name,
                  //   ' -> ',
                  //   result
                  // );
                  // console.log('Insertion result is : ', out);
                  // return;
                  const { data, error } = await this.supabase
                    .from(this.COURSES_DB)
                    .insert([out]);
                  // .select();
                  if (error) {
                    throw error;
                  }
                }
              });
            });
          }
        });
      });
    }
  }

  // Payment-related methods
  async getStudentsByParentId(parentId: string) {
    return await this.supabase
      .from('Students')
      .select(`
        id,
        nom,
        post_nom,
        pseudo,
        classe,
        niveau,
        user_id,
        Classes(name)
      `)
      .eq('parental', parentId);
  }

  async getPaymentHistoryByParentId(parentId: string) {
    return await this.supabase
      .from('payment_history')
      .select('*')
      .eq('parent_id', parentId)
      .order('payment_date', { ascending: false });
  }

  async insertPaymentRecord(paymentRecord: any) {
    return await this.supabase
      .from('payment_history')
      .insert([paymentRecord]);
  }

  async updatePaymentStatus(orderId: string, status: string) {
    return await this.supabase
      .from('payment_history')
      .update({ status: status })
      .eq('order_id', orderId);
  }

  /**
   * Create a realtime channel
   */
  channel(channelName: string): RealtimeChannel {
    return this.supabase.channel(channelName);
  }

  /**
   * Access to from method for direct queries
   */
  from(table: string) {
    return this.supabase.from(table);
  }
}
