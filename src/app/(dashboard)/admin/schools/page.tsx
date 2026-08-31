"use client";

import React, { useState } from 'react';
import { useSchools, useCreateSchool } from '@/hooks/use-schools';
import {
  useAllClasses,
  useCreateAdminClass,
  useCourseAssignments,
  useAssignCourseToClass,
  useUnassignCourseFromClass,
  useBulkAssignCourses,
  useBulkUnassignCourses,
  PRIMARY_CLASS_ID,
  PROF_SHASA_ID,
  STANDARD_PRIMARY_COURSES,
  LEARNING_DOMAINS,
  LearningDomain,
} from '@/hooks/use-course-assignments';
import { useCourses, useCreateCourse } from '@/hooks/use-courses';
import { useTeachers } from '@/hooks/use-teachers';
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
  CheckSquare,
  Square,
  BookMarked,
  Check,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AdminSchoolsPage() {
  const { data: schools } = useSchools();
  const createSchoolMutation = useCreateSchool();

  const { data: classes, isLoading: loadingClasses } = useAllClasses();
  const createClassMutation = useCreateAdminClass();

  const { data: teachers } = useTeachers();
  const { data: courses } = useCourses();
  const createCourseMutation = useCreateCourse();

  const [activeTab, setActiveTab] = useState<'classes' | 'assignments' | 'schools'>('assignments');
  const [selectedClasseId, setSelectedClasseId] = useState<string>(PRIMARY_CLASS_ID);

  const { data: assignments } = useCourseAssignments();
  const assignMutation = useAssignCourseToClass();
  const unassignMutation = useUnassignCourseFromClass();
  const bulkAssignMutation = useBulkAssignCourses();
  const bulkUnassignMutation = useBulkUnassignCourses();

  // Modals
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Forms
  const [schoolNom, setSchoolNom] = useState('');
  const [schoolRccm, setSchoolRccm] = useState('');
  const [schoolIdNat, setSchoolIdNat] = useState('');

  const [classNom, setClassNom] = useState('');
  const [classTitulaireId, setClassTitulaireId] = useState(PROF_SHASA_ID);

  const [courseTitre, setCourseTitre] = useState('');
  const [courseMatiereNom, setCourseMatiereNom] = useState('Mathématiques');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseTargetClasses, setCourseTargetClasses] = useState<string[]>([PRIMARY_CLASS_ID]);

  // Filter
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [collapsedDomains, setCollapsedDomains] = useState<Record<string, boolean>>({});

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

    const newCl = await createClassMutation.mutateAsync({
      nom: classNom,
      titulaire_id: classTitulaireId,
    });

    setClassNom('');
    setIsClassModalOpen(false);
    if (newCl?.id) {
      setSelectedClasseId(newCl.id);
      setActiveTab('assignments');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitre.trim()) return;

    await createCourseMutation.mutateAsync({
      titre: courseTitre,
      description: courseDescription,
      matiere: courseMatiereNom,
      matiere_nom: courseMatiereNom,
      target_classe_ids: courseTargetClasses,
      enseignant_id: PROF_SHASA_ID,
    });

    setCourseTitre('');
    setCourseDescription('');
    setIsCourseModalOpen(false);
  };

  // Toggle single course assignment
  const handleToggleAssignment = async (courseId: string) => {
    const isAssigned = (assignments || []).some(
      (a) => a.cours_id === courseId && a.classe_id === selectedClasseId && a.est_actif !== false
    );

    if (isAssigned) {
      await unassignMutation.mutateAsync({ cours_id: courseId, classe_id: selectedClasseId });
    } else {
      await assignMutation.mutateAsync({
        cours_id: courseId,
        classe_id: selectedClasseId,
        enseignant_id: PROF_SHASA_ID,
      });
    }
  };

  // 1-Click: Assign ALL 18 Standard National Courses
  const handleAssignAllStandardProgram = async () => {
    const allIds = STANDARD_PRIMARY_COURSES.map((c) => c.id);
    await bulkAssignMutation.mutateAsync({
      cours_ids: allIds,
      classe_id: selectedClasseId,
      enseignant_id: selectedClasse?.titulaire_id || PROF_SHASA_ID,
    });
  };

  // Bulk Domain Assignment
  const handleToggleDomainBulk = async (domain: LearningDomain, assignAll: boolean) => {
    if (assignAll) {
      await bulkAssignMutation.mutateAsync({
        cours_ids: domain.courseIds,
        classe_id: selectedClasseId,
        enseignant_id: selectedClasse?.titulaire_id || PROF_SHASA_ID,
      });
    } else {
      await bulkUnassignMutation.mutateAsync({
        cours_ids: domain.courseIds,
        classe_id: selectedClasseId,
      });
    }
  };

  const toggleDomainCollapse = (domainId: string) => {
    setCollapsedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  const selectedClasse = (classes || []).find((c) => c.id === selectedClasseId) || classes?.[0];
  const activeAssignmentsForClass = (assignments || []).filter(
    (a) => a.classe_id === selectedClasseId && a.est_actif !== false
  );

  const totalPossibleCourses = STANDARD_PRIMARY_COURSES.length;
  const assignedRatio = activeAssignmentsForClass.length;
  const coveragePercent = Math.round((assignedRatio / Math.max(totalPossibleCourses, 1)) * 100);

  const titulaireTeacher = (teachers || []).find((t) => t.id === selectedClasse?.titulaire_id);
  const titulaireNom = titulaireTeacher?.nom_complet || 'Prof. Shasa Kanyinda';

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} moduleName="la gestion des Classes & Établissements">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#CBD5E1]">
              Pôle Pédagogique & Direction Scolaire
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Structure Pédagogique & Affectation des Programmes
          </h1>
          <p className="text-[#64748B] text-xs mt-0.5 max-w-2xl">
            Configurez les promotions, désignez les enseignants titulaires et associez en toute simplicité les cours du Programme National aux classes.
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
            <span>Créer un Cours Spécifique</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-white p-1.5 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'assignments'
              ? 'bg-[#0F2C59] text-white shadow-xs'
              : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#D4AF37]" />
          <span>Tableau d'Affectation des Cours ({activeAssignmentsForClass.length} affectés)</span>
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
          <span>Écoles Agréées ({schools?.length || 1})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: PÔLE D'AFFECTATION DES COURS (MODERNE, PAR DOMAINE) */}
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
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Promotion Sélectionnée :</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <select
                      value={selectedClasseId}
                      onChange={(e) => setSelectedClasseId(e.target.value)}
                      className="text-base font-extrabold text-[#0F2C59] bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#008080] cursor-pointer"
                    >
                      {(classes || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom || 'Classe Pédagogique'}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-[#008080] font-semibold bg-[#F0FDFA] px-2.5 py-1 rounded-lg border border-[#CCFBF1]">
                      Titulaire : <strong>{titulaireNom}</strong>
                    </span>
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

          {/* DOMAINS LIST (ACCORDION & CARDS) */}
          <div className="space-y-4">
            {LEARNING_DOMAINS.filter(
              (domain) => selectedDomainFilter === 'all' || selectedDomainFilter === domain.id
            ).map((domain) => {
              const isCollapsed = !!collapsedDomains[domain.id];
              const domainCourses = STANDARD_PRIMARY_COURSES.filter((c) =>
                domain.courseIds.includes(c.id)
              );

              // Filter by search text if present
              const visibleCourses = domainCourses.filter((c) =>
                assignmentSearch
                  ? c.titre.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                    c.matiere.toLowerCase().includes(assignmentSearch.toLowerCase())
                  : true
              );

              if (visibleCourses.length === 0 && assignmentSearch) {
                return null;
              }

              const assignedInDomain = domainCourses.filter((c) =>
                (assignments || []).some(
                  (a) => a.cours_id === c.id && a.classe_id === selectedClasseId && a.est_actif !== false
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
                        {isCollapsed ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronUp className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#0F2C59]">
                            {domain.nom}
                          </h3>
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

                    {/* Domain bulk toggle buttons */}
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
                        const isAssigned = (assignments || []).some(
                          (a) =>
                            a.cours_id === course.id &&
                            a.classe_id === selectedClasseId &&
                            a.est_actif !== false
                        );

                        return (
                          <div
                            key={course.id}
                            onClick={() => handleToggleAssignment(course.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                              isAssigned
                                ? 'bg-[#F0FDF4]/70 border-[#86EFAC] shadow-2xs'
                                : 'bg-[#FAFAFA] border-[#E2E8F0] hover:border-[#CBD5E1] opacity-75 hover:opacity-100'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#475569] border border-[#E2E8F0]">
                                  {course.matiere}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    isAssigned
                                      ? 'bg-[#DCFCE7] text-[#15803D]'
                                      : 'bg-[#F1F5F9] text-[#64748B]'
                                  }`}
                                >
                                  {isAssigned ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 text-[#15803D]" />
                                      Actif
                                    </>
                                  ) : (
                                    'Inactif'
                                  )}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-sm text-[#0F2C59] mt-2.5">
                                {course.titre}
                              </h4>
                              <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                                Code national : {course.code}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                              <span className="text-[#64748B] text-[11px]">Enseignant :</span>
                              <span className="font-bold text-[#008080] text-[11px]">
                                {titulaireNom}
                              </span>
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
      {/* TAB 2: PROMOTIONS & TITULAIRES */}
      {/* ============================================================ */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(classes || []).map((cl) => {
            const countAssigned = (assignments || []).filter(
              (a) => a.classe_id === cl.id && a.est_actif !== false
            ).length;
            const isPrimary = cl.id === PRIMARY_CLASS_ID;

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
                    {isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Classe Pilote
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-[#0F2C59]">{cl.nom || 'Classe E-RDC'}</h3>
                  <div className="mt-3 space-y-1.5 text-xs text-[#64748B]">
                    <p>
                      <strong className="text-[#1E293B]">Enseignant Titulaire :</strong>{' '}
                      <span className="text-[#008080] font-bold">Prof. Shasa Kanyinda</span>
                    </p>
                    <p>
                      <strong className="text-[#1E293B]">Cours Assignés :</strong>{' '}
                      <span className="font-bold text-[#0F2C59]">{countAssigned} cours actifs</span>
                    </p>
                    <p>
                      <strong className="text-[#1E293B]">Cycle & Niveau :</strong> Primaire / Fondamentale
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedClasseId(cl.id);
                      setActiveTab('assignments');
                    }}
                    className="text-xs font-bold text-[#008080] hover:text-[#008080]/80 flex items-center gap-1"
                  >
                    <span>Gérer les {countAssigned} cours assignés</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ÉCOLES AGRÉÉES */}
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
                    <p><strong className="text-[#1E293B]">RCCM :</strong> {school.rccm || 'CD/KNG/RCCM/20-A-00652'}</p>
                    <p><strong className="text-[#1E293B]">ID NAT :</strong> {school.id_nat || 'ID-NAT 01-910-N58634L'}</p>
                    <p><strong className="text-[#1E293B]">Région :</strong> Kinshasa / RDC</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Programme STEM & EXETAT</span>
                  <span className="font-bold text-[#0F2C59]">Kinshasa</span>
                </div>
              </div>
            ))}
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
                  <option value={PROF_SHASA_ID}>Prof. Shasa Kanyinda (Recommandé)</option>
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

      {/* MODAL CRÉATION & ASSIGNATION COURS */}
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
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Promotions Cibles pour l'assignation</label>
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
