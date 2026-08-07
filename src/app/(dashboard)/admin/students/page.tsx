"use client";

import React, { useState } from 'react';
import { useStudents, useCreateStudent } from '@/hooks/use-students';

export default function AdminStudentsPage() {
  const { data: students, isLoading } = useStudents();
  const createStudentMutation = useCreateStudent();

  const [pseudonyme, setPseudonyme] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudonyme.trim()) return;

    await createStudentMutation.mutateAsync({
      pseudonyme,
    });

    setPseudonyme('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Répertoire des Élèves & Codes d'Accès</h1>
          <p className="text-slate-500 text-sm">Gestion des pseudonymes et identifiants de connexion élèves</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          🎓 Inscrire un Élève
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Chargement de la liste des élèves...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Pseudonyme</th>
                <th className="px-6 py-4">Code d'Accès Unique</th>
                <th className="px-6 py-4">Parent Associé</th>
                <th className="px-6 py-4">Date d'Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {students?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs border border-teal-200">
                      🎓
                    </div>
                    {s.pseudonyme}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-teal-400 font-bold tracking-wider">
                      {s.code_acces}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    {s.parent?.nom_complet || 'Non lié'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    Aucun élève inscrit pour le moment.
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
            <h2 className="text-lg font-bold text-slate-900">Inscrire un Élève</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pseudonyme / Prénom Élève *</label>
                <input
                  type="text"
                  required
                  value={pseudonyme}
                  onChange={(e) => setPseudonyme(e.target.value)}
                  placeholder="Eleve_Kabasele"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <p className="text-xs text-slate-500">
                Un code d'accès sécurisé sera généré automatiquement pour cet élève.
              </p>
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
                  disabled={createStudentMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-md"
                >
                  {createStudentMutation.isPending ? 'Génération...' : 'Créer & Générer Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
