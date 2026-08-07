"use client";

import React, { useState } from 'react';
import { useTeachers, useCreateTeacher } from '@/hooks/use-teachers';
import { useSchools } from '@/hooks/use-schools';

export default function AdminTeachersPage() {
  const [search, setSearch] = useState('');
  const { data: teachers, isLoading } = useTeachers({ search });
  const { data: schools } = useSchools();
  const createTeacherMutation = useCreateTeacher();

  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ecoleId, setEcoleId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim() || !email.trim()) return;

    await createTeacherMutation.mutateAsync({
      nom_complet: nomComplet,
      email,
      telephone: telephone || undefined,
      ecole_id: ecoleId || undefined,
    });

    setNomComplet('');
    setEmail('');
    setTelephone('');
    setEcoleId('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Corps Enseignant</h1>
          <p className="text-slate-500 text-sm">Gestion des enseignants et professeurs de cours</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          ➕ Ajouter un Enseignant
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
        <span className="text-slate-400 text-lg">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un enseignant par nom..."
          className="w-full text-sm bg-transparent focus:outline-none text-slate-800"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Chargement des enseignants...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nom Complet</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Établissement</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {teachers?.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                      {t.nom_complet.charAt(0).toUpperCase()}
                    </div>
                    {t.nom_complet}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div>{t.email || '—'}</div>
                    <div className="text-slate-400">{t.telephone || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    {t.ecoles?.nom || 'Non assigné'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Actif
                    </span>
                  </td>
                </tr>
              ))}

              {(!teachers || teachers.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    Aucun enseignant trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Nouvel Enseignant</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom Complet *</label>
                <input
                  type="text"
                  required
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  placeholder="Prof. Jean-Marc Ilunga"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prof.ilunga@ecole.cd"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+243810000000"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Établissement</label>
                <select
                  value={ecoleId}
                  onChange={(e) => setEcoleId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">Sélectionner une école...</option>
                  {schools?.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
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
                  disabled={createTeacherMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-md"
                >
                  {createTeacherMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
