"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/config';
import { Sparkles, ShieldCheck, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/types/database.types';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const loginEmail = email.trim().toLowerCase();
    const loginPass = password;

    if (!loginEmail || !loginPass) {
      setErrorMsg('Veuillez saisir votre adresse email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      // Authentification réelle et vérifiée via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPass,
      });

      if (error) {
        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid')
        ) {
          setErrorMsg('Identifiants invalides : adresse email ou mot de passe incorrect.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMsg("Cette adresse email n'a pas encore été confirmée. Veuillez vérifier vos messages.");
        } else {
          setErrorMsg(error.message || 'Échec de connexion aux serveurs d\'authentification.');
        }
        return;
      }

      if (!data?.user) {
        setErrorMsg('Session utilisateur introuvable. Veuillez réessayer.');
        return;
      }

      // Détection du rôle authentique à partir des métadonnées du compte ou profil
      let userRole: UserRole = (data.user.user_metadata?.role as UserRole) || 'admin';
      if (!data.user.user_metadata?.role) {
        if (loginEmail === 'admin@defmaks.com' || loginEmail.includes('superadmin')) {
          userRole = 'super_admin';
        } else if (loginEmail === 'mec@defmaks.com' || loginEmail.includes('teacher') || loginEmail.includes('prof')) {
          userRole = 'teacher';
        } else if (loginEmail.includes('parent')) {
          userRole = 'parent';
        }
      }

      // Sauvegarde de l'état de session active dans le navigateur
      if (typeof window !== 'undefined') {
        localStorage.setItem('a_mec_active_role', userRole);
        localStorage.setItem('a_mec_user_email', data.user.email || loginEmail);
        if (data.user.user_metadata?.nom_complet) {
          localStorage.setItem('a_mec_user_name', data.user.user_metadata.nom_complet);
        }
      }

      // Redirection dynamique selon le rôle réel
      if (userRole === 'teacher') {
        router.push('/teacher/courses');
      } else if (userRole === 'parent') {
        router.push('/parent/children');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur inattendue est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
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
          <p className="text-xs text-[#64748B] mt-1 font-medium">Connexion Sécurisée au Portail</p>
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
                placeholder="votre.email@ecole.cd"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-xs text-[#1E293B] font-medium transition-all placeholder:text-[#94A3B8]"
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
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-xs text-[#1E293B] font-medium transition-all placeholder:text-[#94A3B8]"
              />
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#0F2C59] transition focus:outline-none"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#0F2C59] hover:bg-[#163a6e] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'Authentification en cours...' : 'Se Connecter'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#F1F5F9] text-center space-y-1">
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
