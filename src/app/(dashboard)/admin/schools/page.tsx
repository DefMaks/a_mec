"use client";

import React, { useState } from 'react';
import { useSchools, useCreateSchool } from '@/hooks/use-schools';
import { Building2, Plus, Sparkles, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function AdminSchoolsPage() {
  const { data: schools, isLoading } = useSchools();
  const createSchoolMutation = useCreateSchool();

  const [nom, setNom] = useState('');
  const [rccm, setRccm] = useState('');
  const [idNat, setIdNat] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    await createSchoolMutation.mutateAsync({
      nom,
      rccm: rccm || undefined,
      id_nat: idNat || undefined,
    });

    setNom('');
    setRccm('');
    setIdNat('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFFBEB] px-2.5 py-0.5 rounded uppercase tracking-wider border border-[#D4AF37]/30">
              Réseau Scolaire & Établissements
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1">
            Établissements & Complexes Partenaires
          </h1>
          <p className="text-[#64748B] text-xs mt-0.5">
            Supervision des infrastructures scolaires agréées en République Démocratique du Congo
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Ajouter une École</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-[#64748B] bg-white rounded-xl border border-[#E2E8F0] text-xs">
          Chargement des écoles partenaires...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools?.map((school) => (
            <div
              key={school.id}
              className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-[#D4AF37] font-bold flex items-center justify-center text-xl mb-4 border border-[#D4AF37]/30 shadow-2xs group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Agréée
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#0F2C59]">{school.nom}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-[#64748B]">
                  <p><strong className="text-[#1E293B]">RCCM :</strong> {school.rccm || 'CD/KIN/RCCM/24-B-0081'}</p>
                  <p><strong className="text-[#1E293B]">ID NAT :</strong> {school.id_nat || '01-95-N38190'}</p>
                  <p><strong className="text-[#1E293B]">Région :</strong> Kinshasa / RDC</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="text-[#64748B]">
                  Depuis le {new Date(school.created_at).toLocaleDateString('fr-FR')}
                </span>
                <span className="font-bold text-[#0F2C59]">Programme STEM</span>
              </div>
            </div>
          ))}

          {(!schools || schools.length === 0) && (
            <div className="col-span-full bg-white p-12 text-center text-[#64748B] rounded-xl border border-[#E2E8F0]">
              Aucune école enregistrée pour le moment.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F2C59]">Nouvelle École</h2>
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
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">Nom de l'établissement *</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex: Complexe Scolaire ADS Kinshasa"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">RCCM</label>
                <input
                  type="text"
                  value={rccm}
                  onChange={(e) => setRccm(e.target.value)}
                  placeholder="CD/KIN/RCCM/24-B-0081"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F2C59] mb-1">ID National (ID NAT)</label>
                <input
                  type="text"
                  value={idNat}
                  onChange={(e) => setIdNat(e.target.value)}
                  placeholder="01-95-N38190"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 text-[#1E293B]"
                />
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
  );
}
