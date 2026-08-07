// src/app/(dashboard)/teacher/courses/[id]/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

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
    const courseId = params?.id as string;
    const supabase = getSupabaseBrowserClient();

    // Fetch specific course and its associated chapters ordered by 'ordre'
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

            // Sort chapters by order
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

            {/* Chapters / Lessons Section */}
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
                    <div className="space-y-3">
                        {course.chapitres.map((chap, index) => (
                            <div
                                key={chap.id}
                                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                                        {chap.ordre || index + 1}
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-white text-base">
                                            {chap.titre}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <Link
                                        href={`/teacher/chapters/${chap.id}/edit`}
                                        className="bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                                    >
                                        <span>✏️</span> Éditer la leçon (TipTap)
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}