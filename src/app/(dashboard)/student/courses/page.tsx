'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCourses } from '@/hooks/use-courses';
import {
  BookOpen,
  Sparkles,
  Play,
  FileDown,
  Volume2,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  Search,
} from 'lucide-react';

export default function StudentCoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredCourses = (courses || []).filter((c) => {
    const matchSearch =
      c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.matiere_nom || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête Élève */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Mon Espace Classe (E-RDC)
            </span>
            <span className="text-[10px] font-bold text-[#7E22CE] bg-[#FAF5FF] px-2 py-0.5 rounded-md">
              4ème Humanités Math-Physique & STEM
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Mes Cours & Leçons Interactives
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            Accédez à vos leçons, podcasts audio explicatifs et fiches de synthèse PDF pour réviser et préparer vos examens.
          </p>
        </div>

        <Link
          href="/student/quizzes"
          className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 self-start md:self-center"
        >
          <span>S'entraîner aux Quiz (10 Qs)</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37]" />
        </Link>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          placeholder="Rechercher un cours, une matière (Maths, Physique, Chimie...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none text-[#1E293B]"
        />
      </div>

      {/* Grille des Cours Élève */}
      {isLoading ? (
        <div className="p-12 text-center text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0] text-xs">
          Chargement de votre programme scolaire...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#EFF6FF] text-[#0F2C59] border border-[#0F2C59]/10 uppercase">
                    {c.matiere_nom || 'Discipline STEM'}
                  </span>
                  <span className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {c.chapitres_count || c.chapitres?.length || 0} Chapitres
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[#0F2C59] mt-3 group-hover:text-[#D4AF37] transition-colors">
                  {c.titre}
                </h3>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                  {c.description || 'Module d’apprentissage conforme au programme national d’enseignement de la RDC.'}
                </p>

                {/* Chapitres Aperçu */}
                {c.chapitres && c.chapitres.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                      Leçons incluses :
                    </span>
                    <div className="space-y-1">
                      {c.chapitres.slice(0, 2).map((ch, idx) => (
                        <div
                          key={ch.id || idx}
                          className="text-[11px] text-[#475569] bg-[#F8FAFC] p-2 rounded-lg flex items-center justify-between border border-[#F1F5F9]"
                        >
                          <span className="truncate font-medium">
                            {idx + 1}. {ch.titre}
                          </span>
                          <div className="flex items-center gap-1 text-[#64748B]">
                            {ch.audio_url && <Volume2 className="w-3 h-3 text-[#7E22CE]" />}
                            {ch.pdf_url && <FileDown className="w-3 h-3 text-[#1D4ED8]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~45 min
                </span>
                <Link
                  href="/student/courses"
                  className="px-3 py-1.5 rounded-xl bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 text-xs font-bold transition flex items-center gap-1"
                >
                  <Play className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>Étudier</span>
                </Link>
              </div>
            </div>
          ))}

          {filteredCourses.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center text-[#64748B] rounded-2xl border border-[#E2E8F0]">
              Aucun cours correspondant trouvé.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
