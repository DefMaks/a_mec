"use client";

import React, { useState } from 'react';
import { useCourses, useCreateCourse } from '@/hooks/use-courses';
import { useMatieres } from '@/hooks/use-matieres';
import { useAllClasses } from '@/hooks/use-course-assignments';
import { useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/components/layout/role-guard';
import { executeMesureCourseSimulation } from '@/lib/simulation/mesure-courses-simulation';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  // By passing true as the second arg we query as superAdmin -> no filtering by single class if we didn't want to, but we don't need to specify classId
  const { data: courses, isLoading: loadingCourses } = useCourses(undefined, true);
  const { data: matieres } = useMatieres();
  const { data: classes } = useAllClasses();

  const createCourseMutation = useCreateCourse();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [matiereId, setMatiereId] = useState('');
  const [classeId, setClasseId] = useState('');

  const handleRunSimulation = () => {
    const res = executeMesureCourseSimulation();
    if (res?.success) {
      setSimulationStatus(
        'Simulation effectuée avec succès : 6 cours de Mesure créés (1ère à 6ème Primaire), 29 chapitres et 12 quiz TENAFEP intégrés !'
      );
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['cours_classes'] });
      setTimeout(() => setSimulationStatus(null), 8000);
    }
  };

  const filteredCourses = courses?.filter((c) =>
    c.titre?.toLowerCase().includes(search.toLowerCase()) ||
    c.matiere_nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.classe?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !matiereId || !classeId) return;

    const selectedMatiere = matieres?.find(m => m.id === matiereId);
    const selectedClasse = classes?.find(c => c.id === classeId);

    await createCourseMutation.mutateAsync({
      titre,
      description,
      matiere_id: matiereId,
      matiere_nom: selectedMatiere?.nom,
      matiere: selectedMatiere?.nom,
      classe_id: classeId,
      classe: selectedClasse?.nom,
      target_classe_ids: [classeId],
      ecole_id: DEFAULT_SCHOOL_ID
    });

    setTitre('');
    setDescription('');
    setMatiereId('');
    setClasseId('');
    setIsModalOpen(false);
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} moduleName="la gestion des Cours">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#0F2C59] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#CBD5E1]">
                Gestion Pédagogique
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
              Cours & Programmes
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Gérez le catalogue des cours, associez-les aux matières et aux classes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRunSimulation}
              className="flex items-center gap-2 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#D4AF37]/50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all active:scale-[0.98]"
              title="Générer la simulation pédagogique complète de Mathématiques - Mesure (1ère à 6ème Primaire)"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Simuler Cours "Mesure" (1P à 6P)</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#0F2C59] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#0F2C59]/90 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Nouveau Cours
            </button>
          </div>
        </div>

        {/* Simulation Feedback Alert */}
        {simulationStatus && (
          <div className="bg-[#ECFDF5] border border-[#10B981]/30 p-4 rounded-xl flex items-center justify-between gap-3 text-sm text-[#065F46] shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              <span className="font-semibold">{simulationStatus}</span>
            </div>
            <button
              onClick={() => setSimulationStatus(null)}
              className="text-[#065F46] hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] shadow-sm text-[#1E293B]"
            />
          </div>
        </div>

        {/* List */}
        {loadingCourses ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080] mb-4"></div>
            <p className="text-[#64748B] font-medium">Chargement des cours...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Matière
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Classe(s)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredCourses?.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center font-bold border border-[#CCFBF1]">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#0F2C59]">{c.titre}</div>
                          <div className="text-[11px] text-[#64748B] font-normal truncate max-w-xs mt-0.5">
                            {c.description || 'Aucune description fournie.'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#1E293B]">
                        <Layers className="w-3.5 h-3.5 text-[#64748B]" />
                        {c.matiere_nom || c.matiere || 'Général'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#1E293B]">
                        <GraduationCap className="w-3.5 h-3.5 text-[#64748B]" />
                        {c.classe || 'Non assignée'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Actif
                      </span>
                    </td>
                  </tr>
                ))}

                {(!filteredCourses || filteredCourses.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[#64748B]">
                      Aucun cours trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CRÉATION COURS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/30 shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2C59]">Nouveau Cours</h2>
                  <p className="text-[11px] text-[#64748B]">Créer un cours au sein du programme de l'établissement</p>
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
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Titre du Cours *</label>
                <input
                  type="text"
                  required
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="ex: Mesure (8ème EB)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Description (Optionnel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brève description du cours..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Matière *</label>
                  <select
                    required
                    value={matiereId}
                    onChange={(e) => setMatiereId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                  >
                    <option value="">Sélectionnez...</option>
                    {matieres?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Classe / Niveau *</label>
                  <select
                    required
                    value={classeId}
                    onChange={(e) => setClasseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                  >
                    <option value="">Sélectionnez...</option>
                    {classes?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
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
                  disabled={createCourseMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{createCourseMutation.isPending ? 'Création...' : 'Créer le cours'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RoleGuard>
  );
}
