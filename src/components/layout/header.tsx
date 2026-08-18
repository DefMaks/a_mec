'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserNav } from './user-nav';
import { Bell, Calendar, Sparkles } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

export function Header() {
  const [session, setSession] = useState('2025-2026');
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-[#0F2C59] border-b border-[#0F2C59]/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 text-white shadow-md">
      {/* Left Section: Official Crest + Name + STEM Badge */}
      <div className="flex items-center gap-3">
        {/* Official Crest / Blason Logo */}
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D4AF37]/60 flex items-center justify-center shadow-inner relative overflow-hidden group p-1">
          <Image
            src="/stem.avif"
            alt="Académie du Salut Logo"
            width={36}
            height={36}
            className="object-contain w-full h-full"
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Institution Title & Tag */}
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-sm md:text-base tracking-wide text-white font-sans uppercase">
            {APP_NAME}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            STEM - RDC
          </span>
        </div>
      </div>

      {/* Right Section: Academic Year Selector + Notifications + User */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Session / Academic Year Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/90">
          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-white/70 text-[11px]">Session :</span>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            aria-label="Année scolaire"
            className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="2025-2026" className="text-[#1E293B]">2025 - 2026 (En cours)</option>
            <option value="2024-2025" className="text-[#1E293B]">2024 - 2025 (Archivée)</option>
          </select>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center transition text-white/90 relative"
            title="Centre de notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-[#0F2C59]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#E2E8F0] p-3 text-[#1E293B] z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <span className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">Directives & Alertes ADS</span>
                <span className="text-[10px] bg-[#ECFDF5] text-[#15803D] font-bold px-2 py-0.5 rounded-full border border-[#10B981]/30">2 nouvelles</span>
              </div>
              <div className="divide-y divide-[#F1F5F9] text-xs">
                <div className="py-2.5">
                  <p className="font-semibold text-[#0F2C59]">Paiement Minerval Validé</p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">3 nouveaux règlements Mobile Money reçus aujourd'hui.</p>
                </div>
                <div className="py-2.5">
                  <p className="font-semibold text-[#0F2C59]">Quiz TENAFEP & EXETAT</p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">La série QCM Math-Physique 10 questions est active.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Navigation Avatar */}
        <UserNav />
      </div>
    </header>
  );
}
