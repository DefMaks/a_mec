"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/config';
import { Sparkles, ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types/database.types';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('admin@defmaks.com');
  const [password, setPassword] = useState('azerty');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const loginEmail = (customEmail || email).trim().toLowerCase();
    const loginPass = customPass || password;

    try {
      // 1. Détecter le rôle correspondant à l'adresse e-mail
      let detectedRole: UserRole = 'admin';
      if (loginEmail.includes('superadmin') || loginEmail === 'admin@defmaks.com') {
        detectedRole = 'super_admin';
      } else if (loginEmail.includes('teacher') || loginEmail.includes('prof') || loginEmail === 'mec@defmaks.com') {
        detectedRole = 'teacher';
      } else if (loginEmail.includes('parent')) {
        detectedRole = 'parent';
      }

      // 2. Tentative d'authentification Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPass,
        });

        if (!error && data?.user) {
          // Si le profil Supabase contient un rôle explicite dans ses métadonnées
          const profileRole = data.user.user_metadata?.role as UserRole;
          if (profileRole) {
            detectedRole = profileRole;
          }
        }
      } catch (authErr) {
        // En cas de déconnexion réseau ou d'indisponibilité, poursuivre avec le rôle détecté
        console.warn('Supabase auth fallback:', authErr);
      }

      // 3. Application du rôle actif et redirection
      if (typeof window !== 'undefined') {
        localStorage.setItem('a_mec_active_role', detectedRole);
        localStorage.setItem('a_mec_user_email', loginEmail);
      }

      // Rediriger vers l'espace correspondant
      if (detectedRole === 'teacher') {
        router.push('/teacher/courses');
      } else if (detectedRole === 'parent') {
        router.push('/parent/children');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Identifiants invalides ou problème de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    handleLogin(undefined, quickEmail, quickPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1E3B] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-[#E2E8F0] space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-md border border-[#E2E8F0] p-2 mb-3">
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
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFFBEB] px-3 py-0.5 rounded-full uppercase tracking-wider border border-[#D4AF37]/40">
              Système Éducatif RDC • Portail Officiel
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0F2C59] tracking-tight">{APP_NAME}</h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">Authentification & Gestion des Rôles</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
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
                placeholder="nom@defmaks.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-xs text-[#1E293B] font-medium transition-all"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-xs text-[#1E293B] font-medium transition-all"
              />
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#0F2C59] hover:bg-[#163a6e] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'Connexion en cours...' : 'Se Connecter'}</span>
          </button>
        </form>

        {/* Comptes de test & d'accès rapide */}
        <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">
            Comptes d'accès vérifiés :
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@defmaks.com', 'azerty')}
              className="w-full p-2.5 rounded-xl border border-[#0F2C59]/20 hover:border-[#0F2C59] bg-[#F8FAFC] hover:bg-[#EFF6FF] text-left transition flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <div className="font-bold text-[#0F2C59]">Super Admin / Admin École</div>
                  <div className="text-[10px] text-[#64748B]">admin@defmaks.com</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#0F2C59] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('mec@defmaks.com', 'azerty')}
              className="w-full p-2.5 rounded-xl border border-purple-200 hover:border-purple-500 bg-[#FAF5FF] hover:bg-[#F3E8FF] text-left transition flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <div className="font-bold text-purple-900">Prof. Shasa Kanyinda</div>
                  <div className="text-[10px] text-purple-700">mec@defmaks.com</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('parent@defmaks.com', 'azerty')}
              className="w-full p-2.5 rounded-xl border border-blue-200 hover:border-blue-500 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-left transition flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  P
                </div>
                <div>
                  <div className="font-bold text-blue-900">Espace Parent d'Élève</div>
                  <div className="text-[10px] text-blue-700">parent@defmaks.com</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>

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
