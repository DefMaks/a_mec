'use client';

import React from 'react';
import { useNavigationLoading } from '@/context/navigation-transition-context';
import { Loader2 } from 'lucide-react';

export function NavigationProgressBar() {
  const { isNavigating, progress } = useNavigationLoading();

  if (!isNavigating && progress === 0) return null;

  return (
    <>
      {/* Top Gradient Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none transition-opacity duration-200"
        style={{ opacity: isNavigating || progress > 0 ? 1 : 0 }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#0F2C59] via-[#D4AF37] to-[#FACC15] transition-all duration-200 ease-out shadow-[0_0_12px_rgba(212,175,55,0.8)] relative"
          style={{ width: `${progress}%` }}
        >
          {/* Glowing Lead Light at the front of the bar */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FACC15] rounded-full blur-xs opacity-90 shadow-[0_0_8px_#FACC15]" />
        </div>
      </div>

      {/* Floating Transition Indicator (Non-intrusive, elegant badge) */}
      {isNavigating && (
        <div className="fixed top-3 right-5 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F2C59]/95 text-white shadow-lg border border-[#D4AF37]/40 backdrop-blur-md">
            <Loader2 className="w-3.5 h-3.5 text-[#D4AF37] animate-spin flex-shrink-0" />
            <span className="text-[11px] font-semibold tracking-wide text-slate-100">
              Chargement...
            </span>
          </div>
        </div>
      )}
    </>
  );
}
