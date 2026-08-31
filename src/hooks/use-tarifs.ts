import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { TarifCodeAcces } from '@/types/database.types';

export const DEFAULT_TARIFS: TarifCodeAcces[] = [
  {
    id: 'tarif-mensuel',
    type_forfait: 'mensuel',
    nom: 'Forfait Mensuel (30 jours)',
    montant: 5,
    devise: 'USD',
    duree_jours: 30,
    actif: true,
    description: 'Accès complet aux cours, leçons et quiz standardisés (10 Qs) pendant 1 mois.',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'tarif-trimestriel',
    type_forfait: 'trimestriel',
    nom: 'Forfait Trimestriel (90 jours)',
    montant: 10,
    devise: 'USD',
    duree_jours: 90,
    actif: true,
    description: 'Accès illimité pour l ensemble d un trimestre scolaire avec suivi pédagogique.',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'tarif-annuel',
    type_forfait: 'annuel',
    nom: 'Forfait Annuel (365 jours)',
    montant: 15,
    devise: 'USD',
    duree_jours: 365,
    actif: true,
    description: 'Accès complet garanti pour toute l année scolaire 2025-2026 et préparation EXETAT.',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const LOCAL_TARIFS_STORAGE_KEY = 'ads_tarifs_codes_acces_v1';

export function useTarifs() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['tarifs_codes_acces'],
    queryFn: async () => {
      // 1. Essayer de récupérer depuis Supabase
      try {
        const { data, error } = await supabase
          .from('tarifs_codes_acces')
          .select('*')
          .order('montant', { ascending: true });

        if (!error && data && data.length > 0) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_TARIFS_STORAGE_KEY, JSON.stringify(data));
          }
          return data as TarifCodeAcces[];
        }
      } catch (err) {
        console.warn('Table tarifs_codes_acces non disponible sur Supabase, utilisation du cache/défaut:', err);
      }

      // 2. Fallback localStorage
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(LOCAL_TARIFS_STORAGE_KEY);
        if (cached) {
          try {
            return JSON.parse(cached) as TarifCodeAcces[];
          } catch {}
        }
      }

      return DEFAULT_TARIFS;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateTarif() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (updatedTarif: {
      type_forfait: 'mensuel' | 'trimestriel' | 'annuel';
      montant: number;
      devise?: 'USD' | 'CDF';
      nom?: string;
      duree_jours?: number;
      description?: string;
    }) => {
      // 1. Mise à jour Supabase si possible
      try {
        const { data, error } = await supabase
          .from('tarifs_codes_acces')
          .update({
            montant: updatedTarif.montant,
            devise: updatedTarif.devise || 'USD',
            nom: updatedTarif.nom,
            duree_jours: updatedTarif.duree_jours,
            description: updatedTarif.description,
            updated_at: new Date().toISOString(),
          })
          .eq('type_forfait', updatedTarif.type_forfait)
          .select();

        if (error) {
          console.warn('Erreur update Supabase tarifs, tentative upsert:', error.message);
          await supabase
            .from('tarifs_codes_acces')
            .upsert(
              {
                type_forfait: updatedTarif.type_forfait,
                montant: updatedTarif.montant,
                devise: updatedTarif.devise || 'USD',
                nom: updatedTarif.nom,
                duree_jours: updatedTarif.duree_jours,
                description: updatedTarif.description,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'type_forfait' }
            );
        }
      } catch (e) {
        console.warn('Exception update/upsert tarifs:', e);
      }

      // 2. Mise à jour locale persistante
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(LOCAL_TARIFS_STORAGE_KEY);
        let currentTarifs: TarifCodeAcces[] = cached ? JSON.parse(cached) : [...DEFAULT_TARIFS];

        const index = currentTarifs.findIndex((t) => t.type_forfait === updatedTarif.type_forfait);
        if (index >= 0) {
          currentTarifs[index] = {
            ...currentTarifs[index],
            ...updatedTarif,
            updated_at: new Date().toISOString(),
          };
        } else {
          currentTarifs.push({
            id: `tarif-${updatedTarif.type_forfait}`,
            nom: updatedTarif.nom || `Forfait ${updatedTarif.type_forfait}`,
            montant: updatedTarif.montant,
            devise: updatedTarif.devise || 'USD',
            duree_jours: updatedTarif.duree_jours || 30,
            type_forfait: updatedTarif.type_forfait,
            actif: true,
            description: updatedTarif.description || '',
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });
        }

        localStorage.setItem(LOCAL_TARIFS_STORAGE_KEY, JSON.stringify(currentTarifs));
      }

      return updatedTarif;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifs_codes_acces'] });
    },
  });
}
