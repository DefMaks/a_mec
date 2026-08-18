'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { TipTapEditorProps } from './tiptap-editor-inner';

const TipTapEditorDynamic = dynamic<TipTapEditorProps>(
  () => import('./tiptap-editor-inner').then((mod) => mod.TipTapEditorInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-4 text-xs text-[#94A3B8] animate-pulse flex items-center justify-between min-h-[140px]">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-[#E2E8F0] rounded"></div>
          <div className="h-2.5 w-64 bg-[#E2E8F0] rounded"></div>
        </div>
        <span className="text-[10px] text-[#94A3B8]">Chargement de l’éditeur TipTap...</span>
      </div>
    ),
  }
);

export function TipTapEditor(props: TipTapEditorProps) {
  return <TipTapEditorDynamic {...props} />;
}

export type { TipTapEditorProps };
