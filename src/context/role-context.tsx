'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types/database.types';

export interface RoleInfo {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
  colorClass: string;
  userName: string;
  userEmail: string;
  authUserId?: string;
}

export const ROLE_DEFINITIONS: Record<string, RoleInfo> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Administrateur',
    description: 'Contrôle toute cette administration et gestion multi-écoles',
    icon: '👑',
    colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    userName: 'Super Administrateur',
    userEmail: 'admin@defmaks.com',
  },
  admin: {
    role: 'admin',
    label: "Admin d'École",
    description: 'Contrôle uniquement les écoles auxquelles il est affecté',
    icon: '🏫',
    colorClass: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    userName: 'Direction Établissement',
    userEmail: 'admin@defmaks.com',
  },
  teacher: {
    role: 'teacher',
    label: 'Professeur (Shasa)',
    description: 'Crée cours, chapitres/leçons, quiz (10 Qs) et chat avec les élèves',
    icon: '👨‍🏫',
    colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    userName: 'Prof. Shasa Kanyinda',
    userEmail: 'mec@defmaks.com',
    authUserId: 'b6416211-0e05-4432-85e9-c5b3b243e543',
  },
  parent: {
    role: 'parent',
    label: 'Parent d’Élève',
    description: 'Gère son compte, crée des élèves et les affecte à l’école',
    icon: '👨‍👩‍👧',
    colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    userName: 'Parent Référent',
    userEmail: 'parent@defmaks.com',
  },
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roleInfo: RoleInfo;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isParent: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('admin');

  useEffect(() => {
    const savedRole = localStorage.getItem('a_mec_active_role') as UserRole;
    if (savedRole && ROLE_DEFINITIONS[savedRole]) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('a_mec_active_role', newRole);
  };

  const roleInfo = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.admin;

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        roleInfo,
        isSuperAdmin: role === 'super_admin',
        isAdmin: role === 'admin' || role === 'super_admin',
        isTeacher: role === 'teacher',
        isParent: role === 'parent',
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
