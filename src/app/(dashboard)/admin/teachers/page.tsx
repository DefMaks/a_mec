"use client";

import React, { useState } from 'react';
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useToggleTeacherActive,
  useAssignTeacherClasses,
  TeacherItem,
} from '@/hooks/use-teachers';
import { useSchools } from '@/hooks/use-schools';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import { useAllClasses } from '@/hooks/use-course-assignments';
import { RoleGuard } from '@/components/layout/role-guard';
import { useRole } from '@/context/role-context';
import {
  Users,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  Sparkles,
  X,
  CheckCircle2,
  ShieldCheck,
  Key,
  Copy,
  Check,
  GraduationCap,
  Award,
  Edit3,
  Power,
  Layers,
  AlertCircle,
  Filter,
  Lock,
  UserCheck,
  UserX,
  BookOpen,
} from 'lucide-react';

export default function AdminTeachersPage() {
  const { role: activeUserRole, isSuperAdmin, canManageRole } = useRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'TEACHER' | 'ADMIN'>('ALL');

  const { data: teachers, isLoading } = useTeachers({ search }, isSuperAdmin);
  const { data: schools } = useSchools();
  const { data: allClasses } = useAllClasses();

  // École gérée par l'administrateur (valeur par défaut)
  const adminSchoolId = DEFAULT_SCHOOL_ID || (schools && schools[0]?.id) || '64c583de-e9e2-456b-8942-164656544661';

  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const toggleActiveMutation = useToggleTeacherActive();
  const assignClassesMutation = useAssignTeacherClasses();

  // --- Modals State ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [assigningTeacher, setAssigningTeacher] = useState<TeacherItem | null>(null);
  const [deactivatingTeacher, setDeactivatingTeacher] = useState<TeacherItem | null>(null);

  // --- Create Form State ---
  const [createNomComplet, setCreateNomComplet] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createTelephone, setCreateTelephone] = useState('');
  const [createEcoleId, setCreateEcoleId] = useState(adminSchoolId);
  const [createRole, setCreateRole] = useState<'teacher' | 'admin' | 'super_admin'>('teacher');
  const [createCustomPassword, setCreateCustomPassword] = useState('');
  const [createAutoGeneratePassword, setCreateAutoGeneratePassword] = useState(true);
  const [createAssignedClasses, setCreateAssignedClasses] = useState<string[]>([]);
  const [createTitulaireClasses, setCreateTitulaireClasses] = useState<string[]>([]);

  // --- Edit Form State ---
  const [editNomComplet, setEditNomComplet] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelephone, setEditTelephone] = useState('');
  const [editEcoleId, setEditEcoleId] = useState(adminSchoolId);
  const [editRole, setEditRole] = useState<'teacher' | 'admin' | 'super_admin'>('teacher');
  const [editActive, setEditActive] = useState(true);
  const [editAssignedClasses, setEditAssignedClasses] = useState<string[]>([]);
  const [editTitulaireClasses, setEditTitulaireClasses] = useState<string[]>([]);

  // --- Direct Assignment State ---
  const [directSelectedClassIds, setDirectSelectedClassIds] = useState<string[]>([]);
  const [directTitulaireClassIds, setDirectTitulaireClassIds] = useState<string[]>([]);

  // --- Success Feedback Banner ---
  const [createdSuccessInfo, setCreatedSuccessInfo] = useState<{
    nom_complet: string;
    email: string;
    role: string;
    password?: string;
  } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Filtered teachers list
  const filteredTeachers = (teachers || []).filter((t) => {
    if (statusFilter === 'ACTIVE') return t.active;
    if (statusFilter === 'INACTIVE') return !t.active;
    if (statusFilter === 'TEACHER') return t.role === 'teacher';
    if (statusFilter === 'ADMIN') return t.role === 'admin' || t.role === 'super_admin';
    return true;
  });

  // Counters for stats
  const totalCount = teachers?.length || 0;
  const activeCount = teachers?.filter((t) => t.active).length || 0;
  const inactiveCount = teachers?.filter((t) => !t.active).length || 0;
  const teacherCount = teachers?.filter((t) => t.role === 'teacher').length || 0;
  const adminCount = teachers?.filter((t) => t.role === 'admin' || t.role === 'super_admin').length || 0;

  // Handlers
  const handleOpenCreateModal = () => {
    setCreatedSuccessInfo(null);
    setCreateNomComplet('');
    setCreateEmail('');
    setCreateTelephone('');
    setCreateEcoleId(adminSchoolId);
    setCreateRole('teacher');
    setCreateAutoGeneratePassword(true);
    setCreateCustomPassword('');
    setCreateAssignedClasses([]);
    setCreateTitulaireClasses([]);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createNomComplet.trim() || !createEmail.trim()) return;

    // Enforce hierarchy: non-super_admin cannot create super_admin
    const targetRole = isSuperAdmin ? createRole : createRole === 'super_admin' ? 'admin' : createRole;

    const generatedPass = createAutoGeneratePassword
      ? `Ads_${Math.random().toString(36).slice(-6)}!2026`
      : createCustomPassword || `Ads_${Math.random().toString(36).slice(-6)}!2026`;

    const targetEcoleId = createEcoleId || adminSchoolId;

    await createTeacherMutation.mutateAsync({
      nom_complet: createNomComplet,
      email: createEmail,
      telephone: createTelephone || undefined,
      ecole_id: targetEcoleId,
      role: targetRole,
      password: generatedPass,
      assigned_class_ids: createAssignedClasses,
      titulaire_class_ids: createTitulaireClasses,
    });

    setCreatedSuccessInfo({
      nom_complet: createNomComplet,
      email: createEmail,
      role: targetRole,
      password: generatedPass,
    });

    setIsCreateModalOpen(false);
  };

  const handleOpenEditModal = (teacher: TeacherItem) => {
    setEditingTeacher(teacher);
    setEditNomComplet(teacher.nom_complet);
    setEditEmail(teacher.email || '');
    setEditTelephone(teacher.telephone || '');
    setEditEcoleId(teacher.ecole_id || adminSchoolId);
    setEditRole(teacher.role as any);
    setEditActive(teacher.active);
    setEditAssignedClasses([...(teacher.assigned_class_ids || [])]);
    setEditTitulaireClasses([...(teacher.titulaire_class_ids || [])]);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editNomComplet.trim()) return;

    // Verify permission to edit target role
    if (!isSuperAdmin && editingTeacher.role === 'super_admin') {
      alert("Action non autorisée: Seul le Super Administrateur peut modifier un compte Super Admin.");
      return;
    }

    const targetRole = isSuperAdmin ? editRole : editRole === 'super_admin' ? 'admin' : editRole;
    const targetEcoleId = editEcoleId || adminSchoolId;

    await updateTeacherMutation.mutateAsync({
      id: editingTeacher.id,
      nom_complet: editNomComplet,
      email: editEmail,
      telephone: editTelephone,
      ecole_id: targetEcoleId,
      role: targetRole,
      active: editActive,
      assigned_class_ids: editAssignedClasses,
      titulaire_class_ids: editTitulaireClasses,
    });

    setEditingTeacher(null);
  };

  const handleOpenAssignModal = (teacher: TeacherItem) => {
    setAssigningTeacher(teacher);
    setDirectSelectedClassIds([...(teacher.assigned_class_ids || [])]);
    setDirectTitulaireClassIds([...(teacher.titulaire_class_ids || [])]);
  };

  const handleSaveDirectAssignment = async () => {
    if (!assigningTeacher) return;

    await assignClassesMutation.mutateAsync({
      teacherId: assigningTeacher.id,
      assignedClassIds: directSelectedClassIds,
      titulaireClassIds: directTitulaireClassIds,
    });

    setAssigningTeacher(null);
  };

  const handleConfirmToggleActive = async () => {
    if (!deactivatingTeacher) return;

    // Check permissions
    if (!isSuperAdmin && deactivatingTeacher.role === 'super_admin') {
      alert("Action non autorisée: Seul le Super Administrateur peut modifier ou désactiver un Super Admin.");
      setDeactivatingTeacher(null);
      return;
    }

    await toggleActiveMutation.mutateAsync({
      teacherId: deactivatingTeacher.id,
      currentActive: deactivatingTeacher.active,
    });

    setDeactivatingTeacher(null);
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2500);
    }
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} moduleName="la gestion du Personnel & Enseignants">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#0F2C59] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#CBD5E1]">
                Pôle Administratif & Corps Enseignant
              </span>
              <span className="text-[10px] font-bold text-[#008080] bg-[#E6F4F4] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#008080]/30">
                Hiérarchie : {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#D4AF37]" />
              <span>Gestion des Enseignants & Personnel</span>
            </h1>
            <p className="text-[#64748B] text-xs mt-0.5">
              CRU, activation/désactivation des comptes, affectation aux classes et titulariat pédagogique.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Nouveau Compte Personnel</span>
          </button>
        </div>

        {/* Success Notification Banner with generated credentials */}
        {createdSuccessInfo && (
          <div className="bg-[#F0FDF4] border border-[#86EFAC] p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#15803D] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#166534]">
                  Compte créé avec succès pour {createdSuccessInfo.nom_complet} !
                </h3>
                <p className="text-xs text-[#15803D] mt-0.5">
                  Le compte <strong className="underline">{createdSuccessInfo.email}</strong> a été initialisé avec le rôle{' '}
                  <strong>
                    {createdSuccessInfo.role === 'teacher'
                      ? 'Professeur'
                      : createdSuccessInfo.role === 'super_admin'
                      ? 'Super Administrateur'
                      : 'Administrateur'}
                  </strong>.
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-[#BBF7D0] text-xs">
                  <span className="text-[#64748B] font-medium">Mot de passe temporaire :</span>
                  <code className="font-bold text-[#0F2C59] bg-[#F1F5F9] px-2 py-0.5 rounded">
                    {createdSuccessInfo.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(createdSuccessInfo.password || '')}
                    className="text-[11px] font-bold text-[#008080] hover:text-[#008080]/80 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPass ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCreatedSuccessInfo(null)}
              className="p-1 text-[#15803D] hover:bg-[#DCFCE7] rounded-lg self-end md:self-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase">Total Personnel</span>
              <Users className="w-4 h-4 text-[#0F2C59]" />
            </div>
            <div className="text-xl font-extrabold text-[#0F2C59] mt-1">{totalCount}</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">{teacherCount} Professeurs • {adminCount} Admins</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#15803D] uppercase">Comptes Actifs</span>
              <UserCheck className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-xl font-extrabold text-[#15803D] mt-1">{activeCount}</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Accès autorisé au portail</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#DC2626] uppercase">Comptes Inactifs</span>
              <UserX className="w-4 h-4 text-[#DC2626]" />
            </div>
            <div className="text-xl font-extrabold text-[#DC2626] mt-1">{inactiveCount}</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Accès suspendu / désactivé</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#008080] uppercase">Classes Répertoire</span>
              <GraduationCap className="w-4 h-4 text-[#008080]" />
            </div>
            <div className="text-xl font-extrabold text-[#008080] mt-1">{allClasses?.length || 0}</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Disponibles pour affectation</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-white p-1.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'ALL'
                  ? 'bg-[#0F2C59] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F2C59] hover:bg-[#F8FAFC]'
              }`}
            >
              Tous ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-[#15803D] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#15803D] hover:bg-[#F0FDF4]'
              }`}
            >
              Actifs ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'INACTIVE'
                  ? 'bg-[#DC2626] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2]'
              }`}
            >
              Désactivés ({inactiveCount})
            </button>
            <button
              onClick={() => setStatusFilter('TEACHER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'TEACHER'
                  ? 'bg-[#008080] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#008080] hover:bg-[#E6F4F4]'
              }`}
            >
              Professeurs ({teacherCount})
            </button>
            <button
              onClick={() => setStatusFilter('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'ADMIN'
                  ? 'bg-[#4338CA] text-white shadow-2xs'
                  : 'text-[#64748B] hover:text-[#4338CA] hover:bg-[#EEF2FF]'
              }`}
            >
              Admins ({adminCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] flex items-center gap-2.5 shadow-2xs min-w-[280px]">
            <Search className="w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, classe..."
              className="w-full text-xs bg-transparent focus:outline-none text-[#1E293B] placeholder-[#94A3B8]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#94A3B8] hover:text-[#0F2C59]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Teachers & Personnel Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-12 text-center text-[#64748B] text-xs">
              Chargement du corps professoral et administratif...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nom Complet & Titre</th>
                    <th className="px-6 py-4">Contact & Accès</th>
                    <th className="px-6 py-4">Classes Affectées</th>
                    <th className="px-6 py-4">Rôle Système</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                  {filteredTeachers.map((t) => {
                    const isTargetSuperAdmin = t.role === 'super_admin';
                    const canEditThisUser = isSuperAdmin || !isTargetSuperAdmin;

                    const roleLabel =
                      t.role === 'super_admin'
                        ? 'Super Administrateur'
                        : t.role === 'admin'
                        ? 'Administrateur'
                        : 'Professeur Titulaire';

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-[#F8FAFC] transition-colors ${
                          !t.active ? 'bg-[#FAFAFA] opacity-75' : ''
                        }`}
                      >
                        {/* Name and avatar */}
                        <td className="px-6 py-4 font-bold text-[#0F2C59]">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shadow-2xs border ${
                                !t.active
                                  ? 'bg-[#E2E8F0] text-[#64748B] border-[#CBD5E1]'
                                  : t.role === 'super_admin'
                                  ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30'
                                  : t.role === 'admin'
                                  ? 'bg-[#E0E7FF] text-[#3730A3] border-[#6366F1]/30'
                                  : 'bg-[#0F2C59] text-[#D4AF37] border-[#D4AF37]/30'
                              }`}
                            >
                              {t.nom_complet.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${t.active ? 'text-[#0F2C59]' : 'text-[#64748B]'}`}>
                                  {t.nom_complet}
                                </span>
                                {!canEditThisUser && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded border border-[#F59E0B]/30">
                                    <Lock className="w-2.5 h-2.5" />
                                    Protégé
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#64748B] font-normal flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-[#94A3B8]" />
                                <span>{t.ecoles?.nom || 'Académie du Salut (ADS)'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4 text-xs">
                          <div className="flex items-center gap-1.5 text-[#1E293B] font-medium">
                            <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                            <span className="truncate max-w-[180px]">{t.email || '—'}</span>
                          </div>
                          {t.telephone && (
                            <div className="flex items-center gap-1.5 text-[#64748B] mt-1">
                              <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                              <span>{t.telephone}</span>
                            </div>
                          )}
                        </td>

                        {/* Assigned Classes ("il doit être assignable également") */}
                        <td className="px-6 py-4 text-xs">
                          {t.assigned_classes && t.assigned_classes.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                              {t.assigned_classes.map((cls) => (
                                <span
                                  key={cls.id}
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    cls.is_titulaire
                                      ? 'bg-[#E6F4F4] text-[#008080] border-[#008080]/30'
                                      : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                                  }`}
                                >
                                  <GraduationCap className="w-3 h-3" />
                                  <span>{cls.nom}</span>
                                  {cls.is_titulaire && <span className="text-[9px] font-extrabold text-[#D4AF37]">★</span>}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAssignModal(t)}
                              className="inline-flex items-center gap-1 text-[10px] text-[#64748B] hover:text-[#008080] bg-[#F8FAFC] hover:bg-[#E6F4F4] px-2 py-1 rounded-md border border-[#E2E8F0] font-medium transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Assigner une classe</span>
                            </button>
                          )}
                        </td>

                        {/* Role System */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              t.role === 'super_admin'
                                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30'
                                : t.role === 'admin'
                                ? 'bg-[#E0E7FF] text-[#3730A3] border border-[#6366F1]/30'
                                : 'bg-[#EFF6FF] text-[#1E40AF] border border-[#3B82F6]/30'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {roleLabel}
                          </span>
                        </td>

                        {/* Status (Actif / Inactif) */}
                        <td className="px-6 py-4 text-center">
                          {t.active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full border border-[#86EFAC]/50">
                              <CheckCircle2 className="w-3 h-3" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] px-2.5 py-1 rounded-full border border-[#FCA5A5]/50">
                              <Power className="w-3 h-3" />
                              Désactivé
                            </span>
                          )}
                        </td>

                        {/* Actions (CRU-Désactivable + Assigner) */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Assigner Button */}
                            <button
                              onClick={() => handleOpenAssignModal(t)}
                              title="Affecter à des classes"
                              className="p-1.5 text-[#008080] hover:bg-[#E6F4F4] rounded-lg border border-[#008080]/30 transition"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button (CRU) */}
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              disabled={!canEditThisUser}
                              title={canEditThisUser ? "Modifier le compte" : "Réservé au Super Administrateur"}
                              className={`p-1.5 rounded-lg border transition ${
                                canEditThisUser
                                  ? 'text-[#0F2C59] hover:bg-[#F1F5F9] border-[#CBD5E1]'
                                  : 'text-[#94A3B8] border-transparent cursor-not-allowed'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Désactiver / Activer Button */}
                            <button
                              onClick={() => setDeactivatingTeacher(t)}
                              disabled={!canEditThisUser}
                              title={
                                !canEditThisUser
                                  ? "Réservé au Super Administrateur"
                                  : t.active
                                  ? "Désactiver l'accès"
                                  : "Réactiver l'accès"
                              }
                              className={`p-1.5 rounded-lg border transition ${
                                !canEditThisUser
                                  ? 'text-[#CBD5E1] border-transparent cursor-not-allowed'
                                  : t.active
                                  ? 'text-[#DC2626] hover:bg-[#FEF2F2] border-[#FCA5A5]/50'
                                  : 'text-[#15803D] hover:bg-[#DCFCE7] border-[#86EFAC]/50'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-[#64748B]">
                        Aucun membre du personnel trouvé avec ces critères.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL 1: CRÉATION D'UN PERSONNEL & ASSIGNATION */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/30 shadow-2xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Nouveau Compte Enseignant / Personnel</h2>
                    <p className="text-[11px] text-[#64748B]">Création du profil, identifiants et affectations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom Complet du Personnel *</label>
                    <input
                      type="text"
                      required
                      value={createNomComplet}
                      onChange={(e) => setCreateNomComplet(e.target.value)}
                      placeholder="ex: Prof. Jean-Marc Ilunga"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Email Professionnel *</label>
                    <input
                      type="email"
                      required
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="prof.ilunga@academiedusalut.cd"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Téléphone (WhatsApp / SMS)</label>
                    <input
                      type="tel"
                      value={createTelephone}
                      onChange={(e) => setCreateTelephone(e.target.value)}
                      placeholder="+243 81 234 5678"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Rôle Système *</label>
                    <select
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                    >
                      <option value="teacher">Professeur / Enseignant</option>
                      <option value="admin">Administrateur d'Établissement</option>
                      {/* Super Admin option only allowed for super_admin */}
                      {isSuperAdmin && <option value="super_admin">Super Administrateur</option>}
                    </select>
                    {!isSuperAdmin && (
                      <p className="text-[10px] text-[#64748B] mt-1">
                        * En tant qu'administrateur, vous pouvez créer des administrateurs et des professeurs.
                      </p>
                    )}
                  </div>

                  {/* Champ invisible - affecté par défaut à l'école gérée par l'admin */}
                  <div className="hidden">
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Établissement Rattaché</label>
                    <input
                      type="hidden"
                      value={createEcoleId || adminSchoolId}
                      name="ecole_id"
                    />
                  </div>
                </div>

                {/* Section Affectation des Classes */}
                {createRole === 'teacher' && (
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F2C59] flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-[#008080]" />
                        Affectation Immédiate aux Classes
                      </span>
                      <span className="text-[10px] text-[#64748B]">Optionnel</span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {allClasses?.map((cls) => {
                        const isAssigned = createAssignedClasses.includes(cls.id);
                        const isTitulaire = createTitulaireClasses.includes(cls.id);

                        return (
                          <div
                            key={cls.id}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between transition ${
                              isAssigned ? 'bg-[#E6F4F4]/50 border-[#008080]/30' : 'bg-white border-[#E2E8F0]'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCreateAssignedClasses([...createAssignedClasses, cls.id]);
                                  } else {
                                    setCreateAssignedClasses(createAssignedClasses.filter((id) => id !== cls.id));
                                    setCreateTitulaireClasses(createTitulaireClasses.filter((id) => id !== cls.id));
                                  }
                                }}
                                className="rounded text-[#008080] focus:ring-[#008080]"
                              />
                              <span className="font-semibold text-[#1E293B]">{cls.nom}</span>
                            </label>

                            {isAssigned && (
                              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#008080] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isTitulaire}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCreateTitulaireClasses([...createTitulaireClasses, cls.id]);
                                    } else {
                                      setCreateTitulaireClasses(createTitulaireClasses.filter((id) => id !== cls.id));
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
                  </div>
                )}

                {/* Password Option */}
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#0F2C59] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createAutoGeneratePassword}
                      onChange={(e) => setCreateAutoGeneratePassword(e.target.checked)}
                      className="rounded text-[#008080] focus:ring-[#008080]"
                    />
                    <span>Générer automatiquement un mot de passe temporaire sécurisé</span>
                  </label>

                  {!createAutoGeneratePassword && (
                    <div>
                      <input
                        type="password"
                        value={createCustomPassword}
                        onChange={(e) => setCreateCustomPassword(e.target.value)}
                        placeholder="Définir un mot de passe initial..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createTeacherMutation.isPending}
                    className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{createTeacherMutation.isPending ? 'Création...' : 'Créer le Compte'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: MODIFICATION DU PERSONNEL (CRU + DÉSACTIVABLE) */}
        {editingTeacher && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#008080] text-white flex items-center justify-center font-bold shadow-2xs">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Modifier le Personnel</h2>
                    <p className="text-[11px] text-[#64748B]">Mise à jour des coordonnées, rôle et statut d'accès</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTeacher(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom Complet *</label>
                    <input
                      type="text"
                      required
                      value={editNomComplet}
                      onChange={(e) => setEditNomComplet(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={editTelephone}
                      onChange={(e) => setEditTelephone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Rôle Système</label>
                    <select
                      value={editRole}
                      disabled={!isSuperAdmin && editingTeacher.role === 'super_admin'}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white"
                    >
                      <option value="teacher">Professeur / Enseignant</option>
                      <option value="admin">Administrateur d'Établissement</option>
                      {isSuperAdmin && <option value="super_admin">Super Administrateur</option>}
                    </select>
                  </div>

                  {/* Champ invisible - affecté par défaut à l'école gérée par l'admin */}
                  <div className="hidden">
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Établissement</label>
                    <input
                      type="hidden"
                      value={editEcoleId || adminSchoolId}
                      name="edit_ecole_id"
                    />
                  </div>
                </div>

                {/* Statut d'Accès (CRU-Désactivable) */}
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#0F2C59]">Statut du Compte</div>
                    <div className="text-[11px] text-[#64748B]">
                      {editActive
                        ? 'Le compte est actif et peut se connecter à la plateforme.'
                        : "Le compte est désactivé. L'accès est temporairement suspendu."}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditActive(!editActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      editActive
                        ? 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]'
                        : 'bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{editActive ? 'Actif' : 'Désactivé'}</span>
                  </button>
                </div>

                {/* Section Affectation des Classes */}
                {editRole === 'teacher' && (
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F2C59] flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-[#008080]" />
                        Classes Affectées & Titulariat
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {allClasses?.map((cls) => {
                        const isAssigned = editAssignedClasses.includes(cls.id);
                        const isTitulaire = editTitulaireClasses.includes(cls.id);

                        return (
                          <div
                            key={cls.id}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between transition ${
                              isAssigned ? 'bg-[#E6F4F4]/50 border-[#008080]/30' : 'bg-white border-[#E2E8F0]'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditAssignedClasses([...editAssignedClasses, cls.id]);
                                  } else {
                                    setEditAssignedClasses(editAssignedClasses.filter((id) => id !== cls.id));
                                    setEditTitulaireClasses(editTitulaireClasses.filter((id) => id !== cls.id));
                                  }
                                }}
                                className="rounded text-[#008080] focus:ring-[#008080]"
                              />
                              <span className="font-semibold text-[#1E293B]">{cls.nom}</span>
                            </label>

                            {isAssigned && (
                              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#008080] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isTitulaire}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditTitulaireClasses([...editTitulaireClasses, cls.id]);
                                    } else {
                                      setEditTitulaireClasses(editTitulaireClasses.filter((id) => id !== cls.id));
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
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTeacher(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={updateTeacherMutation.isPending}
                    className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <span>{updateTeacherMutation.isPending ? 'Enregistrement...' : 'Enregistrer Modifications'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: AFFECTATION RAPIDE DE CLASSES ("il doit être assignable également") */}
        {assigningTeacher && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#008080] text-white flex items-center justify-center font-bold shadow-2xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Affectation des Classes</h2>
                    <p className="text-[11px] text-[#64748B]">{assigningTeacher.nom_complet}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAssigningTeacher(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#64748B]">
                Sélectionnez les classes attribuées à cet enseignant. Vous pouvez également le nommer comme{' '}
                <strong className="text-[#0F2C59]">Professeur Titulaire</strong> de la classe.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {allClasses?.map((cls) => {
                  const isChecked = directSelectedClassIds.includes(cls.id);
                  const isTitulaire = directTitulaireClassIds.includes(cls.id);

                  return (
                    <div
                      key={cls.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                        isChecked ? 'bg-[#E6F4F4]/50 border-[#008080]/30' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDirectSelectedClassIds([...directSelectedClassIds, cls.id]);
                            } else {
                              setDirectSelectedClassIds(directSelectedClassIds.filter((id) => id !== cls.id));
                              setDirectTitulaireClassIds(directTitulaireClassIds.filter((id) => id !== cls.id));
                            }
                          }}
                          className="rounded text-[#008080] focus:ring-[#008080]"
                        />
                        <div>
                          <div className="font-bold text-[#0F2C59]">{cls.nom}</div>
                          <div className="text-[10px] text-[#64748B]">Académie du Salut</div>
                        </div>
                      </label>

                      {isChecked && (
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#008080] bg-white px-2.5 py-1 rounded-lg border border-[#008080]/30 cursor-pointer shadow-2xs">
                          <input
                            type="checkbox"
                            checked={isTitulaire}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDirectTitulaireClassIds([...directTitulaireClassIds, cls.id]);
                              } else {
                                setDirectTitulaireClassIds(directTitulaireClassIds.filter((id) => id !== cls.id));
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
                  onClick={() => setAssigningTeacher(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveDirectAssignment}
                  disabled={assignClassesMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#008080] text-white hover:bg-[#008080]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{assignClassesMutation.isPending ? 'Enregistrement...' : 'Valider Affectation'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: CONFIRMATION DÉSACTIVATION / ACTIVATION */}
        {deactivatingTeacher && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0] text-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-xs border ${
                  deactivatingTeacher.active
                    ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]/50'
                    : 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]/50'
                }`}
              >
                <Power className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#0F2C59]">
                  {deactivatingTeacher.active ? 'Désactiver ce Compte ?' : 'Réactiver ce Compte ?'}
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  {deactivatingTeacher.active ? (
                    <>
                      L'accès de <strong className="text-[#0F2C59]">{deactivatingTeacher.nom_complet}</strong> sera
                      suspendu. Ses cours, évaluations et historiques restent intégralement conservés.
                    </>
                  ) : (
                    <>
                      Le compte de <strong className="text-[#0F2C59]">{deactivatingTeacher.nom_complet}</strong> sera
                      réactivé avec ses autorisations d'accès.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeactivatingTeacher(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmToggleActive}
                  disabled={toggleActiveMutation.isPending}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition ${
                    deactivatingTeacher.active
                      ? 'bg-[#DC2626] hover:bg-[#DC2626]/90'
                      : 'bg-[#15803D] hover:bg-[#15803D]/90'
                  }`}
                >
                  {toggleActiveMutation.isPending
                    ? 'Traitement...'
                    : deactivatingTeacher.active
                    ? 'Oui, Désactiver'
                    : 'Oui, Réactiver'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
