'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  useQuizzes,
  useQuizAttachments,
  useAttachQuizToLesson,
  useDetachQuizFromLesson,
  QuizItem,
} from '@/hooks/use-quizzes';
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
  HelpCircle,
  Link as LinkIcon,
  ExternalLink,
  Award,
  FileCheck,
} from 'lucide-react';
import { TipTapEditor } from '@/components/editor/tiptap-editor';
import { RichTextView } from '@/components/editor/rich-text-view';
import { RoleGuard } from '@/components/layout/role-guard';
import { stripHtmlTags } from '@/lib/html-utils';

export default function TeacherCoursesPage() {
  const { data: me, isLoading: loadingMe } = useTeacherMe();
  const profileId = me?.profileId || null;

  const { data: chaptersData, isLoading: loadingChapters, refetch: refetchChapters } = useTeacherChapters(profileId);
  const { data: assignments, isLoading: loadingAssignments } = useTeacherAssignments(profileId);

  const createChapterMutation = useCreateChapter();
  const updateChapterMutation = useUpdateChapter();
  const deleteChapterMutation = useDeleteChapter();
  const createCourseMutation = useCreateCourse();

  // Quiz queries and mutations for lesson attachments
  const { data: quizzes } = useQuizzes();
  const { data: quizAttachments } = useQuizAttachments();
  const attachQuizMutation = useAttachQuizToLesson();
  const detachQuizMutation = useDetachQuizFromLesson();

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

  // Attach Quiz Modal State
  const [isAttachQuizModalOpen, setIsAttachQuizModalOpen] = useState(false);
  const [attachingChapter, setAttachingChapter] = useState<TeacherChapter | null>(null);
  const [selectedQuizIdToAttach, setSelectedQuizIdToAttach] = useState('');
  const [previewingQuiz, setPreviewingQuiz] = useState<QuizItem | null>(null);

  // Chapter Form State
  const [chapterCoursId, setChapterCoursId] = useState('');
  const [chapterTitre, setChapterTitre] = useState('');
  const [chapterOrdre, setChapterOrdre] = useState(1);
  const [chapterDuree, setChapterDuree] = useState(30);
  const [chapterContenu, setChapterContenu] = useState('');
  const [chapterAudioUrl, setChapterAudioUrl] = useState('');
  const [chapterPdfUrl, setChapterPdfUrl] = useState('');
  const [chapterQuizId, setChapterQuizId] = useState('');
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
    setChapterQuizId('');
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
    const currentAttachedQuiz = quizAttachments?.[ch.id]?.quiz_id || '';
    setChapterQuizId(currentAttachedQuiz);
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
      let savedChapterId = '';
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
        savedChapterId = editingChapter.id;
      } else {
        const created = await createChapterMutation.mutateAsync({
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
        savedChapterId = created?.id || `ch-${Date.now()}`;
      }

      // Synchroniser le quiz rattaché
      if (chapterQuizId && savedChapterId) {
        const chosenQuiz = quizzes?.find((q) => q.id === chapterQuizId);
        await attachQuizMutation.mutateAsync({
          quiz_id: chapterQuizId,
          quiz_titre: chosenQuiz?.titre || 'Évaluation',
          chapitre_id: savedChapterId,
          chapitre_titre: chapterTitre,
          cours_id: chapterCoursId,
          cours_titre: coursList.find((c) => c.id === chapterCoursId)?.titre,
        });
      } else if (editingChapter && quizAttachments?.[editingChapter.id] && !chapterQuizId) {
        await detachQuizMutation.mutateAsync({
          chapitre_id: editingChapter.id,
          quiz_id: quizAttachments[editingChapter.id].quiz_id,
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
                    <p className="text-xs text-[#475569] mt-2.5 line-clamp-2 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#F1F5F9] leading-relaxed">
                      {stripHtmlTags(ch.contenu_html || ch.contenu) || 'Aucun résumé textuel fourni.'}
                    </p>

                    {/* Quiz Attachment Status Banner */}
                    <div className="mt-3">
                      {(() => {
                        const attachedQuizInfo = quizAttachments?.[ch.id];
                        const attachedQuiz = (quizzes || []).find(
                          (q) => q.id === attachedQuizInfo?.quiz_id || q.chapitre_id === ch.id
                        );

                        if (attachedQuiz) {
                          return (
                            <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] flex-shrink-0">
                                  <HelpCircle className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">Quiz rattaché</span>
                                    <span className="text-[10px] font-semibold text-[#16A34A] bg-white px-1.5 py-0.2 rounded border border-[#86EFAC]">10 Questions</span>
                                  </div>
                                  <span className="text-xs font-bold text-[#0F2C59] truncate block mt-0.5">
                                    {attachedQuiz.titre}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewingQuiz(attachedQuiz)}
                                  className="px-2 py-1 text-[#0F2C59] hover:bg-white rounded-lg text-[10px] font-bold border border-[#CBD5E1] cursor-pointer"
                                  title="Aperçu des questions du quiz"
                                >
                                  Aperçu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAttachingChapter(ch);
                                    setSelectedQuizIdToAttach(attachedQuiz.id);
                                    setIsAttachQuizModalOpen(true);
                                  }}
                                  className="px-2 py-1 text-[#15803D] hover:bg-white rounded-lg text-[10px] font-bold border border-[#86EFAC] cursor-pointer"
                                  title="Changer de quiz rattaché"
                                >
                                  Changer
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Délier ce quiz de la leçon ?')) {
                                      await detachQuizMutation.mutateAsync({ chapitre_id: ch.id, quiz_id: attachedQuiz.id });
                                    }
                                  }}
                                  className="px-1.5 py-1 text-[#DC2626] hover:bg-white rounded-lg text-[10px] font-bold border border-[#FECACA] cursor-pointer"
                                  title="Délier ce quiz"
                                >
                                  Délier
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-[#92400E]">
                              <AlertCircle className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                              <span className="text-[11px] font-medium">Aucun quiz rattaché</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setAttachingChapter(ch);
                                  setSelectedQuizIdToAttach(quizzes?.[0]?.id || '');
                                  setIsAttachQuizModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-[#F8FAFC] text-[#0F2C59] border border-[#CBD5E1] rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3 text-[#D4AF37]" />
                                <span>Lier un Quiz</span>
                              </button>
                              <Link
                                href={`/teacher/quizzes/new?coursId=${ch.cours_id}&chapitreId=${ch.id}`}
                                className="px-2 py-1 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-lg text-[10px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Créer un nouveau quiz spécifique pour cette leçon"
                              >
                                <span>+ Créer Quiz</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
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

                    <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                      {stripHtmlTags(crs.description) || 'Aucune description fournie pour ce cours.'}
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

              {/* Quiz d'évaluation rattaché */}
              <div className="bg-[#FFFBEB] border border-[#D4AF37]/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0F2C59] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Quiz d'Évaluation Standardisé (10 Questions QCM)</span>
                  </label>
                  {chapterCoursId && (
                    <Link
                      href={`/teacher/quizzes/new?coursId=${chapterCoursId}`}
                      target="_blank"
                      className="text-[11px] font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-[#D4AF37]" />
                      <span>Créer un nouveau quiz</span>
                    </Link>
                  )}
                </div>
                <select
                  value={chapterQuizId}
                  onChange={(e) => setChapterQuizId(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                >
                  <option value="">-- Aucun quiz rattaché (ou lier plus tard) --</option>
                  {(quizzes || []).map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.titre} ({q.matiere_nom || q.classe || 'Général'} - {q.total_questions || 10} Qs)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#64748B]">
                  Lier un quiz permet aux élèves de tester leurs acquis immédiatement après avoir lu la leçon.
                </p>
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

      {/* 8) Modal: Attach / Link Quiz to Chapter */}
      {isAttachQuizModalOpen && attachingChapter && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2C59]">
                    Rattacher un Quiz (10 Questions)
                  </h2>
                  <p className="text-[11px] text-[#64748B] truncate max-w-xs">
                    Leçon : {attachingChapter.titre}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAttachQuizModalOpen(false);
                  setAttachingChapter(null);
                }}
                className="text-[#94A3B8] hover:text-[#0F2C59] text-sm p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] text-[#64748B]">
                  <strong>Cours parent :</strong> {attachingChapter.cours?.titre || 'Cours Général'}
                </div>
                <div className="text-[11px] text-[#64748B]">
                  <strong>Discipline :</strong> {attachingChapter.cours?.matiere_nom || 'Discipline'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1.5">
                  Sélectionnez le quiz d'évaluation à associer :
                </label>
                {(!quizzes || quizzes.length === 0) ? (
                  <div className="bg-[#FFFBEB] p-3 rounded-xl border border-[#D4AF37]/30 text-[#92400E] text-xs space-y-2">
                    <p>Aucun quiz n'a encore été créé dans l'espace enseignant.</p>
                    <Link
                      href={`/teacher/quizzes/new?coursId=${attachingChapter.cours_id}&chapitreId=${attachingChapter.id}`}
                      className="inline-block px-3 py-1.5 bg-[#0F2C59] text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      + Créer un nouveau quiz (10 Questions)
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedQuizIdToAttach}
                    onChange={(e) => setSelectedQuizIdToAttach(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
                  >
                    <option value="">-- Choisir une évaluation standardisée --</option>
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.titre} ({q.matiere_nom || q.classe || 'Standard'} • {q.total_questions || 10} Qs)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedQuizIdToAttach && (
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-3 rounded-xl space-y-1 text-xs">
                  {(() => {
                    const sel = quizzes?.find((q) => q.id === selectedQuizIdToAttach);
                    if (!sel) return null;
                    return (
                      <>
                        <div className="font-bold text-[#166534] flex items-center justify-between">
                          <span>{sel.titre}</span>
                          <span className="text-[10px] bg-white border border-[#86EFAC] px-2 py-0.5 rounded text-[#15803D]">
                            {sel.niveau} • {sel.classe}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#166534]">
                          {sel.total_questions || 10} questions QCM • Durée : {sel.duree_minutes} minutes
                        </p>
                        <button
                          type="button"
                          onClick={() => setPreviewingQuiz(sel)}
                          className="mt-1.5 text-[11px] font-bold text-[#0F2C59] underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Prévisualiser les 10 questions de ce quiz</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/teacher/quizzes/new?coursId=${attachingChapter.cours_id}&chapitreId=${attachingChapter.id}`}
                  className="text-[11px] font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Créer un nouveau quiz dédié</span>
                </Link>

                {quizAttachments?.[attachingChapter.id] && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Voulez-vous détacher ce quiz de la leçon ?')) {
                        await detachQuizMutation.mutateAsync({
                          chapitre_id: attachingChapter.id,
                          quiz_id: quizAttachments[attachingChapter.id].quiz_id,
                        });
                        setIsAttachQuizModalOpen(false);
                        setAttachingChapter(null);
                      }
                    }}
                    className="text-[11px] text-[#DC2626] hover:underline font-bold cursor-pointer"
                  >
                    Délier le quiz actuel
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => {
                  setIsAttachQuizModalOpen(false);
                  setAttachingChapter(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F2C59]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!selectedQuizIdToAttach || attachQuizMutation.isPending}
                onClick={async () => {
                  if (!selectedQuizIdToAttach) return;
                  const chosenQuiz = quizzes?.find((q) => q.id === selectedQuizIdToAttach);
                  await attachQuizMutation.mutateAsync({
                    quiz_id: selectedQuizIdToAttach,
                    quiz_titre: chosenQuiz?.titre || 'Évaluation',
                    chapitre_id: attachingChapter.id,
                    chapitre_titre: attachingChapter.titre,
                    cours_id: attachingChapter.cours_id,
                    cours_titre: attachingChapter.cours?.titre,
                  });
                  setIsAttachQuizModalOpen(false);
                  setAttachingChapter(null);
                }}
                className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>{attachQuizMutation.isPending ? 'Enregistrement...' : 'Enregistrer le rattachement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9) Modal: Preview Quiz Questions & Explanations */}
      {previewingQuiz && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F2C59]">{previewingQuiz.titre}</h2>
                  <p className="text-[11px] text-[#64748B]">
                    {previewingQuiz.niveau} • {previewingQuiz.classe} • {previewingQuiz.duree_minutes} min • {previewingQuiz.total_questions || 10} Questions QCM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingQuiz(null)}
                className="text-[#94A3B8] hover:text-[#0F2C59] text-sm p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {(previewingQuiz.questions || []).map((q, idx) => (
                <div key={q.id || idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F2C59]">Question #{q.numOrder || idx + 1}</span>
                    <span className="text-[10px] bg-[#0F2C59]/10 text-[#0F2C59] font-bold px-2 py-0.5 rounded">
                      {q.points || 1} Point
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#1E293B]">
                    <RichTextView content={q.question} fallbackText="Énoncé manquant." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const optText = q[`option${opt}` as keyof typeof q] as string;
                      const isCorrect = q.correctOption === opt;
                      return (
                        <div
                          key={opt}
                          className={`p-2 rounded-lg text-xs border ${
                            isCorrect
                              ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534] font-bold'
                              : 'bg-white border-[#E2E8F0] text-[#475569]'
                          }`}
                        >
                          <span className="mr-1.5">{opt})</span> {optText || '—'} {isCorrect && '✓ (Correct)'}
                        </div>
                      );
                    })}
                  </div>

                  {q.explication && (
                    <div className="text-[11px] text-[#475569] bg-white p-3 rounded-lg border border-[#F1F5F9] mt-2 space-y-1">
                      <strong className="text-[#0F2C59] block">Corrigé explicatif :</strong>
                      <RichTextView content={q.explication} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setPreviewingQuiz(null)}
                className="px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-xs"
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
