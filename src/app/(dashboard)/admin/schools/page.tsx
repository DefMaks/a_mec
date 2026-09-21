"use client";

import React, { useState } from 'react';
import { useSchools, useCreateSchool } from '@/hooks/use-schools';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import {
  useAllClasses,
  useCreateAdminClass,
  useCourseAssignments,
  useAssignCourseToClass,
  useUnassignCourseFromClass,
  useBulkAssignCourses,
  useBulkUnassignCourses,
  useAssignTeacherToPromotionCourses,
  useUpdateClassTitulaire,
  LEARNING_DOMAINS,
  LearningDomain,
} from '@/hooks/use-course-assignments';
import { useCourses, useCreateCourse } from '@/hooks/use-courses';
import { useTeachers, useAssignTeacherClasses, TeacherItem } from '@/hooks/use-teachers';
import { RoleGuard } from '@/components/layout/role-guard';
import {
  Building2,
  Plus,
  Sparkles,
  CheckCircle2,
  X,
  BookOpen,
  GraduationCap,
  Layers,
  Users,
  Search,
  Check,
  CheckCircle,
  Award,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldCheck,
  Phone,
  Mail,
  Edit3,
  ArrowRight,
  UserPlus,
  Info,
  BookMarked,
} from 'lucide-react';

export default function AdminSchoolsPage() {
  const { data: schools } = useSchools();
  const createSchoolMutation = useCreateSchool();

  const { data: classes, isLoading: loadingClasses } = useAllClasses();
  const createClassMutation = useCreateAdminClass();
  const updateTitulaireMutation = useUpdateClassTitulaire();

  const { data: teachers, isLoading: loadingTeachers } = useTeachers();
  const assignTeacherClassesMutation = useAssignTeacherClasses();
  const assignTeacherToCoursesMutation = useAssignTeacherToPromotionCourses();

  const { data: courses } = useCourses();
  const createCourseMutation = useCreateCourse();

  const [activeTab, setActiveTab] = useState<'teacher-assignments' | 'assignments' | 'classes' | 'schools'>(
    'teacher-assignments'
  );
  const [selectedClasseId, setSelectedClasseId] = useState<string>('');

  const { data: assignments } = useCourseAssignments();
  const assignMutation = useAssignCourseToClass();
  const unassignMutation = useUnassignCourseFromClass();
  const bulkAssignMutation = useBulkAssignCourses();
  const bulkUnassignMutation = useBulkUnassignCourses();

  // --- Modals State ---
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Modal: Assign Teacher to Promotions & Titulariat
  const [promotionModalTeacher, setPromotionModalTeacher] = useState<TeacherItem | null>(null);
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<string[]>([]);
  const [selectedTitulairePromotionIds, setSelectedTitulairePromotionIds] = useState<string[]>([]);

  // Modal: Assign Teacher to Courses for their assigned promotions
  const [coursesModalTeacher, setCoursesModalTeacher] = useState<TeacherItem | null>(null);
  const [activePromotionInCourseModal, setActivePromotionInCourseModal] = useState<string>('');
  const [selectedCourseIdsForTeacher, setSelectedCourseIdsForTeacher] = useState<string[]>([]);

  // Modal: Quick Set Class Titulaire
  const [titulaireModalClass, setTitulaireModalClass] = useState<any | null>(null);
  const [selectedTitulaireTeacherId, setSelectedTitulaireTeacherId] = useState<string>('');

  // --- Search & Filter States ---
  const [teacherSearch, setTeacherSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [collapsedDomains, setCollapsedDomains] = useState<Record<string, boolean>>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Forms
  const [schoolNom, setSchoolNom] = useState('');
  const [schoolRccm, setSchoolRccm] = useState('');
  const [schoolIdNat, setSchoolIdNat] = useState('');

  const [classNom, setClassNom] = useState('');
  const [classTitulaireId, setClassTitulaireId] = useState('');

  const [courseTitre, setCourseTitre] = useState('');
  const [courseMatiereNom, setCourseMatiereNom] = useState('Mathématiques');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseTargetClasses, setCourseTargetClasses] = useState<string[]>([]);

  // Helpers for selected promotion in Tab 2
  const currentSelectedClassId = selectedClasseId || (classes && classes[0]?.id) || '730145b3-b30f-4aff-b0ab-c7550849d5fe';
  const selectedClasse = (classes || []).find((c) => c.id === currentSelectedClassId) || classes?.[0];
  const activeAssignmentsForClass = (assignments || []).filter(
    (a) => a.classe_id === currentSelectedClassId && a.est_actif !== false
  );

  const totalPossibleCourses = courses ? courses.length : 0;
  const assignedRatio = activeAssignmentsForClass.length;
  const coveragePercent = Math.round((assignedRatio / Math.max(totalPossibleCourses, 1)) * 100);

  const titulaireTeacher = (teachers || []).find((t) => t.id === selectedClasse?.titulaire_id);
  const titulaireNom = titulaireTeacher?.nom_complet || 'Non désigné';

  // --- Handlers: Modal Promotions & Titulariat ---
  const handleOpenPromotionModal = (teacher: TeacherItem) => {
    setPromotionModalTeacher(teacher);
    setSelectedPromotionIds([...(teacher.assigned_class_ids || [])]);
    setSelectedTitulairePromotionIds([...(teacher.titulaire_class_ids || [])]);
  };

  const handleSavePromotionAssignments = async () => {
    if (!promotionModalTeacher) return;

    try {
      await assignTeacherClassesMutation.mutateAsync({
        teacherId: promotionModalTeacher.id,
        assignedClassIds: selectedPromotionIds,
        titulaireClassIds: selectedTitulairePromotionIds,
      });

      const teacherNom = promotionModalTeacher.nom_complet;
      setPromotionModalTeacher(null);
      setSaveSuccessMessage(`Promotions et statut titulaire enregistrés avec succès pour ${teacherNom} !`);
      setTimeout(() => setSaveSuccessMessage(null), 4500);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement des promotions:", err);
    }
  };

  // --- Handlers: Modal Teacher to Courses ---
  const handleOpenCoursesModal = (teacher: TeacherItem, initialClassId?: string) => {
    setCoursesModalTeacher(teacher);
    const assignedIds = teacher.assigned_class_ids || [];
    let targetClassId = initialClassId && (classes || []).some((c) => c.id === initialClassId)
      ? initialClassId
      : (assignedIds[0] || (classes && classes[0]?.id) || '');

    setActivePromotionInCourseModal(targetClassId);

    // Collect all course IDs where this teacher is assigned in targetClassId
    if (targetClassId) {
      const teacherCourseIds = (assignments || [])
        .filter((a) => a.classe_id === targetClassId && a.enseignant_id === teacher.id && a.est_actif !== false)
        .map((a) => a.cours_id);
      setSelectedCourseIdsForTeacher(teacherCourseIds);
    } else {
      setSelectedCourseIdsForTeacher([]);
    }
  };

  const handleChangeActivePromotionInCourseModal = (classId: string) => {
    if (!coursesModalTeacher) return;
    setActivePromotionInCourseModal(classId);

    const teacherCourseIds = (assignments || [])
      .filter((a) => a.classe_id === classId && a.enseignant_id === coursesModalTeacher.id && a.est_actif !== false)
      .map((a) => a.cours_id);
    setSelectedCourseIdsForTeacher(teacherCourseIds);
  };

  const handleToggleCourseForTeacher = (courseId: string) => {
    if (selectedCourseIdsForTeacher.includes(courseId)) {
      setSelectedCourseIdsForTeacher(selectedCourseIdsForTeacher.filter((id) => id !== courseId));
    } else {
      setSelectedCourseIdsForTeacher([...selectedCourseIdsForTeacher, courseId]);
    }
  };

  const handleSaveTeacherCourses = async () => {
    if (!coursesModalTeacher || !activePromotionInCourseModal) return;

    try {
      // Find previously assigned courses for this teacher in this class to know unassigned ones
      const previousTeacherCourseIds = (assignments || [])
        .filter(
          (a) =>
            a.classe_id === activePromotionInCourseModal &&
            a.enseignant_id === coursesModalTeacher.id &&
            a.est_actif !== false
        )
        .map((a) => a.cours_id);

      const unassigned = previousTeacherCourseIds.filter((id) => !selectedCourseIdsForTeacher.includes(id));

      await assignTeacherToCoursesMutation.mutateAsync({
        teacherId: coursesModalTeacher.id,
        classId: activePromotionInCourseModal,
        assignedCourseIds: selectedCourseIdsForTeacher,
        unassignedCourseIds: unassigned,
      });

      const teacherNom = coursesModalTeacher.nom_complet;
      const targetClassName = (classes || []).find((c) => c.id === activePromotionInCourseModal)?.nom || 'la promotion';
      setCoursesModalTeacher(null);
      setSaveSuccessMessage(`Assignation des cours validée pour ${teacherNom} en ${targetClassName} (${selectedCourseIdsForTeacher.length} cours affectés) !`);
      setTimeout(() => setSaveSuccessMessage(null), 4500);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement des cours:", err);
    }
  };

  // --- Handlers: Modal Quick Class Titulaire ---
  const handleOpenTitulaireModal = (cl: any) => {
    setTitulaireModalClass(cl);
    setSelectedTitulaireTeacherId(cl.titulaire_id || '');
  };

  const handleSaveClassTitulaire = async () => {
    if (!titulaireModalClass) return;

    try {
      await updateTitulaireMutation.mutateAsync({
        classId: titulaireModalClass.id,
        titulaireId: selectedTitulaireTeacherId || null,
      });

      const className = titulaireModalClass.nom;
      setTitulaireModalClass(null);
      setSaveSuccessMessage(`Enseignant titulaire mis à jour pour ${className} !`);
      setTimeout(() => setSaveSuccessMessage(null), 4500);
    } catch (err) {
      console.error("Erreur lors de l'attribution du titulaire:", err);
    }
  };

  // --- General Form Submissions ---
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolNom.trim()) return;

    await createSchoolMutation.mutateAsync({
      nom: schoolNom,
      rccm: schoolRccm || undefined,
      id_nat: schoolIdNat || undefined,
    });

    setSchoolNom('');
    setSchoolRccm('');
    setSchoolIdNat('');
    setIsSchoolModalOpen(false);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNom.trim()) return;

    const adminSchoolId = DEFAULT_SCHOOL_ID || (schools && schools[0]?.id) || '64c583de-e9e2-456b-8942-164656544661';

    const newCl = await createClassMutation.mutateAsync({
      nom: classNom,
      titulaire_id: classTitulaireId || undefined,
      ecole_id: adminSchoolId,
    });

    setClassNom('');
    setClassTitulaireId('');
    setIsClassModalOpen(false);
    if (newCl?.id) {
      setSelectedClasseId(newCl.id);
      setActiveTab('classes');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitre.trim()) return;

    const adminSchoolId = DEFAULT_SCHOOL_ID || (schools && schools[0]?.id) || '64c583de-e9e2-456b-8942-164656544661';

    await createCourseMutation.mutateAsync({
      titre: courseTitre,
      description: courseDescription,
      matiere: courseMatiereNom,
      matiere_nom: courseMatiereNom,
      target_classe_ids: courseTargetClasses,
      enseignant_id: undefined,
      ecole_id: adminSchoolId,
    });

    setCourseTitre('');
    setCourseDescription('');
    setIsCourseModalOpen(false);
  };

  // Toggle single course assignment in tab 2
  const handleToggleAssignment = async (courseId: string) => {
    const isAssigned = (assignments || []).some(
      (a) => a.cours_id === courseId && a.classe_id === currentSelectedClassId && a.est_actif !== false
    );

    if (isAssigned) {
      await unassignMutation.mutateAsync({ cours_id: courseId, classe_id: currentSelectedClassId });
    } else {
      await assignMutation.mutateAsync({
        cours_id: courseId,
        classe_id: currentSelectedClassId,
        enseignant_id: selectedClasse?.titulaire_id || undefined,
      });
    }
  };

  // Change individual course teacher from dropdown
  const handleChangeCourseTeacher = async (courseId: string, teacherId: string) => {
    await assignMutation.mutateAsync({
      cours_id: courseId,
      classe_id: currentSelectedClassId,
      enseignant_id: teacherId || null,
    });
  };

  const handleAssignAllStandardProgram = async () => {
    const allIds = courses ? courses.map((c) => c.id) : [];
    await bulkAssignMutation.mutateAsync({
      cours_ids: allIds,
      classe_id: currentSelectedClassId,
      enseignant_id: selectedClasse?.titulaire_id || undefined,
    });
  };

  const handleToggleDomainBulk = async (domain: LearningDomain, assignAll: boolean) => {
    if (assignAll) {
      await bulkAssignMutation.mutateAsync({
        cours_ids: domain.courseIds,
        classe_id: currentSelectedClassId,
        enseignant_id: selectedClasse?.titulaire_id || undefined,
      });
    } else {
      await bulkUnassignMutation.mutateAsync({
        cours_ids: domain.courseIds,
        classe_id: currentSelectedClassId,
      });
    }
  };

  const toggleDomainCollapse = (domainId: string) => {
    setCollapsedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  // Filter teachers for Tab 1
  const filteredTeachers = (teachers || []).filter((t) => {
    if (!teacherSearch.trim()) return true;
    const q = teacherSearch.toLowerCase();
    return (
      t.nom_complet.toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.telephone || '').toLowerCase().includes(q) ||
      t.assigned_classes.some((c) => c.nom.toLowerCase().includes(q))
    );
  });

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} moduleName="la gestion des Classes, Écoles & Assignations">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Bannière de confirmation de sauvegarde */}
        {saveSuccessMessage && (
          <div className="bg-[#ECFDF5] border border-[#10B981]/30 text-[#065F46] p-4 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              <span className="text-xs font-bold">{saveSuccessMessage}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMessage(null)}
              className="p-1 text-[#065F46] hover:bg-[#D1FAE5] rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* En-tête Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#0F2C59] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#CBD5E1]">
                Pôle Pédagogique & Direction Scolaire
              </span>
              <span className="text-[10px] font-bold text-[#008080] bg-[#E6F4F4] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#008080]/30">
                Année Scolaire 2025 - 2026
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5 flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
              <span>Assignations des Professeurs & Structure Scolaire</span>
            </h1>
            <p className="text-[#64748B] text-xs mt-0.5 max-w-2xl">
              Affectez les professeurs à leurs promotions (classes), désignez les titulaires et assignez les cours pédagogiques spécifiques par promotion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Nouvelle Promotion</span>
            </button>
            <button
              onClick={() => setIsCourseModalOpen(true)}
              className="px-4 py-2.5 bg-[#008080] hover:bg-[#008080]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
            >
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <span>Nouveau Cours</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] bg-white p-1.5 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab('teacher-assignments')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'teacher-assignments'
                ? 'bg-[#0F2C59] text-white shadow-xs'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Assignations des Professeurs ({teachers?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'bg-[#0F2C59] text-white shadow-xs'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span>Affectation des Cours ({activeAssignmentsForClass.length} affectés)</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'classes'
                ? 'bg-[#0F2C59] text-white shadow-xs'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
            <span>Promotions & Titulaires ({classes?.length || 1})</span>
          </button>

          <button
            onClick={() => setActiveTab('schools')}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'schools'
                ? 'bg-[#0F2C59] text-white shadow-xs'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Établissements ({schools?.length || 1})</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ASSIGNATIONS DES PROFESSEURS (PROMOTIONS, TITULARIAT, COURS) */}
        {/* ============================================================ */}
        {activeTab === 'teacher-assignments' && (
          <div className="space-y-6">
            {/* Guide & Quick Stats Card */}
            <div className="bg-linear-to-r from-[#0F2C59] to-[#0A2042] text-white p-6 rounded-2xl border border-[#0F2C59] shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded">
                    Module d'Assignation Pédagogique
                  </span>
                  <h2 className="text-xl font-extrabold mt-1">
                    Gouvernance des Enseignants, Promotions & Cours
                  </h2>
                  <p className="text-xs text-[#CBD5E1] mt-1 max-w-2xl">
                    Configurez en 3 étapes : 1) Affectez l'enseignant à ses promotions • 2) Définissez s'il est Titulaire de la promotion • 3) Assignez-lui les cours qu'il dispense dans ses promotions.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                  <div className="text-center px-2">
                    <div className="text-lg font-black text-[#D4AF37]">{teachers?.length || 0}</div>
                    <div className="text-[10px] text-[#94A3B8] uppercase">Professeurs</div>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-center px-2">
                    <div className="text-lg font-black text-white">{classes?.length || 0}</div>
                    <div className="text-[10px] text-[#94A3B8] uppercase">Promotions</div>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-center px-2">
                    <div className="text-lg font-black text-[#86EFAC]">{assignments?.length || 0}</div>
                    <div className="text-[10px] text-[#94A3B8] uppercase">Cours Actifs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Rechercher un professeur ou une classe..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#008080] shadow-2xs"
                />
              </div>

              <div className="text-xs text-[#64748B]">
                {filteredTeachers.length} enseignant(s) répertorié(s)
              </div>
            </div>

            {/* Table des Professeurs et de leurs Assignations */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Enseignant & Contact</th>
                      <th className="px-6 py-4">Promotions Assignées</th>
                      <th className="px-6 py-4">Titulariat (Direction)</th>
                      <th className="px-6 py-4">Cours Assignés dans ses Promotions</th>
                      <th className="px-6 py-4 text-right">Actions d'Assignation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                    {filteredTeachers.map((teacher) => {
                      const assignedClasses = teacher.assigned_classes || [];
                      const titulaireClasses = assignedClasses.filter((c) => c.is_titulaire);

                      // Calculate all courses assigned to this teacher across their assigned promotions
                      const teacherAssignedCourses = (assignments || []).filter(
                        (a) => a.enseignant_id === teacher.id && a.est_actif !== false
                      );

                      return (
                        <tr key={teacher.id} className="hover:bg-[#F8FAFC] transition-colors">
                          {/* Teacher Name & Contact */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#0F2C59] text-[#D4AF37] font-bold flex items-center justify-center text-sm shadow-2xs border border-[#D4AF37]/30">
                                {teacher.nom_complet.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-sm text-[#0F2C59] flex items-center gap-1.5">
                                  <span>{teacher.nom_complet}</span>
                                  {teacher.role === 'super_admin' && (
                                    <span className="text-[9px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded font-bold">
                                      Super Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-[#94A3B8]" />
                                    <span>{teacher.email || '—'}</span>
                                  </span>
                                  {teacher.telephone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-[#94A3B8]" />
                                      <span>{teacher.telephone}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Promotions Assignées */}
                          <td className="px-6 py-4">
                            {assignedClasses.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                                {assignedClasses.map((cls) => (
                                  <span
                                    key={cls.id}
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                      cls.is_titulaire
                                        ? 'bg-[#E6F4F4] text-[#008080] border-[#008080]/30'
                                        : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                                    }`}
                                  >
                                    <GraduationCap className="w-3 h-3" />
                                    <span>{cls.nom}</span>
                                    {cls.is_titulaire && <span className="text-[#D4AF37] font-extrabold text-[10px]">★</span>}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#94A3B8] italic">
                                Aucune promotion assignée
                              </span>
                            )}
                          </td>

                          {/* Titulariat */}
                          <td className="px-6 py-4">
                            {titulaireClasses.length > 0 ? (
                              <div className="space-y-1">
                                {titulaireClasses.map((tc) => (
                                  <span
                                    key={tc.id}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full border border-[#F59E0B]/30"
                                  >
                                    <Award className="w-3 h-3 text-[#D4AF37]" />
                                    <span>Titulaire • {tc.nom}</span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#64748B]">Intervenant / Non titulaire</span>
                            )}
                          </td>

                          {/* Cours Assignés par rapport aux promotions */}
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-extrabold text-sm text-[#0F2C59]">
                                {teacherAssignedCourses.length} cours
                              </span>
                              <div className="text-[10px] text-[#64748B] mt-0.5">
                                {assignedClasses.length > 0 ? (
                                  <span>Répartis sur {assignedClasses.length} promotion(s)</span>
                                ) : (
                                  <span className="text-[#EF4444]">Assignez d'abord une promotion</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Action 1 & 2: Assigner Promotions & Titulariat */}
                              <button
                                onClick={() => handleOpenPromotionModal(teacher)}
                                className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F2C59] rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[#CBD5E1]"
                              >
                                <GraduationCap className="w-3.5 h-3.5 text-[#008080]" />
                                <span>Promotions & Titulariat</span>
                              </button>

                              {/* Action 3: Assigner aux Cours des Promotions */}
                              <button
                                onClick={() => handleOpenCoursesModal(teacher)}
                                title="Assigner à des cours dans ses promotions"
                                className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs bg-[#008080] hover:bg-[#008080]/90 text-white cursor-pointer"
                              >
                                <BookMarked className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>Assigner Cours</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredTeachers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-[#64748B]">
                          Aucun professeur trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: AFFECTATION DES COURS (PAR PROMOTION ET ENSEIGNANT) */}
        {/* ============================================================ */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Class Switcher & Quick Action Banner */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold text-xl border border-[#D4AF37]/30 shadow-2xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                        Promotion Sélectionnée :
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <select
                        value={currentSelectedClassId}
                        onChange={(e) => setSelectedClasseId(e.target.value)}
                        className="text-base font-extrabold text-[#0F2C59] bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#008080] cursor-pointer"
                      >
                        {(classes || []).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nom || 'Classe Pédagogique'}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleOpenTitulaireModal(selectedClasse)}
                        className="text-xs text-[#008080] font-semibold bg-[#F0FDFA] hover:bg-[#CCFBF1] px-2.5 py-1 rounded-lg border border-[#CCFBF1] transition flex items-center gap-1.5"
                      >
                        <span>Titulaire : <strong>{titulaireNom}</strong></span>
                        <Edit3 className="w-3 h-3 text-[#008080]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAssignAllStandardProgram}
                    disabled={bulkAssignMutation.isPending}
                    className="px-4 py-2.5 bg-[#008080] hover:bg-[#008080]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 text-xs"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Assigner tout le Programme National (18 cours)</span>
                  </button>
                </div>
              </div>

              {/* Coverage Progress Bar */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0F2C59] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    Couverture du Programme National
                  </span>
                  <span className="text-[#008080]">
                    {assignedRatio} sur {totalPossibleCourses} cours actifs ({coveragePercent}%)
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-linear-to-r from-[#008080] to-[#D4AF37] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(coveragePercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Search & Domain Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                    placeholder="Rechercher un cours ou une discipline..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedDomainFilter('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedDomainFilter === 'all'
                        ? 'bg-[#0F2C59] text-white'
                        : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    Tous les domaines
                  </button>
                  {LEARNING_DOMAINS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDomainFilter(d.id)}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        selectedDomainFilter === d.id
                          ? 'bg-[#008080] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {d.nom.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DOMAINS LIST */}
            <div className="space-y-4">
              {LEARNING_DOMAINS.filter(
                (domain) => selectedDomainFilter === 'all' || selectedDomainFilter === domain.id
              ).map((domain) => {
                const isCollapsed = !!collapsedDomains[domain.id];
                const domainCourses = courses
                  ? courses.filter((c) => {
                      const searchString = ((c as any).matiere || (c as any).titre || '').toLowerCase();
                      if (domain.id === 'langues')
                        return (
                          searchString.includes('langue') ||
                          searchString.includes('français') ||
                          searchString.includes('lecture') ||
                          searchString.includes('ecriture')
                        );
                      if (domain.id === 'maths')
                        return (
                          searchString.includes('math') ||
                          searchString.includes('calcul') ||
                          searchString.includes('mesure')
                        );
                      if (domain.id === 'eveil')
                        return (
                          searchString.includes('eveil') ||
                          searchString.includes('science') ||
                          searchString.includes('nature')
                        );
                      if (domain.id === 'social')
                        return (
                          searchString.includes('social') ||
                          searchString.includes('civisme') ||
                          searchString.includes('histoire')
                        );
                      if (domain.id === 'arts_sports')
                        return (
                          searchString.includes('art') ||
                          searchString.includes('sport') ||
                          searchString.includes('physique') ||
                          searchString.includes('dessin')
                        );
                      return false;
                    })
                  : [];

                const visibleCourses = domainCourses.filter((c) =>
                  assignmentSearch
                    ? c.titre.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                      (c.matiere || '').toLowerCase().includes(assignmentSearch.toLowerCase())
                    : true
                );

                if (visibleCourses.length === 0 && assignmentSearch) {
                  return null;
                }

                const assignedInDomain = domainCourses.filter((c) =>
                  (assignments || []).some(
                    (a) => a.cours_id === c.id && a.classe_id === currentSelectedClassId && a.est_actif !== false
                  )
                ).length;

                const allDomainAssigned = assignedInDomain === domainCourses.length;

                return (
                  <div
                    key={domain.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden transition-all"
                  >
                    {/* Domain Header */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]/50 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleDomainCollapse(domain.id)}
                          className="p-1 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] transition-colors"
                        >
                          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm sm:text-base text-[#0F2C59]">{domain.nom}</h3>
                            <span
                              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                              style={{ backgroundColor: domain.badgeBg, color: domain.badgeText }}
                            >
                              {assignedInDomain} / {domainCourses.length} cours
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5">{domain.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-8 sm:pl-0">
                        <button
                          onClick={() => handleToggleDomainBulk(domain, !allDomainAssigned)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            allDomainAssigned
                              ? 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FEE2E2]/80'
                              : 'bg-[#008080] text-white hover:bg-[#008080]/90 shadow-2xs'
                          }`}
                        >
                          {allDomainAssigned ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Tout désassigner</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tout assigner ({domainCourses.length})</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Domain Courses Grid */}
                    {!isCollapsed && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {visibleCourses.map((course) => {
                          const assignmentItem = (assignments || []).find(
                            (a) =>
                              a.cours_id === course.id &&
                              a.classe_id === currentSelectedClassId &&
                              a.est_actif !== false
                          );
                          const isAssigned = !!assignmentItem;
                          const currentTeacherId = assignmentItem?.enseignant_id || selectedClasse?.titulaire_id;
                          const currentTeacher = (teachers || []).find((t) => t.id === currentTeacherId);

                          return (
                            <div
                              key={course.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col justify-between select-none ${
                                isAssigned
                                  ? 'bg-[#F0FDF4]/70 border-[#86EFAC] shadow-2xs'
                                  : 'bg-[#FAFAFA] border-[#E2E8F0] hover:border-[#CBD5E1] opacity-80 hover:opacity-100'
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#475569] border border-[#E2E8F0]">
                                    {course.matiere}
                                  </span>
                                  <button
                                    onClick={() => handleToggleAssignment(course.id)}
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                                      isAssigned
                                        ? 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]'
                                        : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                                    }`}
                                  >
                                    {isAssigned ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 text-[#15803D]" />
                                        <span>Actif</span>
                                      </>
                                    ) : (
                                      'Inactif (Cliquer pour assigner)'
                                    )}
                                  </button>
                                </div>

                                <h4 className="font-extrabold text-sm text-[#0F2C59] mt-2.5">
                                  {course.titre}
                                </h4>
                              </div>

                              {/* Course Teacher Assignment Selector */}
                              <div className="mt-4 pt-3 border-t border-[#F1F5F9] space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
                                  <span>Enseignant assigné :</span>
                                  {currentTeacher && (
                                    <span className="text-[#008080] font-bold text-[10px]">
                                      {currentTeacher.id === selectedClasse?.titulaire_id ? '★ Titulaire' : 'Intervenant'}
                                    </span>
                                  )}
                                </div>
                                <select
                                  value={currentTeacherId || ''}
                                  onChange={(e) => handleChangeCourseTeacher(course.id, e.target.value)}
                                  className="w-full text-xs font-bold text-[#0F2C59] bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#008080] cursor-pointer"
                                >
                                  <option value="">-- Sélectionner un enseignant --</option>
                                  {(teachers || []).map((t) => {
                                    const isTitulaireOfClass = t.id === selectedClasse?.titulaire_id;
                                    return (
                                      <option key={t.id} value={t.id}>
                                        {t.nom_complet} {isTitulaireOfClass ? '(Titulaire)' : ''}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: PROMOTIONS & TITULAIRES */}
        {/* ============================================================ */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(classes || []).map((cl) => {
              const countAssigned = (assignments || []).filter(
                (a) => a.classe_id === cl.id && a.est_actif !== false
              ).length;
              const clTitulaire = (teachers || []).find((t) => t.id === cl.titulaire_id);

              // Find all teachers assigned to this class
              const teachersInThisClass = (teachers || []).filter((t) =>
                t.assigned_class_ids?.includes(cl.id)
              );

              return (
                <div
                  key={cl.id}
                  className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-[#0F2C59] text-[#D4AF37] font-bold flex items-center justify-center text-lg mb-3 border border-[#D4AF37]/30 shadow-2xs">
                        <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#E6F4F4] text-[#008080] px-2.5 py-1 rounded-full border border-[#008080]/20">
                        {countAssigned} cours actifs
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[#0F2C59]">{cl.nom || 'Classe E-RDC'}</h3>

                    <div className="mt-3 space-y-2 text-xs text-[#64748B]">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#64748B] block">Titulaire de la promotion</span>
                          <span className="font-bold text-[#0F2C59] text-xs">
                            {clTitulaire ? clTitulaire.nom_complet : 'Non désigné'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenTitulaireModal(cl)}
                          className="text-[11px] font-bold text-[#008080] hover:underline"
                        >
                          Changer
                        </button>
                      </div>

                      <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
                          Enseignants Intervenants ({teachersInThisClass.length})
                        </span>
                        {teachersInThisClass.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teachersInThisClass.map((tc) => (
                              <span
                                key={tc.id}
                                className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-[#CBD5E1] text-[#1E293B]"
                              >
                                {tc.nom_complet.split(' ')[0]} {tc.nom_complet.split(' ')[1] || ''}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8] italic">Aucun enseignant assigné</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedClasseId(cl.id);
                        setActiveTab('assignments');
                      }}
                      className="text-xs font-bold text-[#008080] hover:text-[#008080]/80 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Configurer les {countAssigned} cours</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ÉCOLES AGRÉÉES */}
        {/* ============================================================ */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setIsSchoolModalOpen(true)}
                className="px-4 py-2.5 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Ajouter un Établissement</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(schools || []).map((school) => (
                <div
                  key={school.id}
                  className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-[#D4AF37] font-bold flex items-center justify-center text-xl mb-4 border border-[#D4AF37]/30 shadow-2xs group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Agréée
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-[#0F2C59]">{school.nom}</h3>
                    <div className="mt-3 space-y-1.5 text-xs text-[#64748B]">
                      <p>
                        <strong className="text-[#1E293B]">RCCM :</strong> {school.rccm || 'CD/KNG/RCCM/20-A-00652'}
                      </p>
                      <p>
                        <strong className="text-[#1E293B]">ID NAT :</strong> {school.id_nat || 'ID-NAT 01-910-N58634L'}
                      </p>
                      <p>
                        <strong className="text-[#1E293B]">Région :</strong> Kinshasa / RDC
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Programme Pédagogique RDC</span>
                    <span className="font-bold text-[#0F2C59]">Kinshasa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 1: ASSIGNER PROFESSEUR À DES PROMOTIONS ET TITULARIAT */}
        {/* ============================================================ */}
        {promotionModalTeacher && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Assignation aux Promotions & Titulariat</h2>
                    <p className="text-[11px] text-[#64748B]">{promotionModalTeacher.nom_complet}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPromotionModalTeacher(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#008080] shrink-0 mt-0.5" />
                <span>
                  Sélectionnez les promotions (classes) auxquelles ce professeur est affecté. Cochez l'option{' '}
                  <strong className="text-[#0F2C59]">Titulaire</strong> pour lui attribuer la responsabilité principale de la promotion.
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(classes || []).map((cls) => {
                  const isAssigned = selectedPromotionIds.includes(cls.id);
                  const isTitulaire = selectedTitulairePromotionIds.includes(cls.id);

                  return (
                    <div
                      key={cls.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                        isAssigned ? 'bg-[#E6F4F4]/50 border-[#008080]/30' : 'bg-white border-[#E2E8F0]'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPromotionIds([...selectedPromotionIds, cls.id]);
                            } else {
                              setSelectedPromotionIds(selectedPromotionIds.filter((id) => id !== cls.id));
                              setSelectedTitulairePromotionIds(
                                selectedTitulairePromotionIds.filter((id) => id !== cls.id)
                              );
                            }
                          }}
                          className="rounded text-[#008080] focus:ring-[#008080]"
                        />
                        <div>
                          <div className="font-bold text-[#0F2C59]">{cls.nom}</div>
                          <div className="text-[10px] text-[#64748B]">Académie du Salut (ADS)</div>
                        </div>
                      </label>

                      {isAssigned && (
                        <label className="flex items-center gap-1.5 text-xs font-bold text-[#008080] bg-white px-2.5 py-1 rounded-lg border border-[#008080]/30 cursor-pointer shadow-2xs">
                          <input
                            type="checkbox"
                            checked={isTitulaire}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTitulairePromotionIds([...selectedTitulairePromotionIds, cls.id]);
                              } else {
                                setSelectedTitulairePromotionIds(
                                  selectedTitulairePromotionIds.filter((id) => id !== cls.id)
                                );
                              }
                            }}
                            className="rounded text-[#008080] focus:ring-[#008080]"
                          />
                          <span>Titulaire</span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setPromotionModalTeacher(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSavePromotionAssignments}
                  disabled={assignTeacherClassesMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{assignTeacherClassesMutation.isPending ? 'Enregistrement...' : 'Valider les Promotions'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 2: ASSIGNER PROFESSEUR AUX COURS DE SES PROMOTIONS */}
        {/* ============================================================ */}
        {coursesModalTeacher && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#008080] text-white flex items-center justify-center font-bold">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Assignation aux Cours par Promotion</h2>
                    <p className="text-[11px] text-[#64748B]">{coursesModalTeacher.nom_complet}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCoursesModalTeacher(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sélection de la promotion à configurer */}
              <div className="space-y-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0F2C59]">
                    Promotion cible à configurer :
                  </label>
                  {activePromotionInCourseModal && (
                    <span className="text-[11px] text-[#008080] font-bold flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{(classes || []).find((c) => c.id === activePromotionInCourseModal)?.nom || 'Promotion'}</span>
                    </span>
                  )}
                </div>

                {coursesModalTeacher.assigned_classes && coursesModalTeacher.assigned_classes.length > 0 ? (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#64748B] mb-1.5">
                      Promotions actuellement assignées :
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coursesModalTeacher.assigned_classes.map((cls) => {
                        const isSelected = activePromotionInCourseModal === cls.id;
                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => handleChangeActivePromotionInCourseModal(cls.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                              isSelected
                                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-2xs'
                                : 'bg-white text-[#64748B] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                            }`}
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>{cls.nom}</span>
                            {cls.is_titulaire && <span className="text-[#D4AF37]">★ Titulaire</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#D97706] bg-[#FEF3C7]/60 p-2.5 rounded-lg border border-[#F59E0B]/30 flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>Cet enseignant n'a pas encore de promotion assignée. Choisissez une promotion ci-dessous pour lui affecter des cours (la promotion lui sera automatiquement rattachée).</span>
                  </div>
                )}

                {/* Sélecteur de toutes les promotions pour flexibilité complète */}
                <div className="pt-1">
                  <div className="text-[10px] uppercase font-bold text-[#64748B] mb-1">
                    {coursesModalTeacher.assigned_classes && coursesModalTeacher.assigned_classes.length > 0
                      ? "Changer ou choisir une autre promotion de l'école :"
                      : "Sélectionner la promotion :"}
                  </div>
                  <select
                    value={activePromotionInCourseModal}
                    onChange={(e) => handleChangeActivePromotionInCourseModal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#008080] font-semibold cursor-pointer"
                  >
                    <option value="" disabled>-- Sélectionner une promotion --</option>
                    {(classes || []).map((cls) => {
                      const isAssigned = (coursesModalTeacher.assigned_class_ids || []).includes(cls.id);
                      return (
                        <option key={cls.id} value={cls.id}>
                          {cls.nom} {isAssigned ? '(Déjà assignée)' : '(Nouvelle assignation)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Barre d'actions rapides pour la promotion sélectionnée */}
              {activePromotionInCourseModal && (
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
                  <span className="text-[#64748B]">
                    <strong className="text-[#0F2C59]">{selectedCourseIdsForTeacher.length}</strong> cours sélectionnés pour cette promotion
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allCourseIds = (courses || []).map((c) => c.id);
                        setSelectedCourseIdsForTeacher(allCourseIds);
                      }}
                      className="text-[11px] font-bold text-[#008080] hover:underline"
                    >
                      Tout cocher
                    </button>
                    <span className="text-[#CBD5E1]">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseIdsForTeacher([])}
                      className="text-[11px] font-bold text-[#EF4444] hover:underline"
                    >
                      Tout décocher
                    </button>
                  </div>
                </div>
              )}

              {/* Grille des cours de la promotion */}
              {activePromotionInCourseModal ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {LEARNING_DOMAINS.map((domain) => {
                    const domainCourses = (courses || []).filter((c) => {
                      const searchString = ((c as any).matiere || (c as any).titre || '').toLowerCase();
                      if (domain.id === 'langues')
                        return (
                          searchString.includes('langue') ||
                          searchString.includes('français') ||
                          searchString.includes('lecture') ||
                          searchString.includes('ecriture')
                        );
                      if (domain.id === 'maths')
                        return (
                          searchString.includes('math') ||
                          searchString.includes('calcul') ||
                          searchString.includes('mesure')
                        );
                      if (domain.id === 'eveil')
                        return (
                          searchString.includes('eveil') ||
                          searchString.includes('science') ||
                          searchString.includes('nature')
                        );
                      if (domain.id === 'social')
                        return (
                          searchString.includes('social') ||
                          searchString.includes('civisme') ||
                          searchString.includes('histoire')
                        );
                      if (domain.id === 'arts_sports')
                        return (
                          searchString.includes('art') ||
                          searchString.includes('sport') ||
                          searchString.includes('physique') ||
                          searchString.includes('dessin')
                        );
                      return false;
                    });

                    if (domainCourses.length === 0) return null;

                    return (
                      <div key={domain.id} className="border border-[#E2E8F0] rounded-xl p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#0F2C59]">{domain.nom}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const ids = domainCourses.map((c) => c.id);
                              const allIncluded = ids.every((id) => selectedCourseIdsForTeacher.includes(id));
                              if (allIncluded) {
                                setSelectedCourseIdsForTeacher(
                                  selectedCourseIdsForTeacher.filter((id) => !ids.includes(id))
                                );
                              } else {
                                const newIds = Array.from(new Set([...selectedCourseIdsForTeacher, ...ids]));
                                setSelectedCourseIdsForTeacher(newIds);
                              }
                            }}
                            className="text-[10px] font-semibold text-[#008080] hover:underline"
                          >
                            Basculer le domaine
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {domainCourses.map((course) => {
                            const isChecked = selectedCourseIdsForTeacher.includes(course.id);
                            const existingAssignment = (assignments || []).find(
                              (a) =>
                                a.cours_id === course.id &&
                                a.classe_id === activePromotionInCourseModal &&
                                a.est_actif !== false
                            );
                            const otherTeacher =
                              existingAssignment?.enseignant_id &&
                              existingAssignment.enseignant_id !== coursesModalTeacher.id
                                ? (teachers || []).find((t) => t.id === existingAssignment.enseignant_id)
                                : null;

                            return (
                              <label
                                key={course.id}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition select-none ${
                                  isChecked
                                    ? 'bg-[#E6F4F4]/60 border-[#008080]/30'
                                    : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleCourseForTeacher(course.id)}
                                    className="rounded text-[#008080] focus:ring-[#008080]"
                                  />
                                  <div>
                                    <span className="font-semibold text-[#1E293B] block">{course.titre}</span>
                                    {otherTeacher && !isChecked && (
                                      <span className="text-[9px] text-[#D97706] block">
                                        Actuellement : {otherTeacher.nom_complet.split(' ')[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-[#64748B] text-xs">
                  Veuillez d'abord sélectionner une promotion assignée ci-dessus.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setCoursesModalTeacher(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeacherCourses}
                  disabled={assignTeacherToCoursesMutation.isPending || !activePromotionInCourseModal}
                  className="px-4 py-2 text-xs font-bold bg-[#008080] text-white hover:bg-[#008080]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {assignTeacherToCoursesMutation.isPending ? 'Enregistrement...' : 'Valider les Cours Assignés'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 3: DÉSIGNATION DU TITULAIRE D'UNE PROMOTION */}
        {/* ============================================================ */}
        {titulaireModalClass && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Désigner le Titulaire</h2>
                    <p className="text-[11px] text-[#64748B]">{titulaireModalClass.nom}</p>
                  </div>
                </div>
                <button
                  onClick={() => setTitulaireModalClass(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                  Professeur Titulaire de la Classe
                </label>
                <select
                  value={selectedTitulaireTeacherId}
                  onChange={(e) => setSelectedTitulaireTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                >
                  <option value="">-- Aucun titulaire (vacant) --</option>
                  {(teachers || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nom_complet} ({t.email || 'Enseignant'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setTitulaireModalClass(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveClassTitulaire}
                  disabled={updateTitulaireMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{updateTitulaireMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CRÉATION CLASSE */}
        {isClassModalOpen && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Nouvelle Promotion</h2>
                    <p className="text-[11px] text-[#64748B]">Créer une classe & affecter un titulaire</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsClassModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom de la Promotion *</label>
                  <input
                    type="text"
                    required
                    value={classNom}
                    onChange={(e) => setClassNom(e.target.value)}
                    placeholder="ex: 2ème Primaire A, 6ème Primaire..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Enseignant Titulaire</label>
                  <select
                    value={classTitulaireId}
                    onChange={(e) => setClassTitulaireId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                  >
                    <option value="">-- Sélectionner un enseignant --</option>
                    {(teachers || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nom_complet}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsClassModalOpen(false)}
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
                    <span>{createClassMutation.isPending ? 'Création...' : 'Créer la Promotion'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CRÉATION COURS */}
        {isCourseModalOpen && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#008080] text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Nouveau Cours Spécifique</h2>
                    <p className="text-[11px] text-[#64748B]">Créer un cours et l'assigner à des promotions</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCourseModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Intitulé du Cours *</label>
                  <input
                    type="text"
                    required
                    value={courseTitre}
                    onChange={(e) => setCourseTitre(e.target.value)}
                    placeholder="ex: Botanique & Écosystèmes congolais"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Discipline / Matière</label>
                  <input
                    type="text"
                    value={courseMatiereNom}
                    onChange={(e) => setCourseMatiereNom(e.target.value)}
                    placeholder="ex: Sciences de la Vie et de la Terre"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Promotions Cibles</label>
                  <div className="space-y-2 border border-[#E2E8F0] p-3 rounded-xl max-h-36 overflow-y-auto">
                    {(classes || []).map((cl) => {
                      const checked = courseTargetClasses.includes(cl.id);
                      return (
                        <label key={cl.id} className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCourseTargetClasses([...courseTargetClasses, cl.id]);
                              } else {
                                setCourseTargetClasses(courseTargetClasses.filter((id) => id !== cl.id));
                              }
                            }}
                            className="rounded text-[#008080] focus:ring-[#008080]"
                          />
                          <span>{cl.nom || 'Classe'}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createCourseMutation.isPending}
                    className="px-4 py-2 text-xs font-bold bg-[#008080] text-white hover:bg-[#008080]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{createCourseMutation.isPending ? 'Enregistrement...' : 'Enregistrer & Assigner'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CRÉATION ÉCOLE */}
        {isSchoolModalOpen && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Nouvel Établissement</h2>
                    <p className="text-[11px] text-[#64748B]">Académie du Salut (ADS)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSchoolModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSchool} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom de l'établissement *</label>
                  <input
                    type="text"
                    required
                    value={schoolNom}
                    onChange={(e) => setSchoolNom(e.target.value)}
                    placeholder="ex: Complexe Scolaire ADS Kinshasa"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">RCCM</label>
                  <input
                    type="text"
                    value={schoolRccm}
                    onChange={(e) => setSchoolRccm(e.target.value)}
                    placeholder="CD/KIN/RCCM/24-B-0081"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">ID National (ID NAT)</label>
                  <input
                    type="text"
                    value={schoolIdNat}
                    onChange={(e) => setSchoolIdNat(e.target.value)}
                    placeholder="01-95-N38190"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSchoolModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createSchoolMutation.isPending}
                    className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{createSchoolMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</span>
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
