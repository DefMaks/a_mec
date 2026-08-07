"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UserNavProps {
  userEmail?: string;
  userName?: string;
}

export function UserNav({ userEmail = 'admin@ecole.cd', userName = 'Administrateur' }: UserNavProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-all focus:outline-none"
      >
        <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm border-2 border-teal-500">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{userName}</p>
          <p className="text-xs text-slate-500">{userEmail}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase">Compte</p>
            <p className="text-sm font-medium text-slate-800 truncate">{userName}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
          >
            🚪 Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
