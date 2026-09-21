'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStudents, useCreateStudent } from '@/hooks/use-students';
import { useAllClasses } from '@/hooks/use-course-assignments';
import { useRole } from '@/context/role-context';
import { RoleGuard } from '@/components/layout/role-guard';
import { calculateAccessCountdown } from '@/lib/access-code-utils';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  ArrowUpRight,
  Clock,
  Award,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Plus,
  X,
  User,
  Copy,
  Check,
} from 'lucide-react';

export default function ParentChildrenPage() {
  const { roleInfo, isParent, isSuperAdmin } = useRole();
  const { data: students, isLoading } = useStudents();
  const { data: allClasses } = useAllClasses();
  const createStudentMutation = useCreateStudent();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomComplet, setNomComplet] = useState('');
  const [pseudonyme, setPseudonyme] = useState('');
  const [sexe, setSexe] = useState<'M' | 'F'>('M');
  const [classeId, setClasseId] = useState('');
  const [createdStudentInfo, setCreatedStudentInfo] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Filter students for the parent
  const myChildren = students || [];

  const handleOpenModal = () => {
    setCreatedStudentInfo(null);
    setNomComplet('');
    setPseudonyme('');
    setSexe('M');
    setClasseId(allClasses && allClasses.length > 0 ? allClasses[0].id : '730145b3-b30f-4aff-b0ab-c7550849d5fe');
    setIsModalOpen(true);
  };

  const handleNomChange = (val: string) => {
    setNomComplet(val);
    if (!pseudonyme || pseudonyme.startsWith(val.slice(0, 3))) {
      const parts = val.trim().split(' ');
      if (parts.length > 1) {
        setPseudonyme(`${parts[0]} ${parts[1][0]}.`);
      } else if (parts.length === 1) {
        setPseudonyme(parts[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim()) return;

    const pseudo = pseudonyme.trim() || nomComplet.trim().split(' ')[0];

    const result = await createStudentMutation.mutateAsync({
      nom_complet: nomComplet.trim(),
      pseudonyme: pseudo,
      classe_id: classeId || undefined,
      parent_id: roleInfo.authUserId || 'parent-auth-id',
      parent_nom: roleInfo.userName || 'Parent Référent',
      sexe,
    });

    setCreatedStudentInfo(result);
    setIsModalOpen(false);
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <RoleGuard allowedRoles={['parent', 'super_admin', 'admin']} moduleName="l'Espace Famille & Enfants">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* En-tête Espace Parent */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
                <HeartHandshake className="w-3 h-3 text-[#D4AF37]" />
                Espace Famille & Tuteurs
              </span>
              <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                Année 2025 - 2026
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
              Mes Enfants Inscrits & Suivi Scolaire
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
              Inscrivez vos enfants, générez leurs codes d'accès sécurisés et suivez en temps réel la validité de leur compte élève.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={handleOpenModal}
              className="px-4 py-2.5 bg-[#008080] hover:bg-[#008080]/90 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Inscrire un Enfant</span>
            </button>
            <Link
              href="/parent/enrollment"
              className="px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F2C59] rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-[#0F2C59]" />
              <span>Dossier Complet Admission</span>
            </Link>
          </div>
        </div>

        {/* Success Banner when child is newly created */}
        {createdStudentInfo && (
          <div className="bg-[#F0FDF4] border border-[#86EFAC] p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#15803D] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#166534]">
                  Enfant inscrit avec succès : {createdStudentInfo.nom_complet || createdStudentInfo.pseudonyme} !
                </h3>
                <p className="text-xs text-[#15803D] mt-0.5">
                  Le compte élève est actif pour les 30 prochains jours. Transmettez ce code d'accès à votre enfant pour qu'il se connecte à ses cours et devoirs.
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-[#BBF7D0] text-xs">
                  <span className="text-[#64748B] font-medium">Code d'accès élève :</span>
                  <code className="font-mono text-sm font-extrabold text-[#0F2C59] bg-[#F1F5F9] px-2.5 py-0.5 rounded-lg border border-[#CBD5E1]">
                    {createdStudentInfo.code_acces}
                  </code>
                  <button
                    onClick={() => copyToClipboard(createdStudentInfo.code_acces || '')}
                    className="text-[11px] font-bold text-[#008080] hover:text-[#008080]/80 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Code copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCreatedStudentInfo(null)}
              className="p-1.5 text-[#15803D] hover:bg-[#DCFCE7] rounded-lg self-end md:self-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Liste des Enfants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myChildren.map((child: any, idx: number) => {
            const countdown = calculateAccessCountdown(
              child.derniere_mise_a_jour_code,
              child.date_expiration_code,
              child.forfait_actif === 'annuel' ? 365 : child.forfait_actif === 'trimestriel' ? 90 : 30
            );

            return (
              <div
                key={child.id || idx}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-5 group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-extrabold text-base shadow-xs border border-[#D4AF37]/30">
                        {child.pseudonyme?.slice(0, 2).toUpperCase() || 'EL'}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#0F2C59]">
                          {child.nom_complet || child.pseudonyme}
                        </h3>
                        <p className="text-xs text-[#64748B] font-medium">
                          {child.classes?.nom || child.classe || 'Classe Assignée'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${countdown.badgeBg} ${countdown.badgeColor}`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {countdown.badgeLabel}
                    </span>
                  </div>

                  {/* Code d'accès & Décompte */}
                  <div className="mt-5 grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">
                        Code d'accès Élève
                      </span>
                      <span className="font-mono text-sm font-extrabold text-[#0F2C59]">
                        {child.code_acces || 'ADS-4091'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">
                        Dernière Mise à Jour
                      </span>
                      <span className="text-xs font-bold text-[#475569]">
                        {countdown.lastUpdatedFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Barre de Progression de l'Abonnement */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#64748B]">Validité Code ({child.forfait_actif || 'Mensuel'})</span>
                      <span className="text-[#0F2C59] font-bold">Expire le {countdown.expiresAtFormatted}</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0F2C59] h-full rounded-full transition-all"
                        style={{ width: `${Math.max(10, 100 - countdown.progressPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <Link
                    href="/chat"
                    className="text-xs font-semibold text-[#64748B] hover:text-[#0F2C59] transition flex items-center gap-1"
                  >
                    <span>Contacter le titulaire</span>
                  </Link>
                  <Link
                    href="/parent/payments"
                    className="px-3.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0F2C59] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Prolonger l'accès</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL: INSCRIPTION DIRECTE D'UN ENFANT PAR LE PARENT */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#008080] text-white flex items-center justify-center font-bold shadow-2xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F2C59]">Inscrire un Enfant</h2>
                    <p className="text-[11px] text-[#64748B]">Création instantanée du profil et du code d'accès élève</p>
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
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Nom & Prénom de l'Enfant *
                  </label>
                  <input
                    type="text"
                    required
                    value={nomComplet}
                    onChange={(e) => handleNomChange(e.target.value)}
                    placeholder="ex: Grace Mukendi"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                      Pseudonyme d'Accès
                    </label>
                    <input
                      type="text"
                      value={pseudonyme}
                      onChange={(e) => setPseudonyme(e.target.value)}
                      placeholder="ex: Grace M."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2C59] mb-1">Sexe</label>
                    <select
                      value={sexe}
                      onChange={(e) => setSexe(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white"
                    >
                      <option value="M">Garçon (M)</option>
                      <option value="F">Fille (F)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">
                    Classe d'Affectation *
                  </label>
                  <select
                    value={classeId}
                    onChange={(e) => setClasseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                  >
                    {allClasses?.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nom} (Académie du Salut)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>
                    Un code d'accès unique (ex: <strong className="text-[#0F2C59]">ADS-XXXX</strong>) et un forfait initial de 30 jours seront générés automatiquement.
                  </span>
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
                    disabled={createStudentMutation.isPending}
                    className="px-4 py-2 text-xs font-bold bg-[#008080] text-white hover:bg-[#008080]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{createStudentMutation.isPending ? 'Enregistrement...' : 'Inscrire cet Enfant'}</span>
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
