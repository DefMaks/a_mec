'use client';

import React, { useState } from 'react';
import { useCourses } from '@/hooks/use-courses';
import { Course } from '@/hooks/use-courses';

export default function StudentCoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = (courses || []).filter((c) => {
    const matchesSearch =
      c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.matiere && c.matiere.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.enseignant_nom && c.enseignant_nom.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📖</span> Espace Élève - Cours & Leçons
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Accédez à vos cours, écoutez les fichiers audio des leçons et révisez le programme national RDC.
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>🎓</span> Mode Élève (E-RDC)
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un cours, une matière ou un enseignant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Chargement des cours de votre classe...
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-teal-500/40 transition flex flex-col justify-between space-y-4 group shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {course.matiere || 'Matière générale'}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {course.classe || '6ème Math-Physique'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition leading-snug">
                  {course.titre}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {course.description || 'Contenu pédagogique officiel conforme au programme national RDC.'}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>👨‍🏫</span>
                  <span>Prof. {course.enseignant_nom || 'Titulaire'}</span>
                  <span className="ml-auto text-[11px] text-slate-500">
                    {course.chapitres?.length || 0} Chapitre(s)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCourse(course)}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>📖 Read & Study</span>
                <span>&rarr;</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
          Aucun cours trouvé pour votre recherche.
        </div>
      )}

      {/* Reader Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  {selectedCourse.matiere || 'Matière'} • {selectedCourse.classe || 'Classe'}
                </span>
                <h2 className="text-2xl font-bold text-white mt-2">{selectedCourse.titre}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enseignant : Prof. {selectedCourse.enseignant_nom || 'Titulaire'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Chapitres & Leçons du Cours
              </h3>

              {selectedCourse.chapitres && selectedCourse.chapitres.length > 0 ? (
                <div className="space-y-3">
                  {selectedCourse.chapitres.map((chap, idx) => (
                    <div
                      key={chap.id || idx}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 text-xs font-mono flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {chap.titre}
                        </h4>
                        <span className="text-xs text-slate-400">
                          ⏱️ {chap.duree_minutes || 45} min
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                        {chap.contenu || 'Contenu détaillé de la leçon préparée par l enseignant pour la révision d examen.'}
                      </p>

                      {chap.audio_url && (
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                          <span className="text-base">🎧</span>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-slate-200">Enregistrement Audio de la Leçon</div>
                            <audio controls src={chap.audio_url} className="w-full h-8 mt-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                  Ce cours contient la fiche globale de révision. Consultez directement votre enseignant via le chat pour tout complément.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
