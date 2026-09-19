"use client";

import React, { useState } from 'react';
import { useAllClasses, useCreateAdminClass } from '@/hooks/use-course-assignments';
import { useTeachers } from '@/hooks/use-teachers';
import { RoleGuard } from '@/components/layout/role-guard';
import {
  GraduationCap,
  Plus,
  Search,
  Building2,
  Users,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export default function AdminClassesPage() {
  const [search, setSearch] = useState('');
  const { data: classes, isLoading: loadingClasses } = useAllClasses();
  const { data: teachers, isLoading: loadingTeachers } = useTeachers({});
  const createClassMutation = useCreateAdminClass();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [niveauId, setNiveauId] = useState('53b37e2f-110b-4551-ac31-e018305f74d5');
  const [titulaireId, setTitulaireId] = useState('');

  const filteredClasses = classes?.filter((c) =>
    c.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    await createClassMutation.mutateAsync({
      nom,
      niveau_id: niveauId,
      titulaire_id: titulaireId || undefined,
      ecole_id: DEFAULT_SCHOOL_ID,
    });

    setNom('');
    setTitulaireId('');
    setIsModalOpen(false);
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} moduleName="la gestion des Classes">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#0F2C59] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#CBD5E1]">
                Scolarité & Structure
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
              Classes & Niveaux
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Gérez l'organisation des classes et l'affectation des enseignants titulaires.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#0F2C59] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#0F2C59]/90 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Classe
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher une classe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] shadow-sm text-[#1E293B]"
            />
          </div>
        </div>

        {/* List */}
        {loadingClasses ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080] mb-4"></div>
            <p className="text-[#64748B] font-medium">Chargement des classes...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Titulaire
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredClasses?.map((c) => {
                  const titulaire = teachers?.find((t) => t.id === c.titulaire_id);

                  return (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold border border-[#DBEAFE]">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#0F2C59]">{c.nom}</div>
                            <div className="text-[11px] text-[#64748B] font-normal flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3" />
                              Académie du Salut
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-[#1E293B]">
                        {/* Fake niveau resolution if not populated */}
                        {c.nom?.includes('Primaire') ? 'Enseignement Primaire' : 'Éducation de Base'}
                      </td>
                      <td className="px-6 py-4">
                        {titulaire ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F2C59]">
                            <div className="w-6 h-6 rounded-full bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center">
                              {titulaire.nom_complet.charAt(0)}
                            </div>
                            {titulaire.nom_complet}
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8] italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {(!filteredClasses || filteredClasses.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[#64748B]">
                      Aucune classe trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CRÉATION CLASSE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/30 shadow-2xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2C59]">Nouvelle Classe</h2>
                  <p className="text-[11px] text-[#64748B]">Créer une classe et assigner un titulaire</p>
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
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom de la Classe *</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex: 2ème Primaire A"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Niveau d'enseignement</label>
                <select
                  value={niveauId}
                  onChange={(e) => setNiveauId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                >
                  <option value="53b37e2f-110b-4551-ac31-e018305f74d5">Primaire (1ère - 6ème)</option>
                  <option value="9b6b7a2d-4551-110b-ac31-b3b37e2f0183">Éducation de Base (7ème - 8ème)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Enseignant Titulaire</label>
                <select
                  value={titulaireId}
                  onChange={(e) => setTitulaireId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                >
                  <option value="">-- Sans titulaire --</option>
                  {teachers?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nom_complet}
                    </option>
                  ))}
                </select>
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
                  disabled={createClassMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{createClassMutation.isPending ? 'Création...' : 'Créer la classe'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleGuard>
  );
}
