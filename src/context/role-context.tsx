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

export const ROLE_DEFINITIONS: Record<UserRole, RoleInfo> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Admin',
    description: 'Gestion globale de la plateforme multi-écoles',
    icon: '👑',
    colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    userName: 'Super Administrateur',
    userEmail: 'superadmin@academiedusalut.cd',
  },
  admin: {
    role: 'admin',
    label: "Admin d'École",
    description: 'Gestion de l établissement, des enseignants, finances et effectifs',
    icon: '🏫',
    colorClass: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    userName: 'Direction ADS',
    userEmail: 'admin@academiedusalut.cd',
  },
  teacher: {
    role: 'teacher',
    label: 'Professeur Shasa',
    description: 'Gestion pédagogique, cours, leçons et quizzes 10 Qs',
    icon: '👨‍🏫',
    colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    userName: 'Prof. Shasa',
    userEmail: 'shasa@academiedusalut.cd',
    authUserId: 'b6416211-0e05-4432-85e9-c5b3b243e543',
  },
  parent: {
    role: 'parent',
    label: 'Parent',
    description: 'Inscription des enfants, suivi scolaire et règlement Twiga',
    icon: '👨‍👩‍👧',
    colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    userName: 'Parent Référent',
    userEmail: 'parent@academiedusalut.cd',
  },
  student: {
    role: 'student',
    label: 'Élève',
    description: 'Consultation des cours, passage des quizzes EXETAT & chat',
    icon: '🎓',
    colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    userName: 'Élève ADS',
    userEmail: 'eleve@academiedusalut.cd',
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
  isStudent: boolean;
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
        isStudent: role === 'student',
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
