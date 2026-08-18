"use client";

import React, { useState } from 'react';
import { useTeachers, useCreateTeacher } from '@/hooks/use-teachers';
import { useSchools } from '@/hooks/use-schools';
import { Users, Plus, Search, Building2, Phone, Mail, Sparkles, X, CheckCircle2 } from 'lucide-react';

export default function AdminTeachersPage() {
  const [search, setSearch] = useState('');
  const { data: teachers, isLoading } = useTeachers({ search });
  const { data: schools } = useSchools();
  const createTeacherMutation = useCreateTeacher();

  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ecoleId, setEcoleId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim() || !email.trim()) return;

    await createTeacherMutation.mutateAsync({
      nom_complet: nomComplet,
      email,
      telephone: telephone || undefined,
      ecole_id: ecoleId || undefined,
    });

    setNomComplet('');
    setEmail('');
    setTelephone('');
    setEcoleId('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFFBEB] px-2.5 py-0.5 rounded uppercase tracking-wider border border-[#D4AF37]/30">
              Corps Professoral & Pédagogique
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1">
            Gestion des Enseignants & Personnel
          </h1>
          <p className="text-[#64748B] text-xs mt-0.5">
            Supervision des professeurs, affectations aux cours STEM et habilitations
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Ajouter un Enseignant</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] flex items-center gap-3 shadow-xs">
        <Search className="w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un enseignant par nom, matière ou matricule..."
          className="w-full text-xs bg-transparent focus:outline-none text-[#1E293B] placeholder-[#94A3B8]"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#64748B] text-xs">
            Chargement des enseignants...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nom Complet & Titre</th>
                  <th className="px-6 py-4">Contact Professionnel</th>
                  <th className="px-6 py-4">Établissement Rattaché</th>
                  <th className="px-6 py-4">Spécialité</th>
                  <th className="px-6 py-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                {teachers?.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#0F2C59] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0F2C59] text-[#D4AF37] font-bold flex items-center justify-center text-xs shadow-2xs border border-[#D4AF37]/30">
                        {t.nom_complet.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#0F2C59]">{t.nom_complet}</div>
                        <div className="text-[11px] text-[#64748B] font-normal">Professeur Agréé ADS</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-1.5 text-[#1E293B] font-medium">
                        <Mail className="w-3 h-3 text-[#64748B]" />
                        <span>{t.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#64748B] mt-0.5">
                        <Phone className="w-3 h-3 text-[#64748B]" />
                        <span>{t.telephone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#1E293B]">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{t.ecoles?.nom || 'Académie du Salut (ADS)'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#0F2C59]">
                        Sciences & Math
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Actif
                      </span>
                    </td>
                  </tr>
                ))}

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

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2C59]">Ajouter un Enseignant</h2>
                  <p className="text-[11px] text-[#64748B]">Académie du Salut (ADS)</p>
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
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom Complet *</label>
                <input
                  type="text"
                  required
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  placeholder="Prof. Jean-Marc Ilunga"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Numéro Téléphone (WhatsApp / SMS)</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+243 81 000 0000"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Établissement</label>
                <select
                  value={ecoleId}
                  onChange={(e) => setEcoleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B] bg-white"
                >
                  <option value="">Académie du Salut (Principal)</option>
                  {schools?.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
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
                  <span>{createTeacherMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
