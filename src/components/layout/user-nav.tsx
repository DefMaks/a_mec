"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/context/role-context';
import { LogOut, User, ShieldCheck } from 'lucide-react';

interface UserNavProps {
  userEmail?: string;
  userName?: string;
}

export function UserNav({ userEmail, userName }: UserNavProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const navRef = useRef<HTMLDivElement>(null);
  const { roleInfo } = useRole();

  const activeName = userName || roleInfo.userName || 'Utilisateur';
  const activeEmail = userEmail || roleInfo.userEmail || 'contact@academiedusalut.cd';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="relative" ref={navRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition-all focus:outline-none"
        title={`Profil connecté : ${activeName}`}
      >
        <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0F2C59] font-bold flex items-center justify-center text-xs shadow-sm border border-white/40">
          {activeName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden xl:block">
          <p className="text-xs font-bold text-white leading-tight">{activeName}</p>
          <p className="text-[10px] text-white/70">{roleInfo.label}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-[#E2E8F0] py-2 z-50 text-[#1E293B] animate-in fade-in slide-in-from-top-1">
          <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{roleInfo.label}</span>
            </div>
            <p className="text-xs font-bold text-[#0F2C59] truncate mt-0.5">{activeName}</p>
            <p className="text-[11px] text-[#64748B] truncate">{activeEmail}</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push('/settings');
              }}
              className="w-full text-left px-3 py-2 text-xs text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Paramètres du Compte</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-xs text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5 text-[#EF4444]" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
