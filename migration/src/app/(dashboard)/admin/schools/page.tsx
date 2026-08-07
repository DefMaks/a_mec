"use client";

import React, { useState } from 'react';
import { useSchools, useCreateSchool } from '@/hooks/use-schools';

export default function AdminSchoolsPage() {
  const { data: schools, isLoading } = useSchools();
  const createSchoolMutation = useCreateSchool();

  const [nom, setNom] = useState('');
  const [rccm, setRccm] = useState('');
  const [idNat, setIdNat] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    await createSchoolMutation.mutateAsync({
      nom,
      rccm: rccm || undefined,
      id_nat: idNat || undefined,
    });

    setNom('');
    setRccm('');
    setIdNat('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Répertoire des Écoles Partenaires</h1>
          <p className="text-slate-500 text-sm">Gestion des établissements scolaires enregistrés sur E-RDC</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          ➕ Ajouter une École
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Chargement des écoles...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools?.map((school) => (
            <div
              key={school.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xl mb-4 border border-teal-100">
                  🏫
                </div>
                <h3 className="font-bold text-lg text-slate-900">{school.nom}</h3>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p><span className="font-semibold text-slate-700">RCCM :</span> {school.rccm || 'Non renseigné'}</p>
                  <p><span className="font-semibold text-slate-700">ID NAT :</span> {school.id_nat || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Inscrit le {new Date(school.created_at).toLocaleDateString()}</span>
                <span className="font-medium text-teal-600">Actif</span>
              </div>
            </div>
          ))}

          {(!schools || schools.length === 0) && (
            <div className="col-span-full bg-white p-12 text-center text-slate-500 rounded-2xl border border-slate-200">
              Aucune école enregistrée pour le moment.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Nouvelle École</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de l'établissement *</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Complexe Scolaire La Sagesse"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">RCCM</label>
                <input
                  type="text"
                  value={rccm}
                  onChange={(e) => setRccm(e.target.value)}
                  placeholder="CD/KIN/RCCM/20-B-102"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ID National</label>
                <input
                  type="text"
                  value={idNat}
                  onChange={(e) => setIdNat(e.target.value)}
                  placeholder="01-95-N38190"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createSchoolMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-md"
                >
                  {createSchoolMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
