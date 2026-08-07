'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [activeRole, setActiveRole] = useState('ADMIN');
  const [notifyEmail, setNotifyEmail] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>⚙️</span> Paramètres & Configuration Système
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gérez votre profil administrateur/enseignant et les intégrations de la plateforme.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
          Profil Administrateur E-RDC
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nom d utilisateur</label>
            <input
              type="text"
              readOnly
              value="Admin E-RDC (Kinshasa)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Adresse Email</label>
            <input
              type="text"
              readOnly
              value="admin@e-rdc.cd"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-300"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
          Connexion Supabase & Services
        </h2>
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div>
            <div className="text-sm font-semibold text-white">Base de Données Supabase SSR</div>
            <div className="text-xs text-slate-400">PostgreSQL Cloud + Supabase Auth & Storage</div>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
            ● Connecté
          </span>
        </div>
      </div>
    </div>
  );
}
