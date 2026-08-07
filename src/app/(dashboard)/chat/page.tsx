'use client';

import React, { useState, useEffect } from 'react';
import { useChatThreads, useChatMessages } from '@/hooks/use-chat';

export default function ChatLogPage() {
  const { data: threads, isLoading: isLoadingThreads } = useChatThreads();
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const { data: messages, sendMessage, isSending } = useChatMessages(selectedThreadId);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (threads && threads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  const activeThread = (threads || []).find((t) => t.id === selectedThreadId) || threads?.[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedThreadId) return;
    await sendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>💬</span> Messagerie & Journal des Conversations (ChatLog)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Espace d échange pédagogique direct en temps réel entre enseignants, élèves et administrateurs d écoles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Threads Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
            Canaux Éducatifs
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoadingThreads ? (
              <div className="text-xs text-slate-500 p-4">Chargement des canaux...</div>
            ) : threads && threads.length > 0 ? (
              threads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full text-left p-3 rounded-xl transition border ${
                      isSelected
                        ? 'bg-teal-500/10 border-teal-500/40 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-teal-400">{thread.category}</span>
                      <span className="text-[10px] text-slate-400">
                        👥 {thread.participant_count}
                      </span>
                    </div>
                    <div className="font-bold text-sm truncate">{thread.title}</div>
                    <div className="text-xs text-slate-400 truncate mt-1">
                      {thread.last_message || 'Pas de message'}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-slate-500 p-4 text-center">
                Aucun canal de discussion trouvé dans la base de données.
              </div>
            )}
          </div>
        </div>

        {/* Active Chat Window */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 rounded-xl mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">{activeThread.title}</h3>
                  <p className="text-xs text-slate-400">
                    Canal : {activeThread.category} • {activeThread.participant_count} participants
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Synchronisé Supabase Realtime
                </span>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 pr-1">
                {(messages || []).map((msg) => {
                  const isAdmin = msg.sender_role === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-0.5 px-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-200">{msg.sender_name}</span>
                        <span className="capitalize text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-teal-400">
                          {msg.sender_role}
                        </span>
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          isAdmin
                            ? 'bg-teal-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                {(!messages || messages.length === 0) && (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-xs py-12">
                    Aucun message dans ce canal.
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50 text-sm"
                >
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Sélectionnez une discussion pour démarrer le chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
