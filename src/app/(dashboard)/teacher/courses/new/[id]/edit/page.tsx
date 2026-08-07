// src/app/(dashboard)/teacher/courses/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCourse, useUpdateCourse } from '@/hooks/use-courses';
import { TiptapEditor } from '@/components/ui/tiptap-editor';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const { data: course, isLoading, isError } = useCourse(courseId);
    const updateCourseMutation = useUpdateCourse();

    const [titre, setTitre] = useState('');
    const [classe, setClasse] = useState('6ème Math-Physique');
    const [matiere, setMatiere] = useState('Mathématiques');
    const [description, setDescription] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    // Pré-remplissage du formulaire lors du chargement des données
    useEffect(() => {
        if (course) {
            setTitre(course.titre || '');
            setMatiere(course.matiere_nom || 'Mathématiques');
            setClasse(course.classe || '6ème Math-Physique');
            setDescription(course.description || '');
        }
    }, [course]);

    const handleSubmitCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!titre.trim()) {
            setFormError('Veuillez saisir le titre du cours.');
            return;
        }

        try {
            await updateCourseMutation.mutateAsync({
                id: courseId,
                titre,
            });
            router.push('/teacher/courses');
        } catch (err: any) {
            setFormError(err?.message || 'Erreur lors de la mise à jour du cours.');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                Chargement des données du cours...
            </div>
        );
    }

    if (isError || !course) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-red-400 space-y-4">
                <p>Impossible de trouver le cours demandé.</p>
                <button
                    onClick={() => router.push('/teacher/courses')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm"
                >
                    Retourner à la liste
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>✏️</span> Édition du Cours : <span className="text-teal-400">{course.titre}</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Modifiez le titre, les objectifs pédagogiques et les informations liées au cours.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/teacher/courses')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                    &larr; Annuler
                </button>
            </div>

            {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium">
                    ⚠️ {formError}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitCourse} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-sm">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
                    Informations du Cours
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Titre du Cours
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Chimie Organique - Réactions d Addition"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Classe Cible
                        </label>
                        <select
                            value={classe}
                            onChange={(e) => setClasse(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        >
                            <option value="6ème Math-Physique">6ème Math-Physique</option>
                            <option value="6ème Bio-Chimie">6ème Bio-Chimie</option>
                            <option value="4ème Littéraire">4ème Littéraire</option>
                            <option value="8ème EB (Éducation de Base)">8ème EB (Éducation de Base)</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Matière
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Chimie / Mathématiques"
                            value={matiere}
                            onChange={(e) => setMatiere(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-teal-400 mb-2">
                        Description & Objectifs Pédagogiques (Éditeur TipTap)
                    </label>
                    <TiptapEditor
                        key={courseId}
                        content={description}
                        onChange={(html) => setDescription(html)}
                        placeholder="Présentation résumée des notions clés abordées, schémas, programmes..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={() => router.push('/teacher/courses')}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={updateCourseMutation.isPending}
                        className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2.5 text-sm rounded-xl transition shadow-lg flex items-center gap-2"
                    >
                        <span>💾</span> {updateCourseMutation.isPending ? 'Mise à jour...' : 'Mettre à jour le Cours'}
                    </button>
                </div>
            </form>
        </div>
    );
}