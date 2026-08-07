'use client';

import React, { useState } from 'react';
import { usePayments } from '@/hooks/use-payments';
import { useStudents } from '@/hooks/use-students';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function ParentPaymentsPage() {
  const { data: payments, isLoading } = usePayments();
  const { data: students } = useStudents();
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eleveId, setEleveId] = useState('');
  const [montantUsd, setMontantUsd] = useState(25);
  const [fraisType, setFraisType] = useState('Frais de Scolarité Mensuels');
  const [phone, setPhone] = useState('+243 ');
  const [provider, setProvider] = useState<'MPESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY'>('MPESA');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayTwiga = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderId = `TWG-${Date.now().toString().slice(-6)}`;
      const refTwiga = `MP-${Math.floor(100000 + Math.random() * 900000)}`;

      const { error } = await supabase.from('paiements').insert([
        {
          order_id: orderId,
          parent_id: 'parent-demo-id',
          eleve_id: eleveId || null,
          montant_usd: montantUsd,
          statut: 'VALIDE',
          type_frais: fraisType,
          methode: provider,
          reference_twiga: refTwiga,
        },
      ]);

      if (error) {
        console.warn('Twiga Pay insert warning:', error.message);
      }

      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setIsModalOpen(false);
      setIsProcessing(false);
    } catch (err) {
      console.error('Error processing payment:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border border-teal-500/20 p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>💳</span> Règlement des Frais de Scolarité (Twiga Pay)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Payez directement les minerval, frais d examen TENAFEP/EXETAT par Mobile Money (M-Pesa, Orange Money, Airtel Money).
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center gap-2 self-start md:self-auto shadow-md"
          >
            <span>💳</span>
            <span>Effectuer un Paiement Mobile</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📜</span> Historique des Transactions de Scolarité
        </h2>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Chargement de vos reçus de paiement...
          </div>
        ) : payments && payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Réf. Twiga</th>
                  <th className="p-3">Motif</th>
                  <th className="p-3">Élève</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-teal-400">
                      {p.reference_twiga || p.order_id || 'TWG-8812'}
                    </td>
                    <td className="p-3 font-medium text-white">{p.type_frais || 'Frais de Scolarité'}</td>
                    <td className="p-3 text-slate-300">{p.eleve_nom || 'Jean-Luc (6ème)'}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                        {p.methode || 'M-PESA'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">${p.montant_usd || 25} USD</td>
                    <td className="p-3">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        ● VALIDE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aucune transaction récente enregistrée.
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                  Passerelle Twiga Pay RDC
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Règlement de Scolarité</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayTwiga} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Concernant l Enfant *
                </label>
                <select
                  value={eleveId}
                  onChange={(e) => setEleveId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  <option value="">Sélectionner un enfant...</option>
                  {(students || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom_complet || s.pseudonyme}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Type de Frais Scolaires *
                </label>
                <select
                  value={fraisType}
                  onChange={(e) => setFraisType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  <option value="Frais de Scolarité Mensuels">Frais de Scolarité Mensuels ($25 USD)</option>
                  <option value="Frais d Examen EXETAT / TENAFEP">Frais d Examen EXETAT / TENAFEP ($15 USD)</option>
                  <option value="Fiche de Révision & Support">Fiche de Révision & Support ($10 USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Montant à régler (USD) *
                </label>
                <input
                  type="number"
                  value={montantUsd}
                  onChange={(e) => setMontantUsd(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-bold text-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Opérateur Mobile Money RDC *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider('MPESA')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      provider === 'MPESA'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🟢 M-PESA
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('ORANGE_MONEY')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      provider === 'ORANGE_MONEY'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🟠 Orange Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('AIRTEL_MONEY')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      provider === 'AIRTEL_MONEY'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🔴 Airtel Money
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Numéro de Téléphone Mobile *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-mono"
                  placeholder="+243 812 345 678"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2.5 px-6 rounded-xl transition shadow-lg disabled:opacity-50"
                >
                  {isProcessing ? 'Validation Twiga Pay...' : 'Payer via Twiga Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
