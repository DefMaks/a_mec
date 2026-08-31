"use client";

import React, { useState } from 'react';
import { useTeachers, useCreateTeacher } from '@/hooks/use-teachers';
import { useSchools } from '@/hooks/use-schools';
import { RoleGuard } from '@/components/layout/role-guard';
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
} from 'lucide-react';

export default function AdminTeachersPage() {
  const [search, setSearch] = useState('');
  const { data: teachers, isLoading } = useTeachers({ search });
  const { data: schools } = useSchools();
  const createTeacherMutation = useCreateTeacher();

  // Form states
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ecoleId, setEcoleId] = useState('');
  const [role, setRole] = useState<'teacher' | 'admin' | 'super_admin'>('teacher');
  const [customPassword, setCustomPassword] = useState('');
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  // Modal & Success States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdSuccessInfo, setCreatedSuccessInfo] = useState<{
    nom_complet: string;
    email: string;
    role: string;
    password?: string;
  } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim() || !email.trim()) return;

    const generatedPass = autoGeneratePassword
      ? `Ads_${Math.random().toString(36).slice(-6)}!2026`
      : customPassword || `Ads_${Math.random().toString(36).slice(-6)}!2026`;

    await createTeacherMutation.mutateAsync({
      nom_complet: nomComplet,
      email,
      telephone: telephone || undefined,
      ecole_id: ecoleId || undefined,
      role,
      password: generatedPass,
    });

    setCreatedSuccessInfo({
      nom_complet: nomComplet,
      email,
      role,
      password: generatedPass,
    });

    setNomComplet('');
    setEmail('');
    setTelephone('');
    setEcoleId('');
    setCustomPassword('');
    setAutoGeneratePassword(true);
    setIsModalOpen(false);
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
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Gestion des Enseignants & Personnel
          </h1>
          <p className="text-[#64748B] text-xs mt-0.5">
            Création des accès de connexion, affectation d'écoles et gestion des rôles pédagogiques.
          </p>
        </div>
        <button
          onClick={() => {
            setCreatedSuccessInfo(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Créer un Enseignant / Personnel</span>
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
                <strong>{createdSuccessInfo.role === 'teacher' ? 'Professeur' : createdSuccessInfo.role}</strong>.
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

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] flex items-center gap-3 shadow-xs">
        <Search className="w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un enseignant par nom, email ou numéro de téléphone..."
          className="w-full text-xs bg-transparent focus:outline-none text-[#1E293B] placeholder-[#94A3B8]"
        />
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#64748B] text-xs">
            Chargement du corps professoral...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nom Complet & Titre</th>
                  <th className="px-6 py-4">Contact & Accès</th>
                  <th className="px-6 py-4">Établissement</th>
                  <th className="px-6 py-4">Rôle Système</th>
                  <th className="px-6 py-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                {teachers?.map((t) => {
                  const roleLabel =
                    t.role === 'super_admin'
                      ? 'Super Administrateur'
                      : t.role === 'admin'
                      ? 'Administrateur'
                      : 'Professeur Titulaire';

                  return (
                    <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0F2C59]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0F2C59] text-[#D4AF37] font-bold flex items-center justify-center text-xs shadow-2xs border border-[#D4AF37]/30">
                            {t.nom_complet.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#0F2C59]">{t.nom_complet}</div>
                            <div className="text-[11px] text-[#64748B] font-normal">
                              {t.role === 'teacher' ? 'Enseignant Agréé' : 'Personnel Administratif'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5 text-[#1E293B] font-medium">
                          <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t.email || '—'}</span>
                        </div>
                        {t.telephone && (
                          <div className="flex items-center gap-1.5 text-[#64748B] mt-1">
                            <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>{t.telephone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#1E293B]">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{t.ecoles?.nom || 'Académie du Salut (ADS)'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            t.role === 'super_admin'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : t.role === 'admin'
                              ? 'bg-[#E0E7FF] text-[#3730A3]'
                              : 'bg-[#EFF6FF] text-[#1E40AF]'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {roleLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Actif
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {(!teachers || teachers.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-[#64748B]">
                      Aucun enseignant trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CRÉATION ENSEIGNANT & COMPTE AUTH */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/30 shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2C59]">Nouveau Compte Enseignant / Personnel</h2>
                  <p className="text-[11px] text-[#64748B]">Création du profil et des identifiants d'accès</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom Complet du Professeur *</label>
                  <input
                    type="text"
                    required
                    value={nomComplet}
                    onChange={(e) => setNomComplet(e.target.value)}
                    placeholder="ex: Prof. Jean-Marc Ilunga"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Email Professionnel *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prof.ilunga@academiedusalut.cd"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Téléphone (WhatsApp / SMS)</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+243 81 234 5678"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Rôle Système</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                  >
                    <option value="teacher">Professeur / Enseignant</option>
                    <option value="admin">Administrateur d'Établissement</option>
                    <option value="super_admin">Super Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2C59] mb-1">Établissement Rattaché</label>
                  <select
                    value={ecoleId}
                    onChange={(e) => setEcoleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B] bg-white cursor-pointer"
                  >
                    <option value="">Académie du Salut (Principal)</option>
                    {schools?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password Option */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#0F2C59] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGeneratePassword}
                    onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                    className="rounded text-[#008080] focus:ring-[#008080]"
                  />
                  <span>Générer automatiquement un mot de passe temporaire sécurisé</span>
                </label>

                {!autoGeneratePassword && (
                  <div>
                    <input
                      type="password"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="Définir un mot de passe initial..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] text-[#1E293B]"
                    />
                  </div>
                )}
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
                  disabled={createTeacherMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{createTeacherMutation.isPending ? 'Création du compte...' : 'Créer le Compte'}</span>
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
