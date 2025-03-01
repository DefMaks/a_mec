/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { id } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { AppGlobalService } from 'src/app/services/app-global.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-chat-log',
  templateUrl: './chat-log.component.html',
  styleUrls: ['./chat-log.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ChatLogComponent implements OnInit {
  @ViewChild('chatBottom', { static: false }) chatBottom!: ElementRef;

  @Input() item: any;

  chatlogs: any = this.appGlobal.chatlog;
  selectedChat: string = '';
  selectedChatData!: any;
  chatlogSub!: Subscription;

  chatHolder = {
    message: '',
  };

  chatlog: any[] = [];
  private chatlogSubscription: Subscription | null = null;

  constructor(
    public appGlobal: AppGlobalService,
    private supabase: SupabaseService,
    private messaging: MessagingService
  ) {}

  /*
  ngOnInit() {
    // 🔥 Abonnement à `chatlog$` pour recevoir les mises à jour en direct
    this.chatlogSub = this.appGlobal.chatlog$.subscribe((chatlogs) => {
      this.chatlogs = chatlogs.map((chatlog) => ({
        ...chatlog,
        studentData: null,
      }));
      console.log(chatlogs);
    });

    setInterval(() => {
      if (this.appGlobal.newMessage === 1) {
        console.log('Got new Message');
        this.setMessages();
        this.appGlobal.newMessage = 0;
      }
    }, 2600);
  }

  ngOnDestroy() {
    if (this.chatlogSub) {
      this.chatlogSub.unsubscribe();
    }
  }
  */
  ngOnInit() {
    // S'abonner aux changements de chatlog
    this.chatlogSubscription = this.appGlobal.chatlog$.subscribe((data) => {
      this.chatlog = data;
      console.log('Chatlog mis à jour:', this.chatlog);
      // console.log(this.appGlobal?.chatlog);
      const { unread, read, ...updatedChatlog } = this.appGlobal?.chatlog;
      console.log(updatedChatlog);
    });

    // Initialiser les données
    this.chatlog = this.appGlobal.getChatlog();
  }

  ngOnDestroy() {
    // Désabonner pour éviter les fuites mémoire
    if (this.chatlogSubscription) {
      this.chatlogSubscription.unsubscribe();
    }
  }

  async setMessages() {
    console.log(this.appGlobal.chatlog$);
    const updatedChatlogs = this.chatlogs.map((chatlog: any) => ({
      ...chatlog,
      studentData: null,
    }));

    for (const chatlog of updatedChatlogs) {
      chatlog.lessonData = await this.getTheLesson(chatlog.lesson);
      chatlog.studentData = await this.getTheStudent(chatlog.student);
    }

    this.appGlobal.updateChatlog(updatedChatlogs);
  }

  /*
  async ngOnInit() {
    this.setMessages();
    setInterval(() => {
      if ((this.appGlobal.newMessage = 1)) {
        console.log('Got new Message');
        this.setMessages();
        this.appGlobal.newMessage = 0;
      }
    }, 2600);
  }

  async setMessages() {
    await console.log(this.appGlobal.chatlog);
    if (this.appGlobal.chatlog) {
      this.chatlogs = this.appGlobal.chatlog;
      delete this.chatlogs.unread;
      delete this.chatlogs.read;
      console.log(this.chatlogs);
      this.chatlogs.forEach((chatlog: any) => {
        chatlog.studentData = null;
        if (chatlog) {
          this.getTheLesson(chatlog.lesson).then((res: any) => {
            chatlog.lessonData = res;
          });
          // console.log(chatlog);
          // this.getTheStudent(chatlog.student);
          this.getTheStudent(chatlog.student).then((res: any) => {
            chatlog.studentData = res;
          });
        }
      });
    }
    return this.chatlogs;
    
  }
  */

  openChat(chatlog: any, ev: any) {
    this.selectedChat = chatlog.id;
    console.log(ev);
    // console.log(chatlog);
    this.selectedChatData = chatlog;
    console.log(this.selectedChatData);

    // alert(chatlog.id);
    this.scrollToBottom();
  }

  async getTheStudent(id: any) {
    // console.log(this.appGlobal.usersByRoles);
    let studentData!: any;
    this.appGlobal.usersByRoles.teachers.find((teacherId: any) => {
      if (teacherId.id == this.appGlobal.user.id) {
        // console.log(teacherId);
        const student = this.appGlobal.usersByRoles?.students.find(
          (studentId: any) => {
            return studentId.id == id;
          }
        );
        studentData = student;
        // console.log('getTheStudent: ', student);
      }
    });

    return studentData;
  }

  async getTheLesson(id: any) {
    console.log(this.appGlobal.lessons);
    const lesson = this.appGlobal.lessons.find((item: any) => {
      return item.lesson_id == id;
    });
    console.log(lesson);
    return lesson;
  }

  scrollToBottom() {
    // Use setTimeout to ensure the element is available
    setTimeout(() => {
      try {
        this.chatBottom.nativeElement.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error('Scroll error:', err);
      }
    }, 0);
  }

  sendMessage(ev: any) {
    // console.log(this.chatHistory);
    // this.supabase.sendMessage(this.chatHolder).then((res: any) => {
    //   this.message = '';
    //   console.log(res);
    //   this.chatHistory.chatMessages.push(res.chatData);
    // });
  }
}
