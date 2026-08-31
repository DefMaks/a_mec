"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePayments, useUpdatePaymentStatus } from '@/hooks/use-payments';
import { useTarifs, useUpdateTarif } from '@/hooks/use-tarifs';
import { useRole } from '@/context/role-context';
import { RoleGuard } from '@/components/layout/role-guard';
import { TWIGA_CONFIG } from '@/lib/config';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Filter,
  Check,
  ArrowDownToLine,
  Smartphone,
  ShieldAlert,
  BookOpen,
  Settings,
  DollarSign,
  Calendar,
  Layers,
  Edit3,
  X,
  Wallet,
  Zap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const { isTeacher, roleInfo } = useRole();
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: payments, isLoading } = usePayments(statusFilter);
  const { data: tarifs, isLoading: isLoadingTarifs } = useTarifs();
  const updateTarifMutation = useUpdateTarif();
  const updateStatusMutation = useUpdatePaymentStatus();

  // État du modal d'édition de tarif
  const [editingTarif, setEditingTarif] = useState<{
    type_forfait: 'mensuel' | 'trimestriel' | 'annuel';
    nom: string;
    montant: number;
    devise: 'USD' | 'CDF';
    duree_jours: number;
    description: string;
  } | null>(null);

  // Restriction d'accès : Les aspects financiers et paiements ne sont pas accessibles aux enseignants
  if (isTeacher) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#F87171]/30 text-[#DC2626] flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#0F2C59]">
            Accès Réservé à l'Administration & Direction
          </h2>
          <p className="text-xs text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Le module de suivi des paiements, tarification des codes d'accès et recettes Mobile Money est strictement confidentiel et réservé à la Direction et aux Administrateurs d'établissement.
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

  const handleSaveTarif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarif) return;
    await updateTarifMutation.mutateAsync({
      type_forfait: editingTarif.type_forfait,
      montant: Number(editingTarif.montant),
      devise: editingTarif.devise,
      nom: editingTarif.nom,
      duree_jours: Number(editingTarif.duree_jours),
      description: editingTarif.description,
    });
    setEditingTarif(null);
  };

  const totalCollected = (payments || [])
    .filter((p) => p.statut === 'completed' || (p.statut as string) === 'VALIDE')
    .reduce((acc, p) => acc + (p.montant || 0), 0);

  const totalPending = (payments || [])
    .filter((p) => p.statut === 'pending')
    .reduce((acc, p) => acc + (p.montant || 0), 0);

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} moduleName="la gestion des Tarifs & Recettes Mobile Money">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFFBEB] px-2.5 py-0.5 rounded uppercase tracking-wider border border-[#D4AF37]/30 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Comptabilité & Passerelle Twiga Pay
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1">
            Gestion des Tarifs & Recettes Mobile Money
          </h1>
          <p className="text-[#64748B] text-xs mt-0.5">
            Configurez les montants des codes d'accès (mensuel, trimestriel, annuel) et suivez les règlements parents.
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

      {/* SECTION 1: Tarification des Codes d'Accès (Admin Settings) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center font-bold">
              <Settings className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F2C59]">
                Tarifs des Codes d'Accès Élèves (Table Supabase)
              </h2>
              <p className="text-xs text-[#64748B]">
                Montants configurés par l'administrateur pour l'accès aux cours, révisions et quiz.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Décompte depuis dernière mise à jour
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {(tarifs || []).map((t) => (
            <div
              key={t.type_forfait}
              className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between space-y-4 hover:border-[#D4AF37] transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFF6FF] text-[#0F2C59] border border-[#0F2C59]/10">
                    Forfait {t.type_forfait}
                  </span>
                  <span className="text-xs text-[#64748B] font-semibold">
                    {t.duree_jours} jours
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#0F2C59] font-tabular">
                    {t.montant}$
                  </span>
                  <span className="text-xs font-bold text-[#64748B]">{t.devise}</span>
                </div>
                <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  Validité : <strong>{t.duree_jours}j</strong> dès paiement
                </span>
                <button
                  onClick={() =>
                    setEditingTarif({
                      type_forfait: t.type_forfait,
                      nom: t.nom,
                      montant: t.montant,
                      devise: (t.devise as 'USD' | 'CDF') || 'USD',
                      duree_jours: t.duree_jours,
                      description: t.description || '',
                    })
                  }
                  className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#0F2C59] text-[#0F2C59] rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Edit3 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
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
            Règlements Mobile Money encaissés
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
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
            Validation USSD Push parent
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              DÉTECTION AUTOMATIQUE OPÉRATEURS
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0F2C59] flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4 text-[#0F2C59]" />
            </div>
          </div>
          <div className="text-sm font-bold text-[#0F2C59] mt-2">
            Airtel Money • Orange • Vodacom
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Détection sans sélection manuelle requise</p>
        </div>
      </div>

      {/* SECTION 2: Passerelle Twiga Pay / DefMaks & Wallet Info */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#0F2C59]">
                  Passerelle Twiga Pay & Compte Wallet DefMaks
                </h2>
                <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connecté
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Intégration Mobile Money directe (Airtel, Orange, Vodacom) et encaissement automatisé.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono font-bold bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F2C59] px-2.5 py-1 rounded-lg">
              Client: Académie du Salut (MEC)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Wallet ID */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Wallet ID Actif</span>
              <span className="text-[9px] font-bold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded">Réseau DMKS</span>
            </div>
            <div className="font-mono text-xs font-black text-[#0F2C59] break-all">
              {TWIGA_CONFIG.walletId}
            </div>
            <p className="text-[10px] text-[#64748B]">
              Compte séquestre de versement Mobile Money
            </p>
          </div>

          {/* Client ID & Contact */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Client Gateway ID</span>
              <span className="text-[9px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-1.5 py-0.5 rounded">B2B / École</span>
            </div>
            <div className="font-mono text-xs font-black text-[#0F2C59] break-all">
              {TWIGA_CONFIG.clientId}
            </div>
            <p className="text-[10px] text-[#64748B]">
              Contact : Christian MITELEZI (+243997670081)
            </p>
          </div>

          {/* Frais & Payout */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B]">Frais DefMaks & Payout</span>
              <span className="text-[9px] font-bold text-[#D4AF37] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#D4AF37]/30">5% USD</span>
            </div>
            <div className="text-xs font-bold text-[#0F2C59]">
              Numéro Payout : <span className="font-mono font-black">+243997670081</span>
            </div>
            <p className="text-[10px] text-[#64748B]">
              Frais de transaction : 5% en USD, 0% en CDF (Mode test 10 CDF)
            </p>
          </div>
        </div>
      </div>

      {/* Table des transactions */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#0F2C59]">
            Journal des Transactions & Validations
          </h3>
          <span className="text-xs text-[#64748B] font-semibold">
            {payments?.length || 0} transaction{(payments?.length || 0) > 1 ? 's' : ''}
          </span>
        </div>

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
                  <th className="px-6 py-4">Élève Bénéficiaire</th>
                  <th className="px-6 py-4">Montant & Forfait</th>
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
                          {p.eleve?.pseudonyme || 'Élève ADS'}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Parent : {p.parent?.nom_complet || 'Tuteur'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#0F2C59] text-sm font-tabular">
                        <div>
                          ${p.montant}.00 {p.devise || 'USD'}
                        </div>
                        <div className="text-[10px] font-semibold text-[#64748B] uppercase">
                          {p.type_forfait || 'Mensuel'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-bold text-[#0F2C59] flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{p.operateur_detecte || p.mode_paiement || 'Airtel Money RDC'}</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#64748B]">
                          {p.telephone_payeur || p.reference_twiga || 'TWG-Proxy'}
                        </div>
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

      {/* Modal d'édition des tarifs pour l'administrateur */}
      {editingTarif && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#0F2C59]">
                Modifier le Forfait {editingTarif.type_forfait.toUpperCase()}
              </h3>
              <button
                onClick={() => setEditingTarif(null)}
                className="text-[#64748B] hover:text-[#0F2C59]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarif} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#475569] block mb-1">
                  Nom du Forfait
                </label>
                <input
                  type="text"
                  value={editingTarif.nom}
                  onChange={(e) => setEditingTarif({ ...editingTarif, nom: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-semibold focus:outline-none focus:border-[#0F2C59]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#475569] block mb-1">
                    Montant ($ USD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editingTarif.montant}
                    onChange={(e) =>
                      setEditingTarif({ ...editingTarif, montant: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold focus:outline-none focus:border-[#0F2C59]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#475569] block mb-1">
                    Durée d'accès (Jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingTarif.duree_jours}
                    onChange={(e) =>
                      setEditingTarif({ ...editingTarif, duree_jours: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold focus:outline-none focus:border-[#0F2C59]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#475569] block mb-1">
                  Description / Avantages
                </label>
                <textarea
                  rows={3}
                  value={editingTarif.description}
                  onChange={(e) =>
                    setEditingTarif({ ...editingTarif, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#0F2C59]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTarif(null)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-[#64748B] font-bold hover:bg-[#F8FAFC]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateTarifMutation.isPending}
                  className="px-4 py-2 bg-[#0F2C59] text-white rounded-xl font-bold hover:bg-[#0F2C59]/90 shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>{updateTarifMutation.isPending ? 'Enregistrement...' : 'Enregistrer le tarif'}</span>
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
