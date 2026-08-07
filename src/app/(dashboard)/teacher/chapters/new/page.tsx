// src/app/(dashboard)/teacher/chapters/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateChapter } from '@/hooks/use-chapters';
import { TiptapEditor } from '@/components/ui/tiptap-editor';

export default function NewChapterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const coursId = searchParams.get('cours_id');

    const createChapterMutation = useCreateChapter();

    const [titre, setTitre] = useState('');
    const [ordre, setOrdre] = useState(1);
    const [contenuHtml, setContenuHtml] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!coursId) {
            setFormError('Aucun cours parent sélectionné.');
            return;
        }

        if (!titre.trim()) {
            setFormError('Veuillez saisir le titre de la leçon/chapitre.');
            return;
        }

        try {
            await createChapterMutation.mutateAsync({
                cours_id: coursId,
                titre,
                ordre,
                contenu_html: contenuHtml,
            });
            router.push('/teacher/courses');
        } catch (err: any) {
            setFormError(err?.message || 'Erreur lors de la création de la leçon.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>📖</span> Nouvelle Leçon / Chapitre
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Rédigez le contenu pédagogique de votre cours avec du texte, des images et des formules.
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                    &larr; Retour
                </button>
            </div>

            {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium">
                    ⚠️ {formError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Titre du Chapitre / Leçon
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Chapitre 1 - Introduction aux Alcènes"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Ordre de la leçon
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={ordre}
                            onChange={(e) => setOrdre(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-teal-400 mb-2">
                        Contenu du cours (Éditeur Tiptap)
                    </label>
                    <TiptapEditor
                        content={contenuHtml}
                        onChange={(html) => setContenuHtml(html)}
                        placeholder="Rédigez la leçon, insérez des schémas, illustrations, démonstrations..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={createChapterMutation.isPending}
                        className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2.5 text-sm rounded-xl transition shadow-lg flex items-center gap-2"
                    >
                        <span>💾</span> {createChapterMutation.isPending ? 'Enregistrement...' : 'Enregistrer la leçon'}
                    </button>
                </div>
            </form>
        </div>
    );
}