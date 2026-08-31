'use client';

import React, { useState } from 'react';
import { useRole } from '@/context/role-context';
import {
  Settings,
  Sparkles,
  ShieldCheck,
  Building2,
  Database,
  Smartphone,
  CheckCircle2,
  Lock,
  Save,
  User,
} from 'lucide-react';
import { APP_NAME, APP_SHORT_NAME } from '@/lib/config';

export default function SettingsPage() {
  const { roleInfo, role, isTeacher, isParent, isAdmin, isSuperAdmin } = useRole();
  const [session, setSession] = useState('2025-2026');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête Paramètres */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <Settings className="w-3 h-3 text-[#D4AF37]" />
              Configuration & Profil
            </span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              ADS Kinshasa
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Paramètres du Compte & Système
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Gestion de vos informations personnelles, code d'accès sécurisé et services connectés.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0F2C59] flex items-center gap-2 self-start sm:self-center">
          <span>{roleInfo.icon}</span>
          <span>{roleInfo.label}</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#DCFCE7] border border-[#10B981]/40 rounded-2xl text-xs text-[#15803D] flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Vos modifications ont été enregistrées avec succès.
        </div>
      )}

      {/* Profil de l'utilisateur actif */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
          <User className="w-4 h-4 text-[#0F2C59]" />
          <h2 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider">
            Informations du Profil ({roleInfo.label})
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Nom d'affichage
              </label>
              <input
                type="text"
                defaultValue={
                  isTeacher
                    ? 'Professeur Shasa'
                    : isParent
                    ? 'Famille Mukendi (Parent)'
                    : 'Administrateur Principal'
                }
                className="w-full px-3.5 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59] text-[#1E293B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Adresse Email / Identifiant
              </label>
              <input
                type="email"
                readOnly
                value={
                  isTeacher
                    ? 'mec@defmaks.com'
                    : isParent
                    ? 'parent@defmaks.com'
                    : 'admin@defmaks.com'
                }
                className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl text-[#64748B] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Établissement de Rattachement
              </label>
              <input
                type="text"
                readOnly
                value="Complexe Scolaire Académie du Salut (Kinshasa)"
                className="w-full px-3.5 py-2 text-xs border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl text-[#64748B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Code d'accès Sécurisé
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={
                    isTeacher
                      ? 'ADS-ENS-7842'
                      : isParent
                      ? 'ADS-PAR-9921'
                      : 'ADS-ADMIN-0001'
                  }
                  className="w-full px-3.5 py-2 text-xs font-mono font-extrabold border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl text-[#0F2C59]"
                />
                <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Mettre à jour le profil</span>
            </button>
          </div>
        </form>
      </div>

      {/* Services Connectés & Infrastructure */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F1F5F9]">
          <Database className="w-4 h-4 text-[#0F2C59]" />
          <h2 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider">
            Infrastructure & Intégrations E-RDC
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F2C59]">Supabase PostgreSQL Cloud RLS</p>
                <p className="text-[11px] text-[#64748B]">
                  Base relationnelle sécurisée avec politiques de sécurité par rôle.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D]">
              ● Actif
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F2C59]">Twiga Pay Gateway (Mobile Money)</p>
                <p className="text-[11px] text-[#64748B]">
                  Passerelle intégrée Orange Money, Airtel Money & M-Pesa RDC.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D]">
              ● Connecté
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
