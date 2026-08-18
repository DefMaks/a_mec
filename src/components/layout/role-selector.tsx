'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRole, ROLE_DEFINITIONS } from '@/context/role-context';
import { UserRole } from '@/types/database.types';
import { ChevronDown, Check } from 'lucide-react';

export function RoleSelector() {
  const { role, setRole, roleInfo } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: UserRole[] = ['admin', 'teacher', 'student', 'parent', 'super_admin'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition shadow-xs"
        title="Changer de vue de rôle pour tester les fonctionnalités"
      >
        <span>{roleInfo.icon}</span>
        <span className="truncate">{roleInfo.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl p-2 z-50 text-[#1E293B] animate-in fade-in slide-in-from-top-1">
          <div className="px-3 py-2 border-b border-[#F1F5F9] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Sélectionner un Rôle
          </div>
          <div className="space-y-1 mt-1">
            {rolesList.map((rKey) => {
              const item = ROLE_DEFINITIONS[rKey];
              const isSelected = rKey === role;
              return (
                <button
                  key={rKey}
                  onClick={() => {
                    setRole(rKey);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg transition flex items-start gap-2.5 border ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#0F2C59]/30 text-[#0F2C59]'
                      : 'border-transparent hover:bg-[#F8FAFC] text-[#1E293B]'
                  }`}
                >
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F2C59]">{item.label}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-[#0F2C59] text-[#D4AF37] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          ACTIF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-tight mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
