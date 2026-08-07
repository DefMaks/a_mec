import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Paiement } from '@/types/database.types';
import { DEFAULT_SCHOOL_ID } from '@/lib/config';

export function usePayments(statusFilter?: string, isSuperAdmin: boolean = false) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['payments', statusFilter, isSuperAdmin, DEFAULT_SCHOOL_ID],
    queryFn: async () => {
      let query = supabase
        .from('paiements')
        .select('*, parent(*), eleve(*)')
        .order('created_at', { ascending: false });

      if (DEFAULT_SCHOOL_ID && !isSuperAdmin) {
        query = query.eq('ecole_id', DEFAULT_SCHOOL_ID);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Fallback local payments:', error.message);
        return [] as Paiement[];
      }

      return data as Paiement[];
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: 'VALIDE' | 'REJETE' | 'EN_ATTENTE' }) => {
      const { data, error } = await supabase
        .from('paiements')
        .update({ statut })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}
