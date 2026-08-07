import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'admin' | 'teacher' | 'student';
  content: string;
  created_at: string;
}

export interface ChatThread {
  id: string;
  title: string;
  category: 'Classe' | 'Matière' | 'Support_Ecole';
  participant_count: number;
  last_message?: string;
  last_activity: string;
}

export function useChatThreads() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ['chat-threads'],
    queryFn: async (): Promise<ChatThread[]> => {
      const { data, error } = await supabase
        .from('chatlog')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat threads from Supabase:', error.message);
        return [];
      }

      return (data || []).map((t: any) => ({
        id: t.id,
        title: t.titre || 'Canal de discussion',
        category: t.categorie || 'Classe',
        participant_count: t.participants_count || 0,
        last_message: t.dernier_message || '',
        last_activity: t.updated_at || t.created_at,
      }));
    },
  });
}

export function useChatMessages(threadId: string) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`chat_messages:${threadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${threadId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', threadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, supabase, queryClient]);

  const query = useQuery({
    queryKey: ['chat-messages', threadId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!threadId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages from Supabase:', error.message);
        return [];
      }

      return data || [];
    },
    enabled: !!threadId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const newMessage = {
        chat_id: threadId,
        sender_id: 'curr-user-id',
        sender_name: 'Admin E-RDC',
        sender_role: 'admin' as const,
        content: messageText,
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([newMessage])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['chat-messages', threadId], (old: ChatMessage[] = []) => [...old, data]);
    },
  });

  return {
    ...query,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
}
