"use client";

import React, { useState } from 'react';
import { useStudents, useCreateStudent } from '@/hooks/use-students';
import { RoleGuard } from '@/components/layout/role-guard';
import { GraduationCap, Plus, KeyRound, Sparkles, User, Calendar, ShieldCheck, X } from 'lucide-react';

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
    <RoleGuard allowedRoles={['super_admin', 'admin', 'teacher']} moduleName="le répertoire des Élèves & Effectifs">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFFBEB] px-2.5 py-0.5 rounded uppercase tracking-wider border border-[#D4AF37]/30">
              Académie du Salut • Pédagogie
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1">
            Répertoire des Élèves & Effectifs
          </h1>
          <p className="text-[#64748B] text-xs mt-0.5">
            Gestion des pseudonymes, codes d'accès uniques et rattachement tuteurs légaux
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Inscrire un Élève</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#64748B] text-xs">
            Chargement des effectifs scolaires...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Élève & Pseudonyme</th>
                  <th className="px-6 py-4">Code d'Accès Unique</th>
                  <th className="px-6 py-4">Parent / Tuteur</th>
                  <th className="px-6 py-4">Date d'Inscription</th>
                  <th className="px-6 py-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                {students?.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#0F2C59] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#0F2C59] font-bold flex items-center justify-center text-xs border border-[#0F2C59]/20 shadow-2xs">
                        <GraduationCap className="w-4 h-4 text-[#0F2C59]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#0F2C59]">{s.pseudonyme}</div>
                        <div className="text-[11px] text-[#64748B] font-normal">Section Primaire & Secondaire</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-lg bg-[#0F2C59] text-[#D4AF37] font-bold tracking-wider shadow-2xs">
                        <KeyRound className="w-3 h-3 text-[#D4AF37]" />
                        <span>{s.code_acces}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#1E293B]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{s.parent?.nom_complet || 'Tuteur non assigné'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#64748B]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                        Actif
                      </span>
                    </td>
                  </tr>
                ))}

                {(!students || students.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#64748B]">
                      Aucun élève inscrit pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2C59]">Inscrire un Élève</h2>
                  <p className="text-[11px] text-[#64748B]">Académie du Salut (ADS)</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                  Pseudonyme / Prénom & Nom de l'Élève *
                </label>
                <input
                  type="text"
                  required
                  value={pseudonyme}
                  onChange={(e) => setPseudonyme(e.target.value)}
                  placeholder="ex: Kabasele_Marc"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                />
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>
                  Un <strong>code d'accès unique (ex: ADS-EL-1049)</strong> sera automatiquement généré pour permettre à l'élève de se connecter sans mot de passe complexe.
                </span>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createStudentMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{createStudentMutation.isPending ? 'Génération...' : 'Créer & Générer Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
