import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AppGlobalService } from './app-global.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  sent_at: string;
  chatlog: string;
  sender: string;
  reciever: string;
  message: string;
  read_status: number; // 0 = read, 1 = unread
}

export interface ChatLog {
  id: string;
  start_at: string;
  student: number;
  teacher: string;
  open_status: number;
  lesson: string;
  chatMessages?: ChatMessage[];
  studentData?: any;
  lessonData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private chatlogsSubject = new BehaviorSubject<ChatLog[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public messages$ = this.messagesSubject.asObservable();
  public chatlogs$ = this.chatlogsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private subscription: any;
  private messageSubscription: any;

  constructor(
    private supabase: SupabaseService,
    private appGlobal: AppGlobalService
  ) {
    this.initializeRealtimeSubscriptions();
  }

  /**
   * Initialize real-time subscriptions for chat
   */
  private initializeRealtimeSubscriptions() {
    // Subscribe to chatlog changes
    this.subscription = this.supabase
      .channel('chatlog-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatlog',
          filter: `teacher=eq.${this.appGlobal.user?.id}`
        },
        (payload) => {
          console.log('Chatlog change received:', payload);
          this.handleChatlogChange(payload);
        }
      )
      .subscribe();

    // Subscribe to chatMessages changes
    this.messageSubscription = this.supabase
      .channel('chatmessages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatMessages'
        },
        (payload) => {
          console.log('Message change received:', payload);
          this.handleMessageChange(payload);
        }
      )
      .subscribe();
  }

  /**
   * Handle chatlog changes from real-time subscription
   */
  private handleChatlogChange(payload: RealtimePostgresChangesPayload<any>) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.addNewChatlog(newRecord);
        break;
      case 'UPDATE':
        this.updateChatlog(newRecord);
        break;
      case 'DELETE':
        this.removeChatlog(oldRecord);
        break;
    }
  }

  /**
   * Handle message changes from real-time subscription
   */
  private handleMessageChange(payload: RealtimePostgresChangesPayload<any>) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.addNewMessage(newRecord);
        this.updateUnreadCount();
        break;
      case 'UPDATE':
        this.updateMessage(newRecord);
        this.updateUnreadCount();
        break;
      case 'DELETE':
        this.removeMessage(oldRecord);
        break;
    }
  }

  /**
   * Load initial chat data
   */
  async loadInitialChatData() {
    try {
      const { data: chatlogs, error } = await this.supabase
        .from('chatlog')
        .select(`
          *,
          chatMessages(*),
          Students(id, nom, post_nom, pseudo, classe),
          lessons(titre, lesson_id)
        `)
        .eq('teacher', this.appGlobal.user.id)
        .order('start_at', { ascending: false });

      if (error) {
        console.error('Error loading chatlogs:', error);
        return;
      }

      // Process and enrich the data
      const enrichedChatlogs = await Promise.all(
        chatlogs.map(async (chatlog: any) => {
          return {
            ...chatlog,
            studentData: chatlog.Students,
            lessonData: chatlog.lessons
          };
        })
      );

      this.chatlogsSubject.next(enrichedChatlogs);
      this.updateUnreadCount();
      
    } catch (error) {
      console.error('Error in loadInitialChatData:', error);
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(chatlogId: string, message: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('chatMessages')
        .insert([
          {
            chatlog: chatlogId,
            sender: this.appGlobal.user.id,
            reciever: this.getChatlogRecipient(chatlogId),
            message: message,
            read_status: 1 // Unread by default
          }
        ])
        .select();

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return false;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatlogId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('chatMessages')
        .update({ read_status: 0 })
        .eq('chatlog', chatlogId)
        .eq('reciever', this.appGlobal.user.id);

      if (error) {
        console.error('Error marking messages as read:', error);
        return false;
      }

      this.updateUnreadCount();
      return true;
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
      return false;
    }
  }

  /**
   * Get messages for a specific chatlog
   */
  async getMessagesForChatlog(chatlogId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from('chatMessages')
        .select('*')
        .eq('chatlog', chatlogId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('Error getting messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMessagesForChatlog:', error);
      return [];
    }
  }

  /**
   * Add new chatlog to the list
   */
  private addNewChatlog(chatlog: any) {
    const currentChatlogs = this.chatlogsSubject.value;
    this.chatlogsSubject.next([chatlog, ...currentChatlogs]);
  }

  /**
   * Update existing chatlog
   */
  private updateChatlog(updatedChatlog: any) {
    const currentChatlogs = this.chatlogsSubject.value;
    const index = currentChatlogs.findIndex(c => c.id === updatedChatlog.id);
    
    if (index !== -1) {
      currentChatlogs[index] = { ...currentChatlogs[index], ...updatedChatlog };
      this.chatlogsSubject.next([...currentChatlogs]);
    }
  }

  /**
   * Remove chatlog from the list
   */
  private removeChatlog(chatlog: any) {
    const currentChatlogs = this.chatlogsSubject.value;
    const filteredChatlogs = currentChatlogs.filter(c => c.id !== chatlog.id);
    this.chatlogsSubject.next(filteredChatlogs);
  }

  /**
   * Add new message to the appropriate chatlog
   */
  private addNewMessage(message: ChatMessage) {
    const currentChatlogs = this.chatlogsSubject.value;
    const chatlogIndex = currentChatlogs.findIndex(c => c.id === message.chatlog);
    
    if (chatlogIndex !== -1) {
      if (!currentChatlogs[chatlogIndex].chatMessages) {
        currentChatlogs[chatlogIndex].chatMessages = [];
      }
      currentChatlogs[chatlogIndex].chatMessages!.push(message);
      this.chatlogsSubject.next([...currentChatlogs]);
    }
  }

  /**
   * Update existing message
   */
  private updateMessage(updatedMessage: ChatMessage) {
    const currentChatlogs = this.chatlogsSubject.value;
    const chatlogIndex = currentChatlogs.findIndex(c => c.id === updatedMessage.chatlog);
    
    if (chatlogIndex !== -1 && currentChatlogs[chatlogIndex].chatMessages) {
      const messageIndex = currentChatlogs[chatlogIndex].chatMessages!
        .findIndex(m => m.id === updatedMessage.id);
      
      if (messageIndex !== -1) {
        currentChatlogs[chatlogIndex].chatMessages![messageIndex] = updatedMessage;
        this.chatlogsSubject.next([...currentChatlogs]);
      }
    }
  }

  /**
   * Remove message from chatlog
   */
  private removeMessage(message: ChatMessage) {
    const currentChatlogs = this.chatlogsSubject.value;
    const chatlogIndex = currentChatlogs.findIndex(c => c.id === message.chatlog);
    
    if (chatlogIndex !== -1 && currentChatlogs[chatlogIndex].chatMessages) {
      currentChatlogs[chatlogIndex].chatMessages = 
        currentChatlogs[chatlogIndex].chatMessages!.filter(m => m.id !== message.id);
      this.chatlogsSubject.next([...currentChatlogs]);
    }
  }

  /**
   * Update unread message count
   */
  private updateUnreadCount() {
    const currentChatlogs = this.chatlogsSubject.value;
    let unreadCount = 0;
    
    currentChatlogs.forEach(chatlog => {
      if (chatlog.chatMessages) {
        unreadCount += chatlog.chatMessages.filter(
          msg => msg.read_status === 1 && msg.reciever === this.appGlobal.user.id
        ).length;
      }
    });
    
    this.unreadCountSubject.next(unreadCount);
    this.appGlobal.chatlog = { ...this.appGlobal.chatlog, unread: unreadCount };
  }

  /**
   * Get recipient for a chatlog
   */
  private getChatlogRecipient(chatlogId: string): string {
    const chatlog = this.chatlogsSubject.value.find(c => c.id === chatlogId);
    return chatlog ? chatlog.student.toString() : '';
  }

  /**
   * Cleanup subscriptions
   */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}