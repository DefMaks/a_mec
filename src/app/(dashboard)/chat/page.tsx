'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatThreads, useChatMessages } from '@/hooks/use-chat';
import { useRole } from '@/context/role-context';
import {
  MessageSquare,
  Sparkles,
  Send,
  User,
  Users,
  Search,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';

export default function ChatPage() {
  const { roleInfo } = useRole();
  const { data: threads, isLoading: isLoadingThreads } = useChatThreads();
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const { data: messages, sendMessage, isSending } = useChatMessages(selectedThreadId);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threads && threads.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeThread = (threads || []).find((t) => t.id === selectedThreadId) || threads?.[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedThreadId) return;
    await sendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête Messagerie */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#D4AF37]" />
              Communication Directe
            </span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              Temps Réel
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Messagerie & Échanges Pédagogiques
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Canal sécurisé entre l'administration, les enseignants, les élèves et les tuteurs.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0F2C59] flex items-center gap-2 self-start md:self-center">
          <span>{roleInfo.icon}</span>
          <span>{roleInfo.label}</span>
        </div>
      </div>

      {/* Interface de Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[620px]">
        {/* Liste des canaux */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col h-full shadow-xs">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-2 mb-3">
            Discussions & Canaux
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {isLoadingThreads ? (
              <div className="text-xs text-[#64748B] p-4 text-center">
                Chargement des discussions...
              </div>
            ) : threads && threads.length > 0 ? (
              threads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full text-left p-3 rounded-xl transition border flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#0F2C59]/30 text-[#0F2C59] shadow-xs font-semibold'
                        : 'border-transparent hover:bg-[#F8FAFC] text-[#475569]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate text-[#0F2C59]">
                          {thread.titre}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {thread.description || 'Canal de discussion académique'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-[#64748B] p-4 text-center">
                Aucune discussion disponible.
              </div>
            )}
          </div>
        </div>

        {/* Zone de conversation active */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] flex flex-col h-full shadow-xs overflow-hidden">
          {/* Header Conversation */}
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0F2C59]">
                  {activeThread?.titre || 'Discussion'}
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  {activeThread?.description || 'Canal officiel Académie du Salut'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">
              ● En ligne
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAFA]">
            {messages && messages.length > 0 ? (
              messages.map((msg) => {
                const isMe = msg.sender_role === roleInfo.role || msg.is_me;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-[#64748B]">
                        {msg.sender_name || 'Utilisateur'}
                      </span>
                      <span className="text-[9px] text-[#94A3B8]">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-[#0F2C59] text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {msg.contenu}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
                Aucun message pour l'instant. Démarrez la discussion ci-dessous.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#E2E8F0] bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Écrivez votre message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#0F2C59] text-[#1E293B]"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-4 py-2.5 bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 disabled:opacity-50 font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs"
            >
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Envoyer</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
