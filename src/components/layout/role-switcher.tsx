'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRole, ROLE_DEFINITIONS } from '@/context/role-context';
import { UserRole } from '@/types/database.types';
import { ChevronDown, Check, UserCheck } from 'lucide-react';
import { isProduction } from '@/lib/config';

interface RoleSwitcherProps {
  isCollapsed?: boolean;
}

export function RoleSwitcher({ isCollapsed = false }: RoleSwitcherProps) {
  const { role, setRole, roleInfo } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isProd = isProduction();

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // En mode production ou avant hydratation client, masquer totalement le switcher
  if (!mounted || isProd) {
    return null;
  }

  const rolesList: UserRole[] = ['super_admin', 'admin', 'teacher', 'parent'];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Bouton du sélecteur */}
      {isCollapsed ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 mx-auto rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#0F2C59]/20 text-[#0F2C59] flex items-center justify-center text-lg transition shadow-xs"
          title={`Rôle actif: ${roleInfo.label}`}
        >
          <span>{roleInfo.icon}</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition shadow-xs group text-left"
          title="Changer de rôle pour tester les vues"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl flex-shrink-0">{roleInfo.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  RÔLE ACTIF
                </span>
              </div>
              <p className="text-xs font-extrabold text-[#0F2C59] truncate leading-tight mt-0.5">
                {roleInfo.label}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#64748B] group-hover:text-[#0F2C59] transition-transform duration-200" />
        </button>
      )}

      {/* Menu déroulant */}
      {isOpen && (
        <div
          className={`absolute ${
            isCollapsed ? 'left-14 bottom-0' : 'left-0 bottom-full mb-2'
          } w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-2 z-50 text-[#1E293B] animate-in fade-in zoom-in-95`}
        >
          <div className="px-3 py-2 border-b border-[#F1F5F9] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Changer d'Espace
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#0F2C59]">
              Mode Test
            </span>
          </div>

          <div className="space-y-1 mt-1.5 max-h-72 overflow-y-auto">
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
                  className={`w-full text-left p-2 rounded-xl transition flex items-start gap-2.5 border ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#0F2C59]/30 text-[#0F2C59]'
                      : 'border-transparent hover:bg-[#F8FAFC] text-[#1E293B]'
                  }`}
                >
                  <span className="text-base mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F2C59]">{item.label}</span>
                      {isSelected && (
                        <span className="text-[9px] bg-[#0F2C59] text-[#D4AF37] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          ACTIF
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#64748B] leading-tight mt-0.5 line-clamp-1">
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
