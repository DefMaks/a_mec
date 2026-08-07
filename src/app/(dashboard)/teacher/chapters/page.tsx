// src/app/(dashboard)/teacher/chapters/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface ChapterDetail {
    id: string;
    cours_id: string;
    titre: string;
    contenu_html?: string;
    ordre?: number;
    created_at?: string;
    cours_titre?: string;
}

function ChaptersListContent() {
    const searchParams = useSearchParams();
    const filterCoursId = searchParams.get('cours_id');
    const supabase = getSupabaseBrowserClient();

    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all chapters with optional cours_id filtering
    const { data: chapters, isLoading } = useQuery({
        queryKey: ['chapters-list', filterCoursId],
        queryFn: async (): Promise<ChapterDetail[]> => {
            let query = supabase
                .from('chapitres')
                .select(`
          id,
          cours_id,
          titre,
          contenu_html,
          ordre,
          created_at,
          cours:cours_id ( titre )
        `)
                .order('ordre', { ascending: true });

            if (filterCoursId) {
                query = query.eq('cours_id', filterCoursId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching chapters:', error.message);
                return [];
            }

            return (data || []).map((item: any) => ({
                id: item.id,
                cours_id: item.cours_id,
                titre: item.titre,
                contenu_html: item.contenu_html,
                ordre: item.ordre || 1,
                created_at: item.created_at,
                cours_titre: item.cours?.titre || 'Cours non défini',
            }));
        },
    });

    const filteredChapters = (chapters || []).filter((chap) =>
        chap.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chap.cours_titre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>📖</span> Leçons & Chapitres Pédagogiques
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Gérez et éditez les contenus riches (TipTap) de vos leçons dispensées aux élèves.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/teacher/courses"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition"
                    >
                        &larr; Voir tous les cours
                    </Link>
                    {filterCoursId && (
                        <Link
                            href={`/teacher/chapters/new?cours_id=${filterCoursId}`}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2"
                        >
                            <span>➕</span> Nouvelle Leçon
                        </Link>
                    )}
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Rechercher une leçon ou un cours..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
            </div>

            {/* Chapters Table / List */}
            {isLoading ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                    Chargement des leçons...
                </div>
            ) : filteredChapters.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                    <p>Aucune leçon trouvée pour le moment.</p>
                    {filterCoursId && (
                        <Link
                            href={`/teacher/chapters/new?cours_id=${filterCoursId}`}
                            className="inline-block bg-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                        >
                            Créer la première leçon
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredChapters.map((chapter) => (
                        <div
                            key={chapter.id}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-sm"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                                        Leçon #{chapter.ordre}
                                    </span>
                                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                                        {chapter.cours_titre}
                                    </span>
                                </div>
                                <h3 className="font-bold text-white text-base leading-snug">
                                    {chapter.titre}
                                </h3>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <Link
                                    href={`/teacher/chapters/${chapter.id}/edit`}
                                    className="bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                                >
                                    <span>✏️</span> Éditer la leçon (TipTap)
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ChaptersPage() {
    return (
        <Suspense
            fallback={
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                    Chargement de l&apos;espace leçons...
                </div>
            }
        >
            <ChaptersListContent />
        </Suspense>
    );
}