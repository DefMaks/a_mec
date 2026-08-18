"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePayments, useUpdatePaymentStatus } from '@/hooks/use-payments';
import { useRole } from '@/context/role-context';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Sparkles, Filter, Check, ArrowDownToLine, Smartphone, ShieldAlert, BookOpen } from 'lucide-react';

export default function AdminPaymentsPage() {
  const { isTeacher, roleInfo } = useRole();
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: payments, isLoading } = usePayments(statusFilter);
  const updateStatusMutation = useUpdatePaymentStatus();

  // Restriction d'accès : Les aspects financiers et paiements ne sont pas accessibles aux enseignants
  if (isTeacher) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#F87171]/30 text-[#DC2626] flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#0F2C59]">
            Accès Réservé à l'Administration & Super Admin
          </h2>
          <p className="text-xs text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Le module de suivi des paiements, encaissements de minerval et recettes Mobile Money est strictement confidentiel et réservé à la Direction et aux Administrateurs d'établissement.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-[#0F2C59] text-white rounded-xl text-xs font-bold hover:bg-[#0F2C59]/90 transition shadow-xs flex items-center gap-2"
            >
              <span>Tableau de Bord Pédagogique</span>
            </Link>
            <Link
              href="/teacher/courses"
              className="px-4 py-2 bg-white text-[#0F2C59] border border-[#E2E8F0] rounded-xl text-xs font-bold hover:bg-[#F8FAFC] transition shadow-xs flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Mes Cours & Chapitres</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (paymentId: string, status: 'completed' | 'failed' | 'cancelled') => {
    await updateStatusMutation.mutateAsync({ paymentId, status });
  };

  const totalCollected = (payments || [])
    .filter((p) => p.statut === 'completed' || (p.statut as string) === 'VALIDE')
    .reduce((acc, p) => acc + (p.montant || 0), 0);

  const totalPending = (payments || [])
    .filter((p) => p.statut === 'pending')
    .reduce((acc, p) => acc + (p.montant || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFFBEB] px-2.5 py-0.5 rounded uppercase tracking-wider border border-[#D4AF37]/30">
              Comptabilité & Minerval
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1">
            Suivi Financier & Recettes Twiga Pay
          </h1>
          <p className="text-[#64748B] text-xs mt-0.5">
            Historique des transactions Mobile Money (M-Pesa, Airtel Money, Orange Money) pour l'Académie du Salut
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'completed', label: 'Validés' },
            { key: 'pending', label: 'En attente' },
            { key: 'failed', label: 'Échoués' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                statusFilter === st.key
                  ? 'bg-[#0F2C59] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F2C59] hover:bg-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mini Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              TOTAL COLLECTÉ (VALIDÉ)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
            ${totalCollected}.00 <span className="text-xs font-bold text-[#64748B]">USD</span>
          </div>
          <p className="text-[11px] text-[#15803D] mt-1 font-semibold">
            Règlements encaissés sans litige
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              EN COURS DE TRAITEMENT
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#B45309] mt-2 font-tabular">
            ${totalPending}.00 <span className="text-xs font-bold text-[#64748B]">USD</span>
          </div>
          <p className="text-[11px] text-[#B45309] mt-1 font-semibold">
            Validation opérateur Mobile Money
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              MOYENS DE PAIEMENT RDC
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4 text-[#0F2C59]" />
            </div>
          </div>
          <div className="text-sm font-bold text-[#0F2C59] mt-2">
            M-Pesa • Airtel • Orange
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Passerelle certifiée Twiga Pay RDC</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#64748B] text-xs">
            Chargement des transactions financières...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Commande & Date</th>
                  <th className="px-6 py-4">Élève & Parent Payeur</th>
                  <th className="px-6 py-4">Montant Frais</th>
                  <th className="px-6 py-4">Opérateur & Réf Twiga</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
                {payments?.map((p) => {
                  const isCompleted = p.statut === 'completed' || (p.statut as string) === 'VALIDE';
                  return (
                    <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-bold text-[#0F2C59]">{p.order_id}</div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {new Date(p.created_at).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1E293B]">
                          {p.parent?.nom_complet || 'Tuteur légal'}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Élève : <strong className="text-[#0F2C59]">{p.eleve?.pseudonyme || 'Élève ADS'}</strong>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#0F2C59] text-sm font-tabular">
                        ${p.montant}.00 {p.devise || 'USD'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-bold text-[#0F2C59] flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{p.mode_paiement || 'M-Pesa RDC'}</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#64748B]">{p.reference_twiga || 'TWG-994821'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isCompleted
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : p.statut === 'pending'
                              ? 'bg-[#FEF3C7] text-[#B45309]'
                              : 'bg-[#FEE2E2] text-[#B91C1C]'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Validé
                            </>
                          ) : p.statut === 'pending' ? (
                            <>
                              <Clock className="w-3 h-3" />
                              En attente
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Échoué
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.statut === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(p.id, 'completed')}
                            className="px-3 py-1.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 ml-auto"
                          >
                            <Check className="w-3 h-3 text-[#D4AF37]" />
                            <span>Valider</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {(!payments || payments.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-[#64748B]">
                      Aucune transaction financière trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
