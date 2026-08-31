'use client';

import React, { useState } from 'react';
import {
  useTeacherMe,
  useTeacherChapters,
  useTeacherAssignments,
  useCreateChapter,
  useUpdateChapter,
  useDeleteChapter,
  TeacherChapter,
} from '@/hooks/use-teacher-data';
import { useCreateCourse } from '@/hooks/use-courses';
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  School,
  User,
  Clock,
  Volume2,
  FileDown,
  Layers,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  X,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { TipTapEditor } from '@/components/editor/tiptap-editor';
import { RichTextView } from '@/components/editor/rich-text-view';
import { RoleGuard } from '@/components/layout/role-guard';

export default function TeacherCoursesPage() {
  const { data: me, isLoading: loadingMe } = useTeacherMe();
  const profileId = me?.profileId || null;

  const { data: chaptersData, isLoading: loadingChapters, refetch: refetchChapters } = useTeacherChapters(profileId);
  const { data: assignments, isLoading: loadingAssignments } = useTeacherAssignments(profileId);

  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter();
  const deleteChapterMutation = useDeleteChapter();
  const createCourseMutation = useCreateCourse();

  // State
  const [activeTab, setActiveTab] = useState<'chapters' | 'courses'>('chapters');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [selectedMatiereFilter, setSelectedMatiereFilter] = useState('ALL');

  // Modals
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [previewChapter, setPreviewChapter] = useState<TeacherChapter | null>(null);
  const [editingChapter, setEditingChapter] = useState<TeacherChapter | null>(null);

  // Chapter Form State
  const [chapterCoursId, setChapterCoursId] = useState('');
  const [chapterTitre, setChapterTitre] = useState('');
  const [chapterOrdre, setChapterOrdre] = useState(1);
  const [chapterDuree, setChapterDuree] = useState(30);
  const [chapterContenu, setChapterContenu] = useState('');
  const [chapterAudioUrl, setChapterAudioUrl] = useState('');
  const [chapterPdfUrl, setChapterPdfUrl] = useState('');
  const [chapterFormError, setChapterFormError] = useState<string | null>(null);

  // Course Form State
  const [courseTitre, setCourseTitre] = useState('');
  const [courseClasseId, setCourseClasseId] = useState('');
  const [courseClasseNom, setCourseClasseNom] = useState('');
  const [courseMatiereId, setCourseMatiereId] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseFormError, setCourseFormError] = useState<string | null>(null);

  const coursList = chaptersData?.cours || [];
  const chapitresList = chaptersData?.chapitres || [];

  // Filtered Chapters
  const filteredChapters = chapitresList.filter((ch) => {
    const matchesSearch =
      ch.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.cours?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.cours?.matiere_nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourseFilter === 'ALL' || ch.cours_id === selectedCourseFilter;
    const matchesMatiere =
      selectedMatiereFilter === 'ALL' || ch.cours?.matiere_id === selectedMatiereFilter;

    return matchesSearch && matchesCourse && matchesMatiere;
  });

  // Filtered Courses
  const filteredCourses = coursList.filter((c) => {
    const matchesSearch =
      c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.matiere_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Open Chapter Modal for Create
  const handleOpenCreateChapter = (defaultCoursId?: string) => {
    setEditingChapter(null);
    setChapterCoursId(defaultCoursId || (coursList[0]?.id ?? ''));
    setChapterTitre('');
    setChapterOrdre(chapitresList.length + 1);
    setChapterDuree(30);
    setChapterContenu('');
    setChapterAudioUrl('');
    setChapterPdfUrl('');
    setChapterFormError(null);
    setIsChapterModalOpen(true);
  };

  // Open Chapter Modal for Edit
  const handleOpenEditChapter = (ch: TeacherChapter) => {
    setEditingChapter(ch);
    setChapterCoursId(ch.cours_id);
    setChapterTitre(ch.titre);
    setChapterOrdre(ch.ordre || 1);
    setChapterDuree(ch.duree_minutes || 30);
    setChapterContenu(ch.contenu_html || ch.contenu || '');
    setChapterAudioUrl(ch.audio_url || '');
    setChapterPdfUrl(ch.pdf_url || '');
    setChapterFormError(null);
    setIsChapterModalOpen(true);
  };

  // Handle Save Chapter (Create or Edit)
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setChapterFormError(null);

    if (!chapterCoursId) {
      setChapterFormError('Veuillez sélectionner un cours parent.');
      return;
    }
    if (!chapterTitre.trim()) {
      setChapterFormError('Le titre du chapitre / de la leçon est obligatoire.');
      return;
    }

    try {
      if (editingChapter) {
        await updateChapterMutation.mutateAsync({
          id: editingChapter.id,
          titre: chapterTitre,
          contenu_html: chapterContenu,
          ordre: Number(chapterOrdre),
          duree_minutes: Number(chapterDuree),
          audio_url: chapterAudioUrl.trim() || undefined,
          pdf_url: chapterPdfUrl.trim() || undefined,
        });
      } else {
        await createChapterMutation.mutateAsync({
          cours_id: chapterCoursId,
          titre: chapterTitre,
          contenu_html: chapterContenu,
          contenu: chapterContenu,
          ordre: Number(chapterOrdre),
          duree_minutes: Number(chapterDuree),
          audio_url: chapterAudioUrl.trim() || undefined,
          pdf_url: chapterPdfUrl.trim() || undefined,
          createur_id: profileId || undefined,
          ecole_id: me?.ecole?.id || undefined,
        });
      }

      setIsChapterModalOpen(false);
      refetchChapters();
    } catch (err: any) {
      setChapterFormError(err?.message || 'Erreur lors de l’enregistrement du chapitre.');
    }
  };

  // Handle Delete Chapter
  const handleDeleteChapter = async (id: string) => {
    if (confirm('Êtes-vous certain de vouloir supprimer cette leçon ?')) {
      try {
        await deleteChapterMutation.mutateAsync(id);
        refetchChapters();
      } catch (err: any) {
        alert('Erreur de suppression: ' + err.message);
      }
    }
  };

  // Handle Create Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseFormError(null);

    if (!courseTitre.trim()) {
      setCourseFormError('Veuillez renseigner le titre du cours.');
      return;
    }

    const selectedMatiere = assignments?.matieres.find((m) => m.id === courseMatiereId);
    const selectedClass = assignments?.classes.find((c) => c.id === courseClasseId);

    try {
      await createCourseMutation.mutateAsync({
        titre: courseTitre,
        classe: selectedClass?.nom || courseClasseNom || '6ème Primaire',
        matiere_id: courseMatiereId || undefined,
        matiere_nom: selectedMatiere?.nom || 'Discipline Générale',
        matiere: selectedMatiere?.nom || 'Discipline Générale',
        description: courseDescription,
        ecole_id: me?.ecole?.id || undefined,
      });

      setCourseTitre('');
      setCourseDescription('');
      setIsCourseModalOpen(false);
      refetchChapters();
    } catch (err: any) {
      setCourseFormError(err?.message || 'Erreur lors de la création du cours.');
    }
  };

  return (
    <RoleGuard allowedRoles={['teacher', 'super_admin', 'admin']} moduleName="l'Espace Cours & Chapitres Enseignant">
      <div className="space-y-6">
        {/* 1) Teacher Header (Profil & École) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-xs border border-[#D4AF37]/30 flex-shrink-0">
            <User className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#0F2C59]/10 text-[#0F2C59] uppercase tracking-wider">
                Espace Pédagogique
              </span>
              {me?.teacherMeta?.specialite && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D4AF37] border border-[#D4AF37]/30">
                  Spécialité : {me.teacherMeta.specialite}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-[#0F2C59] mt-1 flex items-center gap-2">
              {loadingMe ? 'Chargement du profil...' : me?.nomComplet || 'Professeur'}
            </h1>
            <div className="flex items-center gap-4 text-xs text-[#64748B] mt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <School className="w-3.5 h-3.5 text-[#0F2C59]" />
                {me?.ecole?.nom || 'Académie du Salut (ADS)'}
              </span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                {coursList.length} Cours actifs
              </span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#008080]" />
                {chapitresList.length} Leçons / Chapitres
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setCourseClasseId(assignments?.classes[0]?.id || '');
              setCourseMatiereId(assignments?.matieres[0]?.id || '');
              setCourseFormError(null);
              setIsCourseModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F2C59] font-bold text-xs rounded-xl border border-[#CBD5E1] transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#0F2C59]" />
            <span>Nouveau Cours</span>
          </button>
          <button
            onClick={() => handleOpenCreateChapter()}
            className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Ajouter une Leçon (Chapitre)</span>
          </button>
        </div>
      </div>

      {/* 2) Navigation Tabs & Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'chapters'
                  ? 'bg-[#0F2C59] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2C59]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mes Chapitres & Leçons ({filteredChapters.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'bg-[#0F2C59] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F2C59]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mes Cours ({filteredCourses.length})</span>
            </button>
          </div>

          <span className="text-xs text-[#94A3B8] font-medium">
            Données en temps réel synchronisées avec Supabase
          </span>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par titre de leçon ou cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
            />
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          </div>

          {activeTab === 'chapters' && (
            <>
              <div>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                >
                  <option value="ALL">Tous les cours parents</option>
                  {coursList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedMatiereFilter}
                  onChange={(e) => setSelectedMatiereFilter(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                >
                  <option value="ALL">Toutes les disciplines</option>
                  {assignments?.matieres.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3) Tab Content: Chapters View */}
      {activeTab === 'chapters' && (
        <div>
          {loadingChapters ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs text-[#64748B]">
              Chargement des chapitres et leçons du professeur...
            </div>
          ) : filteredChapters.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#0F2C59]">Aucune leçon trouvée</h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Vous n'avez pas encore publié de chapitre ou aucun élément ne correspond aux filtres.
              </p>
              <button
                onClick={() => handleOpenCreateChapter()}
                className="mt-2 px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Créer votre première leçon
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChapters.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs transition space-y-3.5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F2C59]/10 text-[#0F2C59]">
                          Ordre #{ch.ordre || ch.position || 1}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D4AF37] border border-[#D4AF37]/30">
                          {ch.cours?.matiere_nom || 'Matière'}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#D4AF37]" />
                        {ch.duree_minutes || 30} min
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-[#0F2C59] text-sm leading-snug">
                      {ch.titre}
                    </h3>

                    {/* Course link */}
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-[#0F2C59]" />
                      <span className="truncate">{ch.cours?.titre || 'Cours Général'}</span>
                      {ch.cours?.classe && (
                        <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                          {ch.cours.classe}
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <p className="text-xs text-[#475569] mt-2.5 line-clamp-2 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#F1F5F9]">
                      {ch.contenu_html || ch.contenu || 'Aucun résumé textuel fourni.'}
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {ch.audio_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#008080] bg-[#CCFBF1] px-2 py-0.5 rounded-md">
                          <Volume2 className="w-3 h-3" /> Audio
                        </span>
                      )}
                      {ch.pdf_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D4AF37] bg-[#FFFBEB] px-2 py-0.5 rounded-md">
                          <FileDown className="w-3 h-3" /> Fiche PDF
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewChapter(ch)}
                        title="Aperçu de la leçon"
                        className="p-1.5 text-[#64748B] hover:text-[#0F2C59] hover:bg-[#F1F5F9] rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditChapter(ch)}
                        title="Modifier la leçon"
                        className="p-1.5 text-[#64748B] hover:text-[#0F2C59] hover:bg-[#F1F5F9] rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(ch.id)}
                        title="Supprimer la leçon"
                        className="p-1.5 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4) Tab Content: Courses View */}
      {activeTab === 'courses' && (
        <div>
          {loadingChapters ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs text-[#64748B]">
              Chargement des cours du professeur...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#0F2C59]">Aucun cours créé</h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Créez un cours pédagogique pour y rattacher des leçons et des chapitres de révision.
              </p>
              <button
                onClick={() => {
                  setCourseClasseId(assignments?.classes[0]?.id || '');
                  setCourseMatiereId(assignments?.matieres[0]?.id || '');
                  setCourseFormError(null);
                  setIsCourseModalOpen(true);
                }}
                className="mt-2 px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Créer un nouveau cours
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map((crs) => (
                <div
                  key={crs.id}
                  className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 shadow-xs transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D4AF37] border border-[#D4AF37]/30">
                        {crs.matiere_nom || 'Discipline'}
                      </span>
                      <span className="text-[10px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
                        {crs.classe || 'Toutes classes'}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#0F2C59] text-sm leading-snug">
                      {crs.titre}
                    </h3>

                    <p className="text-xs text-[#64748B] line-clamp-3">
                      {crs.description || 'Aucune description fournie pour ce cours.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F2C59] flex items-center gap-1.5 text-xs">
                      <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {crs.chapitres_count || 0} Leçons
                    </span>
                    <button
                      onClick={() => handleOpenCreateChapter(crs.id)}
                      className="text-[#008080] hover:underline font-bold text-xs flex items-center gap-1"
                    >
                      + Ajouter leçon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5) Modal: Create / Edit Chapter (Leçon) */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2C59]">
                    {editingChapter ? 'Modifier la Leçon (Chapitre)' : 'Nouvelle Leçon / Chapitre'}
                  </h2>
                  <p className="text-[11px] text-[#64748B]">
                    Affectez la leçon au cours correspondant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F2C59] text-sm p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {chapterFormError && (
              <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{chapterFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveChapter} className="space-y-4">
              {/* Parent Course Selector */}
              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                  Cours Parent Associé *
                </label>
                <select
                  required
                  value={chapterCoursId}
                  onChange={(e) => setChapterCoursId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                >
                  <option value="">-- Sélectionnez le cours parent --</option>
                  {coursList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titre} ({c.matiere_nom || 'Discipline'} - {c.classe || 'Classe'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                  Titre du Chapitre / de la Leçon *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chapitre 1 : Les Équations Différentielles du Premier Ordre"
                  value={chapterTitre}
                  onChange={(e) => setChapterTitre(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              {/* Order & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Ordre de progression (Position)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chapterOrdre}
                    onChange={(e) => setChapterOrdre(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Durée estimée (minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={chapterDuree}
                    onChange={(e) => setChapterDuree(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
              </div>

              {/* Content (Text / HTML via TipTap) */}
              <div>
                <TipTapEditor
                  label="Contenu Pédagogique Enrichi (Texte, Formules & Illustrations) *"
                  value={chapterContenu}
                  onChange={(html) => setChapterContenu(html)}
                  placeholder="Rédigez le cours, insérez des illustrations AVIF via Uploadcare, URLs ou la médiathèque dédiée..."
                  minHeight="220px"
                />
              </div>

              {/* Audio URL & PDF URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Lien Audio / Podcast (Optionnel)
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../cours-audio.mp3"
                    value={chapterAudioUrl}
                    onChange={(e) => setChapterAudioUrl(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Lien Fiche PDF / Support (Optionnel)
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../fiche-recap.pdf"
                    value={chapterPdfUrl}
                    onChange={(e) => setChapterPdfUrl(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F2C59]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createChapterMutation.isPending || updateChapterMutation.isPending}
                  className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {createChapterMutation.isPending || updateChapterMutation.isPending
                      ? 'Enregistrement...'
                      : 'Sauvegarder la Leçon'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6) Modal: Create Course */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2C59]">Nouveau Cours Pédagogique</h2>
                  <p className="text-[11px] text-[#64748B]">Création d'un module d'enseignement</p>
                </div>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F2C59] text-sm p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {courseFormError && (
              <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{courseFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                  Titre Officiel du Cours *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mathématiques & Analyse Numérique"
                  value={courseTitre}
                  onChange={(e) => setCourseTitre(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Classe Cible
                  </label>
                  <select
                    value={courseClasseId}
                    onChange={(e) => setCourseClasseId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  >
                    {assignments?.classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Discipline / Matière
                  </label>
                  <select
                    value={courseMatiereId}
                    onChange={(e) => setCourseMatiereId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  >
                    {assignments?.matieres.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                  Description & Objectifs Pédagogiques
                </label>
                <textarea
                  rows={3}
                  placeholder="Objectifs d'apprentissage, programme officiel et révisions d'examens d'État..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F2C59]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                  className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  {createCourseMutation.isPending ? 'Création...' : 'Créer le Cours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7) Drawer/Modal Preview Chapter */}
      {previewChapter && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F2C59]/10 text-[#0F2C59]">
                  Ordre #{previewChapter.ordre || 1}
                </span>
                <h2 className="text-sm font-bold text-[#0F2C59]">{previewChapter.titre}</h2>
              </div>
              <button
                onClick={() => setPreviewChapter(null)}
                className="text-[#94A3B8] hover:text-[#0F2C59] text-sm p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] text-[#64748B]">
                  <strong>Cours :</strong> {previewChapter.cours?.titre || 'Général'}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  <strong>Matière :</strong> {previewChapter.cours?.matiere_nom || 'Discipline'}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  <strong>Durée :</strong> {previewChapter.duree_minutes || 30} minutes
                </div>
              </div>

              <div className="space-y-1">
                <strong className="text-xs text-[#0F2C59]">Contenu enrichi de la leçon :</strong>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed">
                  <RichTextView
                    content={previewChapter.contenu_html || previewChapter.contenu || ''}
                    fallbackText="Aucun contenu textuel disponible."
                  />
                </div>
              </div>

              {(previewChapter.audio_url || previewChapter.pdf_url) && (
                <div className="space-y-1 pt-2">
                  <strong className="text-xs text-[#0F2C59]">Ressources associées :</strong>
                  <div className="flex flex-col gap-2">
                    {previewChapter.audio_url && (
                      <a
                        href={previewChapter.audio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#008080] hover:underline flex items-center gap-1.5"
                      >
                        <Volume2 className="w-4 h-4" /> Écouter le podcast audio
                      </a>
                    )}
                    {previewChapter.pdf_url && (
                      <a
                        href={previewChapter.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1.5"
                      >
                        <FileDown className="w-4 h-4" /> Télécharger la fiche pédagogique PDF
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#F1F5F9]">
              <button
                onClick={() => setPreviewChapter(null)}
                className="px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
