import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Paiement } from '@/types/database.types';

export function usePayments(statusFilter?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['payments', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('paiements')
        .select('*, parent(*), eleve(*)')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('statut', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Paiement[];
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: 'completed' | 'failed' | 'cancelled' }) => {
      const { data, error } = await supabase
        .from('paiements')
        .update({ statut: status })
        .eq('id', paymentId)
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
