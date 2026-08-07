// src/components/ui/tiptap-editor.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

import {
    Undo,
    Redo,
    Bold,
    Italic,
    Strikethrough,
    Code,
    Underline as UnderlineIcon,
    Highlighter,
    Link as LinkIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Heading2,
    Subscript as SubIcon,
    Superscript as SuperIcon,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react';

interface TiptapEditorProps {
    content?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
}

export function TiptapEditor({
    content = '',
    onChange,
    placeholder = 'Commencez à rédiger...',
}: TiptapEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const supabase = getSupabaseBrowserClient();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Subscript,
            Superscript,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    'prose prose-invert max-w-none p-6 min-h-[220px] focus:outline-none text-slate-100 text-sm leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    if (!editor) {
        return (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs text-slate-500 animate-pulse">
                Chargement de l'éditeur...
            </div>
        );
    }

    const addLink = () => {
        const url = window.prompt('URL du lien :');
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    };

    // Traitement de l'upload d'image vers Supabase Storage (Bucket "quizzes" ou "uploads")
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `quiz_images/${fileName}`;

            // Upload vers le bucket Supabase
            const { data, error } = await supabase.storage
                .from('quizzes') // Assurez-vous d'avoir un bucket nommé "quizzes" (ou ajustez le nom)
                .upload(filePath, file, { upsert: true });

            if (error) throw error;

            // Récupération de l'URL publique
            const { data: publicUrlData } = supabase.storage
                .from('quizzes')
                .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
                editor.chain().focus().setImage({ src: publicUrlData.publicUrl }).run();
            }
        } catch (err: any) {
            console.error("Erreur lors de l'upload de l'image :", err.message);
            // Option de fallback : conversion en Base64 si le storage n'est pas encore configuré
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    editor.chain().focus().setImage({ src: e.target.result as string }).run();
                }
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden focus-within:border-teal-500/50 transition-all shadow-md">
            {/* Input File caché */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
            />

            {/* Top Toolbar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex items-center gap-1 flex-wrap text-slate-300 text-xs backdrop-blur-md">
                {/* Undo / Redo */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-100 transition"
                    title="Annuler"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-slate-100 transition"
                    title="Rétablir"
                >
                    <Redo className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                {/* Headings / Lists */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('heading', { level: 2 })
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Titre H2"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('bulletList')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Liste à puces"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('orderedList')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Liste numérotée"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                {/* Text Formatting */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('bold')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Gras"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('italic')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Italique"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('strike')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Barrer"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('underline')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Souligner"
                >
                    <UnderlineIcon className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('highlight')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Surligner"
                >
                    <Highlighter className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('codeBlock')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Bloc de code"
                >
                    <Code className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={addLink}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('link')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Insérer un lien"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                {/* Subscript / Superscript */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('superscript')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Exposant (x²)"
                >
                    <SuperIcon className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive('subscript')
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Indice (x₂)"
                >
                    <SubIcon className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                {/* Text Alignment */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive({ textAlign: 'left' })
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Aligner à gauche"
                >
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive({ textAlign: 'center' })
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Centrer"
                >
                    <AlignCenter className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive({ textAlign: 'right' })
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Aligner à droite"
                >
                    <AlignRight className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`p-1.5 rounded-lg transition ${editor.isActive({ textAlign: 'justify' })
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                        }`}
                    title="Justifier"
                >
                    <AlignJustify className="w-4 h-4" />
                </button>

                <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                {/* Upload Image Button */}
                <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition disabled:opacity-50"
                    title="Uploader une image depuis votre ordinateur"
                >
                    {isUploading ? (
                        <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                    ) : (
                        <ImageIcon className="w-4 h-4 text-teal-400" />
                    )}
                </button>
            </div>

            {/* Surface d'édition */}
            <EditorContent editor={editor} placeholder={placeholder} />
        </div>
    );
}