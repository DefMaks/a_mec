"use client";

import React, { useState } from 'react';
import { usePayments, useUpdatePaymentStatus } from '@/hooks/use-payments';

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: payments, isLoading } = usePayments(statusFilter);
  const updateStatusMutation = useUpdatePaymentStatus();

  const handleStatusChange = async (paymentId: string, status: 'completed' | 'failed' | 'cancelled') => {
    await updateStatusMutation.mutateAsync({ paymentId, status });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suivi Financier & Paiements Twiga Paie</h1>
          <p className="text-slate-500 text-sm">Historique des transactions Mobile Money (M-Pesa, Orange Money, Airtel Money)</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {['all', 'pending', 'completed', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'Tous' : st === 'pending' ? 'En attente' : st === 'completed' ? 'Validés' : 'Échoués'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Chargement des transactions...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Parent / Payeur</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Mode & Réf</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payments?.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                    {p.order_id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{p.parent?.nom_complet || 'Parent inconnu'}</div>
                    <div className="text-xs text-slate-400">{p.parent?.telephone || '—'}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {p.montant} {p.devise || '$'}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="font-semibold text-slate-700">{p.mode_paiement || 'Mobile Money'}</div>
                    <div className="font-mono text-slate-400">{p.reference_twiga || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.statut === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.statut === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {p.statut === 'completed' ? 'Validé' : p.statut === 'pending' ? 'En attente' : 'Échoué'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.statut === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(p.id, 'completed')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                      >
                        Valider
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {(!payments || payments.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
