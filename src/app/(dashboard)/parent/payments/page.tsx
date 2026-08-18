'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePayments, useCreatePayment } from '@/hooks/use-payments';
import { useRole } from '@/context/role-context';
import {
  CreditCard,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  X,
  FileDown,
} from 'lucide-react';

export default function ParentPaymentsPage() {
  const { data: payments, isLoading } = usePayments();
  const createPaymentMutation = useCreatePayment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eleveId, setEleveId] = useState('child-1');
  const [montant, setMontant] = useState('25');
  const [modePaiement, setModePaiement] = useState('orange_money');
  const [telephone, setTelephone] = useState('+243 89 000 0000');
  const [moisConcerne, setMoisConcerne] = useState('Février 2026');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPaymentMutation.mutateAsync({
        eleve_id: eleveId,
        montant: parseFloat(montant),
        devise: 'USD',
        mode_paiement: modePaiement,
        numero_telephone: telephone,
      });

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (err: any) {
      alert('Erreur: ' + err?.message);
    }
  };

  const validPayments = (payments || []).filter(
    (p) => p.statut === 'completed' || (p.statut as string) === 'VALIDE'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête Espace Parent / Règlements */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[#D4AF37]" />
              Minerval & Frais Scolaires
            </span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              Twiga Pay • Mobile Money RDC
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Règlement des Frais Scolaires
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            Effectuez le paiement direct du minerval et frais de scolarité via M-Pesa, Airtel Money ou Orange Money avec confirmation instantanée.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 self-start md:self-center"
        >
          <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Effectuer un Paiement Mobile</span>
        </button>
      </div>

      {/* Cartes Récapitulatives */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Total Frais Réglés
          </p>
          <div className="text-2xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
            $150.00 <span className="text-xs font-bold text-[#64748B]">USD</span>
          </div>
          <p className="text-[11px] text-[#15803D] font-semibold mt-1">À jour pour le 2ème trimestre</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Élèves Couverts
          </p>
          <div className="text-2xl font-extrabold text-[#0F2C59] mt-2 font-tabular">
            2 <span className="text-xs font-bold text-[#64748B]">Enfants</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Joel Mukendi & Sarah Kabongo</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Opérateurs Actifs
          </p>
          <div className="text-xs font-bold text-[#0F2C59] mt-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309]">Orange Money</span>
            <span className="px-2 py-0.5 rounded bg-[#FEE2E2] text-[#B91C1C]">Airtel</span>
            <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">M-Pesa</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-2">Paiement sans frais supplémentaires</p>
        </div>
      </div>

      {/* Historique des Transactions */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F2C59]">Historique de vos Paiements</h2>
            <p className="text-xs text-[#64748B]">Reçus et justificatifs pour l'Académie du Salut</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Référence</th>
                <th className="px-5 py-3.5">Enfant</th>
                <th className="px-5 py-3.5">Montant & Mode</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
              {(payments || []).slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-[#0F2C59]">
                    {p.order_id}
                    <div className="text-[11px] text-[#64748B] font-sans font-normal">
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-[#1E293B]">
                    {p.eleve?.pseudonyme || 'Joel Mukendi'}
                  </td>
                  <td className="px-5 py-3.5 font-tabular font-bold text-[#0F2C59]">
                    ${p.montant}.00 {p.devise}
                    <div className="text-[11px] text-[#64748B] font-normal uppercase">
                      {p.mode_paiement?.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D]">
                      <CheckCircle2 className="w-3 h-3" /> Validé
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => alert(`Téléchargement du reçu ${p.order_id}`)}
                      className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F2C59] inline-flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Effectuer Paiement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-[#0F2C59]">Paiement Mobile Money</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F2C59]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess && (
              <div className="p-3 bg-[#DCFCE7] border border-[#10B981]/40 rounded-xl text-xs text-[#15803D] flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Paiement initié avec succès.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Sélectionner l'Enfant *
                </label>
                <select
                  value={eleveId}
                  onChange={(e) => setEleveId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59]"
                >
                  <option value="child-1">Joel Mukendi (4ème Humanités Math-Physique)</option>
                  <option value="child-2">Sarah Kabongo (6ème Primaire)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Montant (USD) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">
                    Mois / Motif
                  </label>
                  <input
                    type="text"
                    value={moisConcerne}
                    onChange={(e) => setMoisConcerne(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Opérateur Mobile Money *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'orange_money', label: 'Orange Money' },
                    { id: 'airtel_money', label: 'Airtel Money' },
                    { id: 'mpesa', label: 'M-Pesa' },
                  ].map((op) => (
                    <button
                      type="button"
                      key={op.id}
                      onClick={() => setModePaiement(op.id)}
                      className={`p-2 rounded-xl text-[11px] font-bold border text-center transition ${
                        modePaiement === op.id
                          ? 'bg-[#0F2C59] text-[#D4AF37] border-[#0F2C59]'
                          : 'border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Numéro de Téléphone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+243 89 000 0000"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59]"
                />
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createPaymentMutation.isPending}
                  className="px-4 py-2 text-xs font-bold bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl transition shadow-xs"
                >
                  {createPaymentMutation.isPending ? 'Traitement...' : 'Confirmer le Paiement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
