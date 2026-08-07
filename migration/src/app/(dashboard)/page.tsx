"use client";

import React from 'react';
import Link from 'next/link';

export default function DashboardHomePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Tableau de Bord Administration E-RDC
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Gestion centralisée des écoles, enseignants, élèves et abonnements Mobile Money (Twiga Paie).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Enseignants Active</span>
            <span className="p-2.5 bg-teal-50 text-teal-600 rounded-xl text-lg">👨‍🏫</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">42</div>
          <p className="text-xs text-teal-600 font-medium mt-2">100% connectés à l'application</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Élèves Inscrits</span>
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl text-lg">🎓</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">1,280</div>
          <p className="text-xs text-blue-600 font-medium mt-2">Codes d'accès générés</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Cours & Quizzes</span>
            <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl text-lg">📚</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">156</div>
          <p className="text-xs text-amber-600 font-medium mt-2">Préparation EXETAT / TENAFEP</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Paiements Twiga</span>
            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-lg">💳</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">8,450 $</div>
          <p className="text-xs text-emerald-600 font-medium mt-2">Mois en cours (Mobile Money)</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Accès Rapide aux Modules d'Administration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/teachers"
            className="p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:shadow-lg transition-all group"
          >
            <div className="text-3xl mb-3">👨‍🏫</div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
              Gestion des Enseignants
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Consulter, filtrer et gérer les comptes et disciplines des enseignants.
            </p>
          </Link>

          <Link
            href="/admin/students"
            className="p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:shadow-lg transition-all group"
          >
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
              Élèves & Codes d'Accès
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Générer les identifiants élèves et affecter aux classes et parents.
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:shadow-lg transition-all group"
          >
            <div className="text-3xl mb-3">💳</div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
              Paiements & Suivi Financier
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Historique et validation des transactions Twiga Paie Mobile Money.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
