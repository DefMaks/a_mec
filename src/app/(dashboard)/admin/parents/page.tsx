'use client';

import React, { useState } from 'react';
import { useParents } from '@/hooks/use-parents';
import { RoleGuard } from '@/components/layout/role-guard';
import {
  HeartHandshake,
  Search,
  Filter,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function AdminParentsPage() {
  const { data: parents, isLoading } = useParents();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredParents = (parents || []).filter((p) => {
    const matchesSearch =
      p.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telephone.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.statut_abonnement === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} moduleName="la gestion des Parents & Responsables">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#0F2C59] bg-[#F1F5F9] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#CBD5E1]">
                Pôle Administratif & Familles
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5 flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-[#D4AF37]" />
              <span>Gestion des Parents & Responsables</span>
            </h1>
            <p className="text-[#64748B] text-xs mt-0.5">
              Suivi des comptes tuteurs, enfants rattachés et statut de souscription Mobile Money.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom du parent, téléphone (+243) ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut d'abonnement"
              className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30 font-medium"
            >
              <option value="ALL">Tous les statuts d'abonnement</option>
              <option value="ACTIF">Abonnement Actif</option>
              <option value="EN_ATTENTE">En attente de paiement</option>
              <option value="EXPIRER">Abonnement Expiré</option>
            </select>
          </div>
        </div>

        {/* Parents Table / Cards */}
        {isLoading ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs text-[#64748B]">
            Chargement des données parents...
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs text-[#64748B]">
            Aucun parent trouvé correspondant aux critères.
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1E293B]">
                <thead className="bg-[#F8FAFC] text-[#475569] uppercase text-[11px] tracking-wider font-bold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3.5 px-5">Parent / Tuteur</th>
                    <th className="py-3.5 px-5">Téléphone Mobile Money</th>
                    <th className="py-3.5 px-5">Commune / Ville</th>
                    <th className="py-3.5 px-5">Élève(s) Rattaché(s)</th>
                    <th className="py-3.5 px-5">Abonnement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredParents.map((parent) => (
                    <tr key={parent.id} className="hover:bg-[#F8FAFC] transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#0F2C59]">{parent.nom_complet}</div>
                        <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{parent.email || 'Pas d\'email'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-[#0F2C59] font-bold">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#008080]" />
                          <span>{parent.telephone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#64748B]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#94A3B8]" />
                          <span>{parent.commune_ville}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="space-y-1">
                          {parent.eleves_lies.map((el) => (
                            <div key={el.id} className="text-xs flex items-center gap-1.5 font-medium text-[#0F2C59]">
                              <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{el.nom_complet}</span>
                              <span className="text-[10px] text-[#64748B] font-normal">
                                ({el.classe} - {el.ecole_nom})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                            parent.statut_abonnement === 'ACTIF'
                              ? 'bg-[#DCFCE7] text-[#15803D] border-[#10B981]/30'
                              : parent.statut_abonnement === 'EN_ATTENTE'
                              ? 'bg-[#FEF3C7] text-[#B45309] border-[#D4AF37]/30'
                              : 'bg-[#FEE2E2] text-[#B91C1C] border-[#F87171]/30'
                          }`}
                        >
                          {parent.statut_abonnement === 'ACTIF' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{parent.statut_abonnement}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
