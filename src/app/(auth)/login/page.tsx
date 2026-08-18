"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';
import { Sparkles, ShieldCheck, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Identifiants invalides ou problème de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-[#E2E8F0] space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-md border border-[#E2E8F0] p-2 mb-4">
            <Image
              src="/stem.avif"
              alt="Logo Académie du Salut"
              width={72}
              height={72}
              className="object-contain w-full h-full"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFFBEB] px-2.5 py-0.5 rounded uppercase tracking-wider border border-[#D4AF37]/30">
              Système Éducatif STEM - RDC
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59]">{APP_NAME}</h1>
          <p className="text-xs text-[#64748B] mt-1">Portail d'Administration & Gestion Pédagogique</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F2C59] mb-1.5">
              Adresse Email Professionnelle
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@academiedusalut.cd"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-xs text-[#1E293B] transition-all"
              />
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2C59] mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-xs text-[#1E293B] transition-all"
              />
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'Connexion en cours...' : 'Accéder au Portail Sécurisé'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-[#F1F5F9] text-center space-y-1">
          <div className="text-[11px] font-semibold text-[#0F2C59] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Académie du Salut (ADS) • Kinshasa, RDC</span>
          </div>
          <p className="text-[10px] text-[#94A3B8]">
            E-RDC Mon Espace Classe (A_MEC) &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
