// src/hooks/use-chapters.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface ChapterItem {
    id: string;
    cours_id: string;
    titre: string;
    contenu_html?: string;
    ordre?: number;
    created_at?: string;
}

export function useChapter(id: string) {
    const supabase = getSupabaseBrowserClient();

    return useQuery({
        queryKey: ['chapter', id],
        queryFn: async (): Promise<ChapterItem | null> => {
            if (!id) return null;

            const { data, error } = await supabase
                .from('chapitres')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching chapter:', error.message);
                return null;
            }

            return data;
        },
        enabled: !!id,
    });
}

export function useCreateChapter() {
    const queryClient = useQueryClient();
    const supabase = getSupabaseBrowserClient();

    return useMutation({
        mutationFn: async (payload: {
            cours_id: string;
            titre: string;
            contenu_html?: string;
            ordre?: number;
        }) => {
            const { data, error } = await supabase
                .from('chapitres')
                .insert([payload])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['chapters', variables.cours_id] });
        },
    });
}

export function useUpdateChapter() {
    const queryClient = useQueryClient();
    const supabase = getSupabaseBrowserClient();

    return useMutation({
        mutationFn: async (payload: {
            id: string;
            titre: string;
            contenu_html?: string;
            ordre?: number;
        }) => {
            const { data, error } = await supabase
                .from('chapitres')
                .update({
                    titre: payload.titre,
                    contenu_html: payload.contenu_html,
                    ordre: payload.ordre,
                })
                .eq('id', payload.id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['chapter', data.id] });
        },
    });
}