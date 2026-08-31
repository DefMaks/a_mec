'use client';

import React, { useState } from 'react';
import { getOptimizedAvifUrl } from '@/lib/media-library';
import { Maximize2, X } from 'lucide-react';

interface RichTextViewProps {
  content: string;
  className?: string;
  fallbackText?: string;
}

/**
 * Transforms standard <img> tags in HTML strings so they automatically use optimized AVIF URLs.
 */
function enhanceHtmlWithAvif(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Replace src="url" inside img tags
  return html.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (match, before, src, after) => {
    const avifUrl = getOptimizedAvifUrl(src);
    // Add AVIF and responsive styling classes
    return `<img ${before} src="${avifUrl}" class="rounded-xl max-w-full my-3 border border-[#E2E8F0] shadow-xs mx-auto object-contain cursor-zoom-in" loading="lazy" ${after} />`;
  });
}

export function RichTextView({
  content,
  className = '',
  fallbackText = 'Aucun contenu pédagogique disponible.',
}: RichTextViewProps) {
  const [selectedZoomImg, setSelectedZoomImg] = useState<string | null>(null);

  if (!content || !content.trim()) {
    return <p className={`text-xs text-[#64748B] italic ${className}`}>{fallbackText}</p>;
  }

  const enhancedHtml = enhanceHtmlWithAvif(content);

  // Click handler to zoom images
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'img') {
      const src = (target as HTMLImageElement).src;
      if (src) setSelectedZoomImg(src);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`prose prose-sm max-w-none text-[#1E293B] text-xs leading-relaxed break-words ${className}`}
        dangerouslySetInnerHTML={{ __html: enhancedHtml }}
      />

      {/* Lightbox / Zoom Modal */}
      {selectedZoomImg && (
        <div
          onClick={() => setSelectedZoomImg(null)}
          className="fixed inset-0 bg-[#0F2C59]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white p-3 rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col items-center">
            <button
              onClick={() => setSelectedZoomImg(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2C59] text-white hover:bg-black transition z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedZoomImg}
              alt="Zoom illustration"
              className="max-h-[80vh] max-w-full rounded-xl object-contain"
            />
            <span className="text-[10px] text-[#64748B] font-semibold mt-2">
              Illustration pédagogique (Format optimisé AVIF haute fidélité)
            </span>
          </div>
        </div>
      )}
    </>
  );
}
