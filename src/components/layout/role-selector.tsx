'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRole, ROLE_DEFINITIONS } from '@/context/role-context';
import { UserRole } from '@/types/database.types';

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

  const rolesList: UserRole[] = ['super_admin', 'admin', 'teacher', 'parent', 'student'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={}
        title="Cliquer pour changer de rôle de démonstration"
      >
        <span>{roleInfo.icon}</span>
        <span>{roleInfo.label}</span>
        <span className="text-[10px] opacity-70">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-slate-200">
          <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Changer le rôle actif
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
                  className={}
                >
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{item.label}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-teal-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full">
                          ACTIF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
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
