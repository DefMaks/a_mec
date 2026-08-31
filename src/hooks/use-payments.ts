import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Paiement } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';
import { renewAccessCode } from '@/lib/access-code-utils';

const LOCAL_PAYMENTS_KEY = 'ads_payments_history_v1';

export function usePayments(statusFilter?: string, isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['payments', statusFilter, isSuperAdmin],
    queryFn: async () => {
      let remotePayments: Paiement[] = [];

      try {
        let query = supabase
          .from('paiements')
          .select('*');

        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('statut', statusFilter);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          remotePayments = data.map((p: any) => ({
            ...p,
            created_at: p.created_at || p.date_paiement || p.date || new Date().toISOString(),
            eleve: p.eleve || {
              id: p.eleve_id,
              pseudonyme: p.eleve_nom || 'Élève Inscrit',
              nom_complet: p.eleve_nom || 'Élève Inscrit',
            },
            parent: p.parent || {
              id: p.parent_id,
              nom_complet: p.parent_nom || 'Parent Référent',
            },
          }));
        }
      } catch (err: any) {
        console.warn('Erreur récupération paiements Supabase:', err?.message);
      }

      // Fusion avec l'historique local (pour les paiements récents Twiga)
      let localPayments: Paiement[] = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_PAYMENTS_KEY);
        if (stored) {
          try {
            localPayments = JSON.parse(stored);
          } catch {}
        }
      }

      // Fusion unique par order_id / id
      const allPaymentsMap = new Map<string, Paiement>();
      [...remotePayments, ...localPayments].forEach((p) => {
        const key = p.order_id || p.id;
        if (key && !allPaymentsMap.has(key)) {
          allPaymentsMap.set(key, p);
        }
      });

      let combined = Array.from(allPaymentsMap.values());

      if (statusFilter && statusFilter !== 'all') {
        combined = combined.filter((p) => p.statut === statusFilter);
      }

      return combined.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    },
  });
}

export function useInitiateTwigaPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      eleve_id: string;
      eleve_nom?: string;
      parent_id?: string;
      type_forfait: 'mensuel' | 'trimestriel' | 'annuel';
      phone_number: string;
      amount?: number;
      currency?: string;
      is_test_mode?: boolean;
    }) => {
      const response = await fetch('/api/payments/twiga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Échec de l initiation du paiement Twiga Mobile Money');
      }

      // Enregistrer dans le cache local
      if (typeof window !== 'undefined' && data.payment) {
        const stored = localStorage.getItem(LOCAL_PAYMENTS_KEY);
        const existing: Paiement[] = stored ? JSON.parse(stored) : [];
        existing.unshift(data.payment);
        localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(existing));
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useConfirmPaymentAndRenewCode() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (payload: {
      paymentId?: string;
      orderId: string;
      eleveId: string;
      dureeJours?: number;
      typeForfait?: 'mensuel' | 'trimestriel' | 'annuel';
    }) => {
      const durationDays = payload.dureeJours || (payload.typeForfait === 'annuel' ? 365 : payload.typeForfait === 'trimestriel' ? 90 : 30);
      const renewal = renewAccessCode(durationDays);

      // 1. Mettre à jour le statut du paiement en local
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_PAYMENTS_KEY);
        if (stored) {
          const existing: Paiement[] = JSON.parse(stored);
          const updated = existing.map((p) =>
            p.order_id === payload.orderId || p.id === payload.paymentId
              ? { ...p, statut: 'completed' as const }
              : p
          );
          localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(updated));
        }

        // Mettre à jour le code de l'élève en local
        const studentStorageKey = `ads_student_code_${payload.eleveId}`;
        localStorage.setItem(studentStorageKey, JSON.stringify({
          ...renewal,
          forfait_actif: payload.typeForfait || 'mensuel',
        }));
      }

      // 2. Mettre à jour Supabase si possible
      try {
        await supabase
          .from('eleves')
          .update({
            code_acces: renewal.code_acces,
            code_acces_actif: true,
            derniere_mise_a_jour_code: renewal.derniere_mise_a_jour_code,
            date_expiration_code: renewal.date_expiration_code,
          })
          .eq('id', payload.eleveId);
      } catch (e) {
        console.warn('Mise à jour Supabase eleve non bloquante:', e);
      }

      return renewal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (payload: {
      eleve_id: string;
      montant: number;
      devise?: string;
      mode_paiement?: string;
      numero_telephone?: string;
    }) => {
      const orderId = `ADS-PAY-${Date.now().toString().slice(-6)}`;
      const insertData = {
        order_id: orderId,
        eleve_id: payload.eleve_id,
        montant: payload.montant,
        devise: payload.devise || 'USD',
        mode_paiement: payload.mode_paiement || 'orange_money',
        numero_telephone: payload.numero_telephone || '',
        statut: 'completed',
      };

      try {
        const { data, error } = await supabase
          .from('paiements')
          .insert([insertData])
          .select()
          .single();

        if (!error && data) return data;
      } catch (e) {}

      const localRecord = {
        id: `pay-${Date.now()}`,
        ...insertData,
        created_at: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_PAYMENTS_KEY);
        const existing: Paiement[] = stored ? JSON.parse(stored) : [];
        existing.unshift(localRecord as any);
        localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(existing));
      }

      return localRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      paymentId,
      statut,
      status,
    }: {
      id?: string;
      paymentId?: string;
      statut?: string;
      status?: string;
    }) => {
      const targetId = id || paymentId;
      const targetStatus = (statut || status || 'completed') as any;
      if (!targetId) throw new Error('Missing payment ID');

      try {
        await supabase
          .from('paiements')
          .update({ statut: targetStatus })
          .eq('id', targetId);
      } catch {}

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_PAYMENTS_KEY);
        if (stored) {
          const existing: Paiement[] = JSON.parse(stored);
          const updated = existing.map((p) =>
            p.id === targetId || p.order_id === targetId ? { ...p, statut: targetStatus } : p
          );
          localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(updated));
        }
      }

      return { id: targetId, statut: targetStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}
