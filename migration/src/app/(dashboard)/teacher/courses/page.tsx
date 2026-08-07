'use client';

import React, { useState } from 'react';
import { useCourses, useCreateCourse } from '@/hooks/use-courses';

export default function TeacherCoursesPage() {
  const { data: courses, isLoading, isError } = useCourses();
  const createCourseMutation = useCreateCourse();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formTitre, setFormTitre] = useState('');
  const [formClasse, setFormClasse] = useState('6ème Math-Physique');
  const [formMatiere, setFormMatiere] = useState('Mathématiques');
  const [formDescription, setFormDescription] = useState('');

  const filteredCourses = (courses || []).filter((c) => {
    const matchesSearch = c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.matiere_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClasse = selectedClasse === 'ALL' || c.classe === selectedClasse;
    return matchesSearch && matchesClasse;
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitre.trim()) return;

    await createCourseMutation.mutateAsync({
      titre: formTitre,
      classe: formClasse,
      matiere_nom: formMatiere,
      description: formDescription,
    });

    setFormTitre('');
    setFormDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📚</span> Gestion des Cours & Chapitres (Espace Enseignant)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publiez et organisez vos cours, leçons et fichiers pédagogiques pour vos élèves.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          <span>➕</span> Créer un Nouveau Cours
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Rechercher par titre de cours, chapitre ou matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
        <div>
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="ALL">Toutes les classes</option>
            <option value="6ème Math-Physique">6ème Math-Physique</option>
            <option value="6ème Bio-Chimie">6ème Bio-Chimie</option>
            <option value="4ème Littéraire">4ème Littéraire</option>
            <option value="8ème EB (Éducation de Base)">8ème EB (Éducation de Base)</option>
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          Chargement des cours en cours...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Aucun cours trouvé correspondant à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {course.matiere_nom || 'Général'}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                    {course.classe}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-lg group-hover:text-teal-400 transition leading-snug">
                  {course.titre}
                </h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                  {course.description || 'Aucune description fournie.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span>📖</span> {course.chapitres_count || 0} Chapitres
                </span>
                <button className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1">
                  Gérer les leçons &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Nouveau Cours Pédagogique</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Titre du Cours
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chimie Organique - Réactions d Addition"
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Classe Cible
                  </label>
                  <select
                    value={formClasse}
                    onChange={(e) => setFormClasse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="6ème Math-Physique">6ème Math-Physique</option>
                    <option value="6ème Bio-Chimie">6ème Bio-Chimie</option>
                    <option value="4ème Littéraire">4ème Littéraire</option>
                    <option value="8ème EB (Éducation de Base)">8ème EB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Matière
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chimie"
                    value={formMatiere}
                    onChange={(e) => setFormMatiere(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Description & Objectifs Pédagogiques
                </label>
                <textarea
                  rows={3}
                  placeholder="Présentation résumée des notions clés abordées..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2 text-sm rounded-xl transition"
                >
                  {createCourseMutation.isPending ? 'Enregistrement...' : 'Créer le cours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
