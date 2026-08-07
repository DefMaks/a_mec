'use client';

import React, { useState } from 'react';
import { useParents } from '@/hooks/use-parents';

export default function AdminParentsPage() {
  const { data: parents, isLoading } = useParents();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredParents = (parents || []).filter((p) => {
    const matchesSearch =
      p.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telephone.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.statut_abonnement === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>👨‍👩‍👧</span> Gestion des Parents & Responsables
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Suivi des comptes tuteurs, enfants rattachés et statut de souscription Mobile Money.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Rechercher par nom du parent, téléphone (+243) ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="ALL">Tous les statuts d abonnement</option>
            <option value="ACTIF">Abonnement Actif</option>
            <option value="EN_ATTENTE">En attente de paiement</option>
            <option value="EXPIRER">Abonnement Expiré</option>
          </select>
        </div>
      </div>

      {/* Parents Table / Cards */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          Chargement des données parents...
        </div>
      ) : filteredParents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Aucun parent trouvé correspondant aux critères.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Parent / Tuteur</th>
                  <th className="py-3.5 px-4">Téléphone Mobile Money</th>
                  <th className="py-3.5 px-4">Ville / Ville-Province</th>
                  <th className="py-3.5 px-4">Élève(s) Rattaché(s)</th>
                  <th className="py-3.5 px-4">Abonnement</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{parent.nom_complet}</div>
                      <div className="text-xs text-slate-400">{parent.email || 'Pas d email'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-teal-400 font-medium">
                      {parent.telephone}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {parent.commune_ville}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {parent.eleves_lies.map((el) => (
                          <div key={el.id} className="text-xs flex items-center gap-1.5">
                            <span className="font-medium text-slate-200">🎓 {el.nom_complet}</span>
                            <span className="text-[10px] text-slate-400">({el.classe} - {el.ecole_nom})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          parent.statut_abonnement === 'ACTIF'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : parent.statut_abonnement === 'EN_ATTENTE'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        ● {parent.statut_abonnement}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition">
                        Détails & Reçus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
