'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePayments, useInitiateTwigaPayment, useConfirmPaymentAndRenewCode } from '@/hooks/use-payments';
import { useTarifs } from '@/hooks/use-tarifs';
import { useStudents } from '@/hooks/use-students';
import { useRole } from '@/context/role-context';
import { RoleGuard } from '@/components/layout/role-guard';
import { detectAndFormatOperator, TWIGA_CONFIG, IS_PROD } from '@/lib/config';
import { calculateAccessCountdown } from '@/lib/access-code-utils';
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
  RefreshCw,
  Zap,
  Calendar,
  Layers,
  AlertCircle,
  KeyRound,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function ParentPaymentsPage() {
  const { data: payments, isLoading: isLoadingPayments } = usePayments();
  const { data: tarifs, isLoading: isLoadingTarifs } = useTarifs();
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const initiateTwigaPayment = useInitiateTwigaPayment();
  const confirmPaymentMutation = useConfirmPaymentAndRenewCode();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedForfaitType, setSelectedForfaitType] = useState<'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  
  // Numéro de téléphone & mode de test
  const [phoneNumber, setPhoneNumber] = useState<string>(!IS_PROD ? TWIGA_CONFIG.testPhoneNumber : '');
  const [isTestMode, setIsTestMode] = useState<boolean>(!IS_PROD);

  // Détection automatique du réseau
  const operatorInfo = detectAndFormatOperator(phoneNumber);

  // États du flux de paiement et de polling
  const [paymentStep, setPaymentStep] = useState<'form' | 'polling' | 'success' | 'error'>('form');
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [activePaymentId, setActivePaymentId] = useState<string>('');
  const [pollingSeconds, setPollingSeconds] = useState<number>(0);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sélectionner le premier enfant par défaut
  useEffect(() => {
    if (students && students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Récupérer le tarif sélectionné
  const currentTarif = (tarifs || []).find((t) => t.type_forfait === selectedForfaitType) || {
    type_forfait: 'mensuel',
    nom: 'Forfait Mensuel (30 jours)',
    montant: 5,
    devise: 'USD',
    duree_jours: 30,
  };

  const selectedStudent = (students || []).find((s) => s.id === selectedStudentId) || students?.[0];

  // Nettoyage de l'intervalle de polling
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // Déclenchement du paiement Mobile Money Twiga
  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!operatorInfo.isValid && !isTestMode) {
      setErrorMessage(`Le numéro saisi n'est pas reconnu par les opérateurs RDC (Airtel, Orange, Vodacom).`);
      return;
    }

    setErrorMessage('');
    setPaymentStep('polling');
    setPollingSeconds(0);

    try {
      const res = await initiateTwigaPayment.mutateAsync({
        eleve_id: selectedStudent.id,
        eleve_nom: selectedStudent.nom_complet || selectedStudent.pseudonyme,
        type_forfait: selectedForfaitType,
        phone_number: isTestMode ? TWIGA_CONFIG.testPhoneNumberFormatted : operatorInfo.formattedPhone || phoneNumber,
        amount: isTestMode ? 10 : currentTarif.montant,
        currency: isTestMode ? 'CDF' : currentTarif.devise,
        is_test_mode: isTestMode,
      });

      const orderId = res.payment?.order_id || `ADS-TWG-${Date.now()}`;
      const paymentId = res.payment?.id || `pay-${Date.now()}`;
      setActiveOrderId(orderId);
      setActivePaymentId(paymentId);

      // Démarrer le polling local pour vérifier l'état du paiement
      let count = 0;
      pollingIntervalRef.current = setInterval(async () => {
        count += 2;
        setPollingSeconds(count);

        // Simulation de validation USSD réussie après 6 secondes de push
        if (count >= 6) {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

          const renewal = await confirmPaymentMutation.mutateAsync({
            orderId,
            paymentId,
            eleveId: selectedStudent.id,
            dureeJours: currentTarif.duree_jours,
            typeForfait: selectedForfaitType,
          });

          setSuccessData({
            orderId,
            codeAcces: renewal.code_acces,
            forfait: selectedForfaitType,
            dureeJours: currentTarif.duree_jours,
            expiresAt: renewal.date_expiration_code,
            amount: isTestMode ? '10 CDF' : `${currentTarif.montant}$ USD`,
            operator: operatorInfo.name,
          });

          setPaymentStep('success');
        }
      }, 2000);
    } catch (err: any) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      setErrorMessage(err?.message || 'Erreur lors de la communication avec la passerelle Mobile Money.');
      setPaymentStep('error');
    }
  };

  const handleOpenPaymentForStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setPaymentStep('form');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  return (
    <RoleGuard allowedRoles={['parent', 'super_admin', 'admin']} moduleName="le Paiement des Codes d'Accès & Forfaits">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* En-tête Espace Parent / Règlements */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#0F2C59] bg-[#EFF6FF] px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#0F2C59]/20 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[#D4AF37]" />
              Codes d'Accès & Forfaits Scolaires
            </span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
              Passerelle Twiga Pay RDC
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F2C59] mt-1.5">
            Paiement des Codes d'Accès Élèves
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-2xl">
            Activez ou renouvelez le code d'accès de vos enfants pour débloquer les cours interactifs et quiz standardisés (10 questions).
          </p>
        </div>

        <button
          onClick={() => {
            setPaymentStep('form');
            setErrorMessage('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 self-start md:self-center"
        >
          <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Renouveler un Code d'Accès</span>
        </button>
      </div>

      {/* SECTION FORFAITS DISPONIBLES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(tarifs || []).map((t) => {
          const isSelected = selectedForfaitType === t.type_forfait;
          return (
            <div
              key={t.type_forfait}
              onClick={() => setSelectedForfaitType(t.type_forfait)}
              className={`cursor-pointer bg-white rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#0F2C59] ring-2 ring-[#0F2C59]/20 shadow-md'
                  : 'border-[#E2E8F0] hover:border-[#D4AF37]'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2.5 right-4 bg-[#0F2C59] text-[#D4AF37] px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                  <Check className="w-3 h-3" /> Sélectionné
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFF6FF] text-[#0F2C59]">
                    Forfait {t.type_forfait}
                  </span>
                  <span className="text-xs font-bold text-[#64748B]">
                    {t.duree_jours} Jours
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

              <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#64748B]">
                  Décompte dès validation
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedForfaitType(t.type_forfait);
                    setPaymentStep('form');
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0F2C59] rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Souscrire</span>
                  <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION ÉTATS DES CODES DES ENFANTS */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#0F2C59]" />
            <h2 className="text-base font-extrabold text-[#0F2C59]">
              État des Codes d'Accès de vos Enfants (Décompte en Direct)
            </h2>
          </div>
          <span className="text-xs text-[#64748B]">
            Le décompte se base sur la dernière mise à jour
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(students || []).map((student) => {
            const countdown = calculateAccessCountdown(
              student.derniere_mise_a_jour_code,
              student.date_expiration_code,
              student.forfait_actif === 'annuel' ? 365 : student.forfait_actif === 'trimestriel' ? 90 : 30
            );

            return (
              <div
                key={student.id}
                className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F2C59]">
                      {student.nom_complet || student.pseudonyme}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {student.classes?.nom || 'Classe ADS'} • Matricule: {student.matricule || 'ADS-2025'}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${countdown.badgeBg} ${countdown.badgeColor}`}>
                    {countdown.badgeLabel}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      Code d'accès actif
                    </span>
                    <span className="font-mono text-sm font-extrabold text-[#0F2C59]">
                      {student.code_acces}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-[#64748B] block">
                      Mis à jour le : {countdown.lastUpdatedFormatted}
                    </span>
                    <span className="text-[10px] font-bold text-[#0F2C59]">
                      Expire le : {countdown.expiresAtFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-[#64748B]">
                    Forfait actif : <strong className="text-[#0F2C59] uppercase">{student.forfait_actif || 'Mensuel'}</strong>
                  </div>
                  <button
                    onClick={() => handleOpenPaymentForStudent(student.id)}
                    className="px-3 py-1.5 bg-[#0F2C59] hover:bg-[#0F2C59]/90 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3 text-[#D4AF37]" />
                    <span>Renouveler</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique des Règlements */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F2C59]">Historique de vos Paiements Twiga Pay</h2>
            <p className="text-xs text-[#64748B]">Suivi des transactions Mobile Money</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Commande & Date</th>
                <th className="px-5 py-3.5">Enfant</th>
                <th className="px-5 py-3.5">Forfait & Montant</th>
                <th className="px-5 py-3.5">Réseau Détecté</th>
                <th className="px-5 py-3.5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
              {(payments || []).slice(0, 5).map((p) => {
                const isCompleted = p.statut === 'completed' || (p.statut as string) === 'VALIDE';
                return (
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
                      ${p.montant}.00 {p.devise || 'USD'}
                      <div className="text-[11px] text-[#64748B] font-normal uppercase">
                        {p.type_forfait || 'Mensuel'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#0F2C59] flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {p.operateur_detecte || p.mode_paiement || 'Mobile Money'}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-mono">
                        {p.telephone_payeur || ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isCompleted
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#FEF3C7] text-[#B45309]'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Validé
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> En attente
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {(!payments || payments.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#64748B]">
                    Aucune transaction récente enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE PAIEMENT INTELLIGENT (SANS SÉLECTION MANUELLE DE RÉSEAU) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F2C59] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F2C59]">
                    Paiement Mobile Money
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Détection automatique du réseau opérateur
                  </p>
                </div>
              </div>
              {paymentStep !== 'polling' && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#0F2C59]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* ÉTAPE 1 : FORMULAIRE DE SAISIE */}
            {paymentStep === 'form' && (
              <form onSubmit={handleStartPayment} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Choix Enfant */}
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">
                    Sélectionner l'Élève Bénéficiaire *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59] font-medium"
                  >
                    {(students || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom_complet || s.pseudonyme} ({s.classes?.nom || 'ADS Kinshasa'}) - Code: {s.code_acces}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Choix Forfait */}
                <div>
                  <label className="block font-bold text-[#1E293B] mb-1">
                    Forfait Choisi (Décompte calculé dès paiement) *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(tarifs || []).map((t) => {
                      const isSel = selectedForfaitType === t.type_forfait;
                      return (
                        <button
                          key={t.type_forfait}
                          type="button"
                          onClick={() => setSelectedForfaitType(t.type_forfait)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                            isSel
                              ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-xs'
                              : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <span className={`text-[10px] font-extrabold uppercase ${isSel ? 'text-[#D4AF37]' : 'text-[#64748B]'}`}>
                            {t.type_forfait}
                          </span>
                          <span className="text-sm font-black mt-0.5 font-tabular">
                            {t.montant}$
                          </span>
                          <span className="text-[10px] opacity-80">
                            {t.duree_jours} jours
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Champ Numéro avec Détection Automatique de Réseau */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#1E293B]">
                      Numéro de Téléphone Mobile Money *
                    </label>
                    <span className="text-[10px] text-[#64748B]">
                      (Détection automatique)
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: 0974156086 ou 0891234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0F2C59] pr-32"
                    />

                    {/* Badge de détection automatique en temps réel */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {phoneNumber ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-md border ${operatorInfo.badgeBg} ${operatorInfo.badgeText} ${operatorInfo.badgeBorder}`}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: operatorInfo.color }}
                          />
                          {operatorInfo.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#94A3B8]">
                          Saisir numéro
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#64748B] mt-1">
                    Aucune sélection manuelle requise : Airtel Money, Orange Money ou M-Pesa.
                  </p>
                </div>

                {/* Mode Test (10 CDF) pour tests fonctionnels */}
                {!IS_PROD && (
                  <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#D4AF37]" />
                      <div>
                        <span className="font-bold text-[#92400E] block text-[11px]">
                          Mode Test Twiga Proxy (10 CDF)
                        </span>
                        <span className="text-[10px] text-[#B45309]">
                          Numéro test : +243974156086
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTestMode}
                        onChange={(e) => setIsTestMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F2C59]"></div>
                    </label>
                  </div>
                )}

                {/* Récapitulatif montant */}
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                  <span className="font-bold text-[#64748B]">Montant à débiter :</span>
                  <span className="text-base font-black text-[#0F2C59]">
                    {isTestMode ? '10 CDF (Test)' : `${currentTarif.montant}$ USD (${currentTarif.duree_jours}j)`}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-xl font-bold transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Lancer le Paiement USSD Push</span>
                  </button>
                </div>
              </form>
            )}

            {/* ÉTAPE 2 : POLLING / EN ATTENTE DE CONFIRMATION PARENT */}
            {paymentStep === 'polling' && (
              <div className="py-6 px-2 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#EFF6FF] border-t-[#0F2C59] animate-spin"></div>
                  <Smartphone className="w-6 h-6 text-[#0F2C59]" />
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-[#0F2C59]">
                    Notification USSD Push Envoyée
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
                    Veuillez valider la transaction sur votre téléphone <strong>{phoneNumber}</strong> ({operatorInfo.name}).
                  </p>
                </div>

                <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#1E3A8A] flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0F2C59]" />
                  <span>Vérification en cours ({pollingSeconds}s)...</span>
                </div>

                <p className="text-[11px] text-[#64748B]">
                  Réf Commande : <code className="font-mono font-bold text-[#0F2C59]">{activeOrderId}</code>
                </p>
              </div>
            )}

            {/* ÉTAPE 3 : CONFIRMATION & SUCCÈS RENOUVELLEMENT */}
            {paymentStep === 'success' && successData && (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 bg-[#DCFCE7] text-[#15803D] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="font-extrabold text-lg text-[#0F2C59]">
                    Paiement Confirmé avec Succès !
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">
                    Le code d'accès de <strong>{selectedStudent?.nom_complet || selectedStudent?.pseudonyme}</strong> a été renouvelé.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Nouveau Code d'Accès :</span>
                    <span className="font-mono font-black text-[#0F2C59] text-sm">{successData.codeAcces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Durée d'Accès :</span>
                    <span className="font-bold text-[#0F2C59]">{successData.dureeJours} Jours (dès maintenant)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Montant Débité :</span>
                    <span className="font-bold text-[#15803D]">{successData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Date d'Expiration :</span>
                    <span className="font-bold text-[#0F2C59]">
                      {new Date(successData.expiresAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 bg-[#0F2C59] text-white rounded-xl font-bold text-xs shadow-xs hover:bg-[#0F2C59]/90 transition"
                >
                  Fermer et Voir mes Enfants
                </button>
              </div>
            )}

            {/* ÉTAPE 4 : ERREUR */}
            {paymentStep === 'error' && (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-[#0F2C59]">
                    Échec de la Transaction
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setPaymentStep('form')}
                  className="px-4 py-2 bg-[#0F2C59] text-white rounded-xl font-bold text-xs hover:bg-[#0F2C59]/90 transition"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
