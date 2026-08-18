'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Link2,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { MediaLibraryModal } from './media-library-modal';
import { getOptimizedAvifUrl } from '@/lib/media-library';

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  compact?: boolean;
  label?: string;
  error?: string;
  className?: string;
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = 'Rédigez le contenu pédagogique ou l’énoncé ici...',
  minHeight = '160px',
  compact = false,
  label,
  error,
  className = '',
}: TipTapEditorProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#008080] underline font-medium hover:text-[#0F2C59]',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-3 border border-[#E2E8F0] shadow-xs mx-auto',
          loading: 'lazy',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none p-3.5 text-[#1E293B] text-xs leading-relaxed`,
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If empty paragraph, pass empty string
      if (html === '<p></p>') {
        onChange('');
      } else {
        onChange(html);
      }
    },
    immediatelyRender: false,
  });

  // Sync external value when needed (e.g. form reset or initial load)
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      if (value !== currentHtml && (value !== '' || currentHtml !== '<p></p>')) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-4 text-xs text-[#94A3B8] animate-pulse"
        style={{ minHeight }}
      >
        Initialisation de l’éditeur TipTap...
      </div>
    );
  }

  // Insert image callback from media library modal
  const handleInsertImage = (imageUrl: string, altText?: string, title?: string) => {
    // Optimize with AVIF transformation
    const avifUrl = getOptimizedAvifUrl(imageUrl);
    editor
      .chain()
      .focus()
      .setImage({
        src: avifUrl,
        alt: altText || 'Illustration pédagogique',
        title: title || undefined,
      })
      .run();
  };

  // Add Link
  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl.trim() })
        .run();
    }
    setLinkUrl('');
    setIsLinkModalOpen(false);
  };

  return (
    <div
      className={`space-y-1.5 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 flex flex-col' : ''
      } ${className}`}
    >
      {/* Label and Toolbar actions */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#0F2C59]">{label}</label>
          <span className="text-[10px] text-[#008080] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            Éditeur Enrichi TipTap & AVIF
          </span>
        </div>
      )}

      {/* Editor Container */}
      <div
        className={`bg-white border rounded-xl overflow-hidden transition-all flex flex-col ${
          editor.isFocused ? 'border-[#0F2C59] ring-2 ring-[#0F2C59]/10' : 'border-[#CBD5E1]'
        } ${error ? 'border-[#EF4444]' : ''} ${isFullscreen ? 'flex-1' : ''}`}
      >
        {/* Modern Compact / Full Toolbar */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-1.5 flex flex-wrap items-center gap-1 select-none">
          {/* Group 1: Typography */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              title="Gras (Ctrl+B)"
              className={`p-1.5 rounded-lg text-xs transition ${
                editor.isActive('bold')
                  ? 'bg-[#0F2C59] text-white font-bold'
                  : 'text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              title="Italique (Ctrl+I)"
              className={`p-1.5 rounded-lg text-xs transition ${
                editor.isActive('italic')
                  ? 'bg-[#0F2C59] text-white font-bold'
                  : 'text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Souligné (Ctrl+U)"
              className={`p-1.5 rounded-lg text-xs transition ${
                editor.isActive('underline')
                  ? 'bg-[#0F2C59] text-white font-bold'
                  : 'text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Barré"
              className={`p-1.5 rounded-lg text-xs transition ${
                editor.isActive('strike')
                  ? 'bg-[#0F2C59] text-white font-bold'
                  : 'text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group 2: Headings (shown if not ultra compact) */}
          {!compact && (
            <div className="flex items-center gap-0.5 px-1.5 border-r border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Titre H2 (Section)"
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  editor.isActive('heading', { level: 2 })
                    ? 'bg-[#0F2C59] text-[#D4AF37]'
                    : 'text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Sous-titre H3"
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  editor.isActive('heading', { level: 3 })
                    ? 'bg-[#0F2C59] text-[#D4AF37]'
                    : 'text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                H3
              </button>
            </div>
          )}

          {/* Group 3: Lists & Quotes */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Liste à puces"
              className={`p-1.5 rounded-lg text-xs transition ${
                editor.isActive('bulletList')
                  ? 'bg-[#0F2C59] text-white'
                  : 'text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Liste numérotée"
              className={`p-1.5 rounded-lg text-xs transition ${
                editor.isActive('orderedList')
                  ? 'bg-[#0F2C59] text-white'
                  : 'text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            {!compact && (
              <>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  title="Citation / Théorème"
                  className={`p-1.5 rounded-lg text-xs transition ${
                    editor.isActive('blockquote')
                      ? 'bg-[#0F2C59] text-white'
                      : 'text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  title="Bloc de formule / code"
                  className={`p-1.5 rounded-lg text-xs transition ${
                    editor.isActive('codeBlock')
                      ? 'bg-[#0F2C59] text-white'
                      : 'text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Group 4: MEDIA LIBRARY & IMAGE INSERTION (HIGHLIGHTED) */}
          <div className="flex items-center gap-1 px-1.5 border-r border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              title="Insérer une image (Upload Uploadcare, URL ou Bibliothèque dédiée AVIF)"
              className="px-2.5 py-1 bg-[#0F2C59] text-white hover:bg-[#0F2C59]/90 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline text-[11px]">Image & Médiathèque</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                setLinkUrl(previousUrl || '');
                setIsLinkModalOpen(true);
              }}
              title="Ajouter un hyperlien"
              className={`p-1.5 rounded-lg text-xs transition ${
                editor.isActive('link')
                  ? 'bg-[#008080] text-white'
                  : 'text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group 5: History & Clean */}
          <div className="flex items-center gap-0.5 ml-auto">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="Annuler (Ctrl+Z)"
              className="p-1.5 rounded-lg text-xs text-[#64748B] hover:bg-[#E2E8F0] disabled:opacity-30"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="Rétablir (Ctrl+Y)"
              className="p-1.5 rounded-lg text-xs text-[#64748B] hover:bg-[#E2E8F0] disabled:opacity-30"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
              className="p-1.5 rounded-lg text-xs text-[#64748B] hover:bg-[#E2E8F0]"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className={`overflow-y-auto ${isFullscreen ? 'flex-1 p-4' : ''}`}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-[11px] text-[#EF4444] font-medium">{error}</p>}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-[#0F2C59]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold text-[#0F2C59]">Insérer ou modifier un lien Web</h3>
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/30"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#0F2C59]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSetLink}
                className="px-4 py-1.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Media Library & Uploadcare Modal */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={handleInsertImage}
      />
    </div>
  );
}
