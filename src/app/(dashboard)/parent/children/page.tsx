'use client';

import React, { useState } from 'react';
import { useStudents, useCreateStudent } from '@/hooks/use-students';
import { useSchools } from '@/hooks/use-schools';
import { APP_NAME } from '@/lib/config';

export default function ParentChildrenPage() {
  const { data: students, isLoading } = useStudents();
  const { data: schools } = useSchools();
  const createStudentMutation = useCreateStudent();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomComplet, setNomComplet] = useState('');
  const [classe, setClasse] = useState('6ème Math-Physique');
  const [ecoleId, setEcoleId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim()) return;

    await createStudentMutation.mutateAsync({
      nom_complet: nomComplet.trim(),
      ecole_id: ecoleId || undefined,
    });

    setNomComplet('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>👶</span> Espace Parent - Inscription & Suivi des Enfants
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Inscrivez vos enfants au sein des établissements scolaires RDC, suivez leur assiduité et leurs résultats aux examens.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center gap-2 self-start md:self-auto shadow-md"
          >
            <span>➕</span>
            <span>Inscrire un Nouvel Enfant</span>
          </button>
        </div>
      </div>

      {/* Children List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎓</span> Mes Enfants Inscrits ({students?.length || 0})
        </h2>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Chargement de la liste de vos enfants...
          </div>
        ) : students && students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((child: any) => (
              <div
                key={child.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/40 transition space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-base">
                      {(child.nom_complet || child.pseudonyme || 'E').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">
                        {child.nom_complet || child.pseudonyme || 'Élève'}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Matricule : {child.matricule || child.code_acces || 'ADS-8812'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">École :</span>
                    <span className="font-semibold text-teal-400">{APP_NAME}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Classe :</span>
                    <span className="font-semibold text-slate-200">6ème Math-Physique</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Statut Inscription :</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ● Actif
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-xl transition">
                    📊 Bulletins & Notes
                  </button>
                  <button className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold py-2 rounded-xl transition">
                    💳 Frais Scolaires
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            Aucun enfant inscrit sous votre compte. Cliquez sur &quot;Inscrire un Nouvel Enfant&quot; ci-dessus.
          </div>
        )}
      </div>

      {/* Modal Enroll Child */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>➕</span> Inscription d un Enfant
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nom Complet de l Enfant *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean-Luc Kalonji"
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Établissement Scolaire *
                </label>
                <select
                  value={ecoleId}
                  onChange={(e) => setEcoleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">{APP_NAME} (Par défaut)</option>
                  {(schools || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Classe & Option *
                </label>
                <select
                  value={classe}
                  onChange={(e) => setClasse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="6ème Math-Physique">6ème Math-Physique (EXETAT)</option>
                  <option value="6ème Biologie-Chimie">6ème Biologie-Chimie (EXETAT)</option>
                  <option value="6ème Commerciale & Gestion">6ème Commerciale & Gestion</option>
                  <option value="8ème Année EB">8ème Année EB (TENAFEP)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createStudentMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition shadow-lg disabled:opacity-50"
                >
                  Confirm Inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
