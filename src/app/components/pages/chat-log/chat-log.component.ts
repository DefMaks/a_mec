/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AppGlobalService } from 'src/app/services/app-global.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { RealtimeChatService, ChatLog, ChatMessage } from 'src/app/services/realtime-chat.service';

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

  chatlogs: ChatLog[] = [];
  selectedChat: string = '';
  selectedChatData!: ChatLog;
  messages: ChatMessage[] = [];
  
  // Subscriptions
  private chatlogSubscription!: Subscription;
  private messagesSubscription!: Subscription;
  private unreadCountSubscription!: Subscription;

  chatHolder = {
    message: '',
  };

  // UI states
  isLoading = false;
  isSending = false;

  constructor(
    public appGlobal: AppGlobalService,
    private supabase: SupabaseService,
    private realtimeChat: RealtimeChatService
  ) {}

  ngOnInit() {
    this.initializeRealtimeChat();
  }

  ngOnDestroy() {
    if (this.chatlogSubscription) {
      this.chatlogSubscription.unsubscribe();
    }
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }

  /**
   * Initialize real-time chat functionality
   */
  private initializeRealtimeChat() {
    // Subscribe to chatlogs
    this.chatlogSubscription = this.realtimeChat.chatlogs$.subscribe((chatlogs) => {
      this.chatlogs = chatlogs;
      console.log('Chatlogs updated:', chatlogs);
    });

    // Subscribe to unread count
    this.unreadCountSubscription = this.realtimeChat.unreadCount$.subscribe((count) => {
      console.log('Unread messages count:', count);
      // Update global state if needed
      if (this.appGlobal.chatlog) {
        this.appGlobal.chatlog.unread = count;
      }
    });

    // Load initial data
    this.realtimeChat.loadInitialChatData();
  }

  /**
   * Open a specific chat
   */
  async openChat(chatlog: ChatLog, ev: any) {
    this.selectedChat = chatlog.id;
    this.selectedChatData = chatlog;
    
    // Load messages for this chatlog
    this.messages = await this.realtimeChat.getMessagesForChatlog(chatlog.id);
    
    // Mark messages as read
    await this.realtimeChat.markMessagesAsRead(chatlog.id);

    this.scrollToBottom();
  }

  /**
   * Scroll to bottom of chat
   */
  scrollToBottom() {
    setTimeout(() => {
      try {
        this.chatBottom.nativeElement.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error('Scroll error:', err);
      }
    }, 0);
  }

  /**
   * Send a new message
   */
  async sendMessage(ev: any) {
    if (!this.chatHolder.message.trim() || !this.selectedChat) {
      return;
    }

    this.isSending = true;
    
    try {
      const success = await this.realtimeChat.sendMessage(
        this.selectedChat,
        this.chatHolder.message.trim()
      );

      if (success) {
        this.chatHolder.message = '';
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Get student display name
   */
  getStudentDisplayName(chatlog: ChatLog): string {
    if (chatlog.studentData) {
      return chatlog.studentData.pseudo || 
             `${chatlog.studentData.nom} ${chatlog.studentData.post_nom}`;
    }
    return 'Étudiant';
  }

  /**
   * Get lesson title
   */
  getLessonTitle(chatlog: ChatLog): string {
    return chatlog.lessonData?.titre || 'Leçon';
  }

  /**
   * Check if message is from current user
   */
  isMyMessage(message: ChatMessage): boolean {
    return message.sender === this.appGlobal.user.id;
  }

  /**
   * Format message timestamp
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
