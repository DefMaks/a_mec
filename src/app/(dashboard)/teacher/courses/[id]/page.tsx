// src/app/(dashboard)/teacher/courses/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { TiptapEditor } from '@/components/ui/tiptap-editor';

export interface ChapterItem {
    id: string;
    cours_id: string;
    titre: string;
    contenu_html?: string;
    ordre?: number;
    created_at?: string;
}

export interface CourseDetail {
    id: string;
    titre: string;
    matiere_nom?: string;
    created_at?: string;
    chapitres: ChapterItem[];
}

export default function TeacherCourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const courseId = params?.id as string;
    const supabase = getSupabaseBrowserClient();

    // Gestion des leçons ouvertes en mode lecture et en mode édition
    const [openChapterId, setOpenChapterId] = useState<string | null>(null);
    const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

    // État local du formulaire d'édition
    const [editTitre, setEditTitre] = useState('');
    const [editOrdre, setEditOrdre] = useState(1);
    const [editContenuHtml, setEditContenuHtml] = useState('');

    // Récupération du cours et de ses leçons
    const { data: course, isLoading, isError } = useQuery({
        queryKey: ['teacher-course-detail', courseId],
        queryFn: async (): Promise<CourseDetail | null> => {
            if (!courseId) return null;

            const { data, error } = await supabase
                .from('cours')
                .select(`
          id,
          titre,
          created_at,
          matiere:matiere_id ( id, nom ),
          chapitres (
            id,
            cours_id,
            titre,
            contenu_html,
            ordre,
            created_at
          )
        `)
                .eq('id', courseId)
                .single();

            if (error) {
                console.error('Error fetching course details:', error.message);
                return null;
            }

            const sortedChapitres = (data.chapitres || []).sort(
                (a: ChapterItem, b: ChapterItem) => (a.ordre || 0) - (b.ordre || 0)
            );

            return {
                id: data.id,
                titre: data.titre,
                matiere_nom: (data.matiere as any)?.nom || 'Matière non définie',
                created_at: data.created_at,
                chapitres: sortedChapitres,
            };
        },
        enabled: !!courseId,
    });

    // Mutation de mise à jour d'un chapitre
    const updateChapterMutation = useMutation({
        mutationFn: async (payload: { id: string; titre: string; ordre: number; contenu_html: string }) => {
            const { data, error } = await supabase
                .from('chapitres')
                .update({
                    titre: payload.titre,
                    ordre: payload.ordre,
                    contenu_html: payload.contenu_html,
                })
                .eq('id', payload.id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher-course-detail', courseId] });
            setEditingChapterId(null);
        },
    });

    const toggleChapterView = (chap: ChapterItem) => {
        if (editingChapterId) return; // Empêcher la bascule si une édition est en cours
        setOpenChapterId((prev) => (prev === chap.id ? null : chap.id));
    };

    const startEditing = (chap: ChapterItem) => {
        setEditingChapterId(chap.id);
        setOpenChapterId(chap.id);
        setEditTitre(chap.titre || '');
        setEditOrdre(chap.ordre || 1);
        setEditContenuHtml(chap.contenu_html || '');
    };

    const handleSaveChapter = async (e: React.FormEvent, chapterId: string) => {
        e.preventDefault();
        if (!editTitre.trim()) return;

        await updateChapterMutation.mutateAsync({
            id: chapterId,
            titre: editTitre,
            ordre: editOrdre,
            contenu_html: editContenuHtml,
        });
    };

    if (isLoading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                Chargement du cours et de ses leçons...
            </div>
        );
    }

    if (isError || !course) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-red-400 space-y-4">
                <p>Cours introuvable ou erreur de chargement.</p>
                <button
                    onClick={() => router.push('/teacher/courses')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm transition"
                >
                    &larr; Retourner à la liste des cours
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-lg">
                            {course.matiere_nom}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>📚</span> {course.titre}
                    </h1>
                    <p className="text-sm text-slate-400">
                        Programme pédagogique comprenant <span className="text-teal-400 font-semibold">{course.chapitres.length} leçon(s)</span>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/teacher/courses"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition"
                    >
                        &larr; Tous les cours
                    </Link>
                    <Link
                        href={`/teacher/chapters/new?cours_id=${course.id}`}
                        className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2"
                    >
                        <span>➕</span> Ajouter une Leçon
                    </Link>
                </div>
            </div>

            {/* Chapters / Lessons List */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>📖</span> Sommaire des Leçons & Chapitres
                    </h2>
                    <span className="text-xs bg-slate-800 text-slate-300 font-medium px-3 py-1 rounded-lg">
                        {course.chapitres.length} Chapitres publiés
                    </span>
                </div>

                {course.chapitres.length === 0 ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-4">
                        <p className="text-sm">Aucune leçon n&apos;a encore été rédigée pour ce cours.</p>
                        <Link
                            href={`/teacher/chapters/new?cours_id=${course.id}`}
                            className="inline-block bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
                        >
                            Créer la Leçon #1
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {course.chapitres.map((chap, index) => {
                            const isOpen = openChapterId === chap.id;
                            const isEditing = editingChapterId === chap.id;

                            return (
                                <div
                                    key={chap.id}
                                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition"
                                >
                                    {/* Item Header / Bar */}
                                    <div
                                        onClick={() => toggleChapterView(chap)}
                                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/60 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                                {chap.ordre || index + 1}
                                            </span>
                                            <h3 className="font-semibold text-white text-base">
                                                {chap.titre}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-3 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                                            {!isEditing && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleChapterView(chap)}
                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                                    >
                                                        {isOpen ? 'Masquer 👁️' : 'Lire la leçon 📖'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(chap)}
                                                        className="bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                                                    >
                                                        <span>✏️</span> Éditer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Area: View or Inline Edit */}
                                    {isOpen && (
                                        <div className="border-t border-slate-800 p-5 bg-slate-900/40 space-y-4">
                                            {isEditing ? (
                                                /* Mode Édition */
                                                <form onSubmit={(e) => handleSaveChapter(e, chap.id)} className="space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                        <div className="sm:col-span-3">
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                                Titre de la leçon
                                                            </label>
                                                            <input
                                                                type="text"
                                                                required
                                                                value={editTitre}
                                                                onChange={(e) => setEditTitre(e.target.value)}
                                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                                Ordre
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={editOrdre}
                                                                onChange={(e) => setEditOrdre(Number(e.target.value))}
                                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-teal-400 mb-2">
                                                            Contenu de la Leçon (TipTap)
                                                        </label>
                                                        <TiptapEditor
                                                            key={`edit-${chap.id}`}
                                                            content={editContenuHtml}
                                                            onChange={(html) => setEditContenuHtml(html)}
                                                            placeholder="Redigez le contenu enrichi de la leçon..."
                                                        />
                                                    </div>

                                                    <div className="flex justify-end gap-3 pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingChapterId(null)}
                                                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                                                        >
                                                            Annuler
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={updateChapterMutation.isPending}
                                                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 text-xs rounded-xl transition shadow-md"
                                                        >
                                                            {updateChapterMutation.isPending ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                /* Mode Lecture */
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                                                        <span className="text-xs font-semibold text-teal-400">
                                                            Aperçu du cours transmis aux élèves
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditing(chap)}
                                                            className="text-xs font-medium text-teal-400 hover:underline flex items-center gap-1"
                                                        >
                                                            <span>✏️</span> Modifier ce contenu
                                                        </button>
                                                    </div>

                                                    {chap.contenu_html ? (
                                                        <div
                                                            className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: chap.contenu_html }}
                                                        />
                                                    ) : (
                                                        <p className="text-xs text-slate-500 italic">
                                                            Cette leçon n&apos;a pas encore de contenu rédigé. Cliquez sur &quot;Éditer&quot; pour ajouter le texte du cours.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}