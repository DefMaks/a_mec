'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMatieres, useCreateMatiere, useDeleteMatiere } from '@/hooks/use-matieres';
import { useRole } from '@/context/role-context';
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  CheckCircle2,
  X,
  GraduationCap,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export default function AdminMatieresPage() {
  const { isSuperAdmin, isAdmin } = useRole();
  const { data: matieres, isLoading } = useMatieres();
  const createMatiereMutation = useCreateMatiere();
  const deleteMatiereMutation = useDeleteMatiere();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nom.trim()) {
      setFormError('Veuillez renseigner le nom de la matière.');
      return;
    }

    try {
      await createMatiereMutation.mutateAsync({
        nom: nom.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      });

      setNom('');
      setCode('');
      setDescription('');
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Erreur lors de la création de la matière.');
    }
  };

  const handleDelete = async (id: string, matiereNom: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la matière "${matiereNom}" ?`)) {
      try {
        await deleteMatiereMutation.mutateAsync(id);
      } catch (err: any) {
        alert('Erreur lors de la suppression: ' + err?.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Programme Officiel STEM RDC
            </span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              Gestion Administrative
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Matières & Disciplines d'Enseignement
          </h1>
          <p className="text-[#64748B] text-xs mt-0.5 max-w-2xl">
            Créez et structurez le référentiel des matières officielles. Les professeurs y rattachent ensuite leurs cours, chapitres et questionnaires 10 Qs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouvelle Matière</span>
        </button>
      </div>

      {/* Cartes de Matières */}
      {isLoading ? (
        <div className="p-12 text-center text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0] text-xs">
          Chargement des matières académiques...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matieres?.map((m) => (
            <div
              key={m.id}
              className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#0F2C59] font-mono font-bold flex items-center justify-center text-sm mb-4 border border-[#0F2C59]/10 shadow-2xs group-hover:scale-105 transition-transform">
                    {m.code}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Actif
                    </span>
                    {(isSuperAdmin || isAdmin) && (
                      <button
                        onClick={() => handleDelete(m.id, m.nom)}
                        className="p-1 text-[#94A3B8] hover:text-[#EF4444] transition rounded-lg hover:bg-[#FEF2F2]"
                        title="Supprimer la matière"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-[#0F2C59]">{m.nom}</h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed line-clamp-2">
                  {m.description || 'Discipline du programme national d’enseignement de la RDC.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="text-[#64748B] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{m.cours_count || 0} Cours liés</span>
                </span>
                <Link
                  href="/teacher/courses"
                  className="font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
                >
                  <span>Voir cours</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {(!matieres || matieres.length === 0) && (
            <div className="col-span-full bg-white p-12 text-center text-[#64748B] rounded-2xl border border-[#E2E8F0]">
              Aucune matière enregistrée. Cliquez sur "Nouvelle Matière" pour configurer le catalogue.
            </div>
          )}
        </div>
      )}

      {/* Modal Création Matière */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#0F2C59]">Créer une Matière</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F2C59] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#F87171]/40 rounded-xl text-xs text-[#DC2626]">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Nom de la Matière *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mathématiques, Physique, Chimie..."
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Code / Sigle (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: MATH, PHYS, CHIM, INFO..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Description & Objectifs
                </label>
                <textarea
                  rows={3}
                  placeholder="Objectifs pédagogiques, axes STEM ou référentiel du programme..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59] focus:ring-1 focus:ring-[#0F2C59]"
                />
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMatiereMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  {createMatiereMutation.isPending ? 'Création...' : 'Enregistrer la Matière'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
